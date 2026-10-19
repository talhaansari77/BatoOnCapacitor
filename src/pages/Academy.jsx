import CareText from "@/components/CareText";
import {useLocation} from "@/components/LocationContext";
import CustomerLoadState from "@/components/CustomerLoadState";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  GraduationCap, 
  BookOpen, 
  Video,
  FileText,
  Award,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle2,
  Play,
  Download,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import ContentCard from "../components/academy/ContentCard";
import CourseViewer from "../components/academy/CourseViewer";
import ProgressTracker from "../components/academy/ProgressTracker";
import BatoEmptyState from "@/components/ui/BatoEmptyState";

export default function Academy() {
  const {t,isRTL}=useLocation();
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      setAccountError(true);
    }
  };

  const { data: academyContent = [], isPending: academyContentPending, isError: academyContentError } = useQuery({
    queryKey: ['academyContent'],
    queryFn: async () => {
      return await base44.entities.AcademyContent.filter({ 
        is_published: true 
      }, 'order_index');
    },
    enabled: !!user,
  });

  const { data: userProgress = [], isPending: userProgressPending, isError: userProgressError } = useQuery({
    queryKey: ['academyProgress', user?.email],
    queryFn: async () => {
      return await base44.entities.AcademyProgress.filter({
        client_email: user.email
      });
    },
    enabled: !!user,
  });

  const { data: clientLifecycle = null, isPending: clientLifecyclePending, isError: clientLifecycleError } = useQuery({
    queryKey: ['clientLifecycle', user?.email],
    queryFn: async () => {
      const lifecycle = await base44.entities.ClientLifecycle.filter({ 
        client_email: user.email 
      });
      return lifecycle[0] || null;
    },
    enabled: !!user,
  });

  const startContentMutation = useMutation({
    mutationFn: async ({ contentId }) => {
      const existing = userProgress.find(p => p.content_id === contentId);
      if (existing) {
        if(existing.status === 'completed')return existing;
        return await base44.entities.AcademyProgress.update(existing.id, {
          status: 'in_progress',
          started_date: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });
      } else {
        return await base44.entities.AcademyProgress.create({
          client_email: user.email,
          content_id: contentId,
          status: 'in_progress',
          started_date: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });
      }
    },
    onError:()=>toast.error(t('Could not save learning progress. Try again.','تعذر حفظ تقدم التعلّم. حاول مرة أخرى.')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academyProgress'] });
    },
  });

  const completeContentMutation = useMutation({
    mutationFn: async ({ contentId, content }) => {
      const existing = userProgress.find(p => p.content_id === contentId);
      if(existing?.status === 'completed')return existing;
      const progressData = {
        status: 'completed',
        progress_percentage: 100,
        completed_date: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        points_earned: content.points_reward
      };

      let result;
      if (existing) {
        result = await base44.entities.AcademyProgress.update(existing.id, progressData);
      } else {
        result = await base44.entities.AcademyProgress.create({
          client_email: user.email,
          content_id: contentId,
          started_date: new Date().toISOString(),
          ...progressData
        });
      }

      // Award points to ClientLifecycle
      if (clientLifecycle) {
        await base44.entities.ClientLifecycle.update(clientLifecycle.id, {
          loyalty_points: (clientLifecycle.loyalty_points || 0) + content.points_reward
        });
      }

      // Update completion count
      await base44.entities.AcademyContent.update(contentId, {
        completion_count: (content.completion_count || 0) + 1
      });

      // Create notification
      await base44.entities.Notification.create({
        client_email: user.email,
        type: 'general',
        title: '🎓 Learning Milestone Achieved!',
        message: `Congratulations! You've completed "${content.title}" and earned ${content.points_reward} loyalty points!`,
        priority: 'normal'
      });

      return result;
    },
    onError:()=>{queryClient.invalidateQueries({queryKey:['academyProgress']});queryClient.invalidateQueries({queryKey:['clientLifecycle']});toast.error(t('Completion was not confirmed. Please refresh your progress before retrying.','لم يتم تأكيد الاكتمال. حدّث تقدمك قبل المحاولة مجدداً.'));},
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['clientLifecycle'] });
      setSelectedContent(null);
      toast.success(t('Learning progress saved.','تم حفظ تقدم التعلّم.'));
    },
  });

  if(accountError||academyContentError||userProgressError||clientLifecycleError)return <CustomerLoadState error/>;
  if(!user||academyContentPending||userProgressPending||clientLifecyclePending)return <CustomerLoadState/>;
  const categories = [
    { value: 'hair_care', label: t("Hair Care","العناية بالشعر"), icon: '💇' },
    { value: 'treatment_prep', label: t("Treatment Prep","الاستعداد للعلاج"), icon: '📋' },
    { value: 'recovery', label: t("Recovery","التعافي"), icon: '🏥' },
    { value: 'maintenance', label: t("Maintenance","الحفاظ على النتائج"), icon: '🔧' },
    { value: 'lifestyle', label: t("Lifestyle","نمط الحياة"), icon: '🌟' },
    { value: 'nutrition', label: t("Nutrition","التغذية"), icon: '🥗' },
    { value: 'science', label: t("Science","المعلومات العلمية"), icon: '🔬' },
    { value: 'testimonials', label: t("Testimonials","تجارب العملاء"), icon: '💬' }
  ];

  const contentTypes = [
    { value: 'course', label: t("Courses","الدورات"), icon: GraduationCap },
    { value: 'guide', label: t("Guides","الأدلة"), icon: BookOpen },
    { value: 'video', label: t("Videos","الفيديوهات"), icon: Video },
    { value: 'article', label: t("Articles","المقالات"), icon: FileText },
    { value: 'webinar', label: t("Webinars","الندوات"), icon: Video },
    { value: 'tutorial', label: t("Tutorials","الشروحات"), icon: Play }
  ];

  const filteredContent = academyContent.filter(content => {
    const matchesSearch = String(content.title||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || content.category === categoryFilter;
    const matchesType = typeFilter === 'all' || content.content_type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredContent = academyContent.filter(c => c.is_featured).slice(0, 3);

  // Start/Continue: the first real unfinished lesson, else the first published lesson — never invented content.
  const continueContent = academyContent.find(c => userProgress.some(p => p.content_id === c.id && p.status === 'in_progress')) || null;
  const startContent = continueContent
    || academyContent.find(c => !userProgress.some(p => p.content_id === c.id && p.status === 'completed'))
    || academyContent[0]
    || null;

  const allCompleted = startContent && userProgress.some(p=>p.content_id===startContent.id && p.status==="completed");

  // Calculate stats
  const totalCompleted = new Set(userProgress.filter(p => p.status === 'completed' && academyContent.some(c=>c.id===p.content_id)).map(p=>p.content_id)).size;
  const totalInProgress = userProgress.filter(p => p.status === 'in_progress').length;
  const totalPoints = userProgress.reduce((sum, p) => sum + (p.points_earned || 0), 0);

  const handleStartContent = (content) => {
    if(startContentMutation.isPending)return;
    if(userProgress.some(p=>p.content_id===content.id&&p.status==='completed')){setSelectedContent(content);return;}
    startContentMutation.mutate({ contentId: content.id });
    setSelectedContent(content);
  };

  const handleCompleteContent = (content) => {
    if(completeContentMutation.isPending||startContentMutation.isPending)return;
    completeContentMutation.mutate({ contentId: content.id, content });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL?"rtl":"ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 shrink-0" />{t("BATO's Academy","أكاديمية باتو")}</h1>
                <p className="text-blue-100">{t("Learn about health & beauty and earn loyalty points","تعلّم عن الصحة والجمال واكسب نقاط المكافآت")}</p>
              </div>
              <div className="flex w-full sm:w-auto items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
                <p className="text-blue-100 text-xs">{t("Your Learning Points","نقاط تعلّمك")}</p>
                <p className="text-xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </div>

          {/* Start / Continue — selects the relevant unfinished lesson, falling back to the first published lesson */}
          {startContent && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {continueContent ? t("Continue where you left off","تابع من حيث توقفت") : allCompleted ? t("Revisit your learning","راجع ما تعلمته") : userProgress.length ? t("Your next lesson","درسك التالي") : t("Start your first lesson","ابدأ درسك الأول")}
                </p>
                <p className="text-sm font-medium text-gray-900 leading-6 break-words"><CareText value={startContent.title} /></p>
              </div>
              <Button onClick={() => handleStartContent(startContent)} disabled={startContentMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-h-11 px-4 flex-shrink-0">
                <Play className="w-4 h-4 me-2" />{continueContent ? t("Continue","متابعة") : allCompleted ? t("Review","مراجعة") : t("Start","ابدأ")}
              </Button>
            </div>
          )}

          {/* Compact learning progress strip */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm" aria-label={t("Learning progress","تقدم التعلّم")}>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="font-semibold text-gray-900">{totalCompleted}</span><span className="text-gray-500">{t("completed","مكتمل")}</span></span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-600" /><span className="font-semibold text-gray-900">{totalInProgress}</span><span className="text-gray-500">{t("in progress","قيد التعلّم")}</span></span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-600" /><span className="font-semibold text-gray-900">{academyContent.length}</span><span className="text-gray-500">{t("available","متاح")}</span></span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-yellow-600" /><span className="font-semibold text-gray-900">{totalPoints}</span><span className="text-gray-500">{t("points","نقطة")}</span></span>
          </div>

          {/* Featured Content */}
          {featuredContent.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />{t("Featured Learning","محتوى مميز")}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredContent.map(content => {
                  const progress = userProgress.find(p => p.content_id === content.id);
                  return (
                    <ContentCard
                      key={content.id}
                      content={content}
                      progress={progress}
                      onStart={() => handleStartContent(content)}
                      featured
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3">
                <div className="min-w-0 min-[390px]:col-span-2 relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder={t("Search courses, guides, articles...","ابحث عن الدورات والأدلة والمقالات…")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("All Categories","جميع الفئات")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Categories","جميع الفئات")}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("All Types","جميع الأنواع")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Types","جميع الأنواع")}</SelectItem>
                    {contentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Library */}
          <Tabs dir={isRTL ? "rtl" : "ltr"} defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-2 min-[390px]:grid-cols-4 h-auto gap-1">
              <TabsTrigger value="all">{t("All Content","جميع المحتويات")}</TabsTrigger>
              <TabsTrigger value="in-progress">{t("In Progress","قيد التعلّم")}</TabsTrigger>
              <TabsTrigger value="completed">{t("Completed","مكتمل")}</TabsTrigger>
              <TabsTrigger value="new">{t("New","جديد")}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {filteredContent.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {filteredContent.map(content => {
                    const progress = userProgress.find(p => p.content_id === content.id);
                    return (
                      <ContentCard
                        key={content.id}
                        content={content}
                        progress={progress}
                        onStart={() => handleStartContent(content)}
                      />
                    );
                  })}
                </div>
              ) : (searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') ? (
                <BatoEmptyState
                  icon={Search}
                  title={t("No results for these filters","لا توجد نتائج لهذه الخيارات")}
                  description={t("Try a different word or clear the filters to see the whole library.","جرّب كلمة مختلفة أو أزل الخيارات لرؤية المكتبة كاملة.")}
                  action={<Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setTypeFilter('all'); }}>{t("Clear filters","إزالة الخيارات")}</Button>}
                />
              ) : (
                <BatoEmptyState
                  icon={BookOpen}
                  title={t("No published lessons yet","لا توجد دروس منشورة بعد")}
                  description={t("New lessons appear here as soon as the team publishes them.","تظهر الدروس الجديدة هنا فور نشرها من الفريق.")}
                />
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-6">{!userProgress.some(p=>p.status==="in_progress"&&filteredContent.some(c=>c.id===p.content_id))&&<p className="p-4">{t("No lessons in progress match these filters. Start with the content library.","لا توجد دروس قيد التعلّم تطابق هذه الخيارات. ابدأ من مكتبة المحتوى.")}</p>}
              <div className="grid md:grid-cols-3 gap-6">
                {userProgress
                  .filter(p => p.status === 'in_progress')
                  .map(progress => {
                    const content = filteredContent.find(c => c.id === progress.content_id);
                    if (!content) return null;
                    return (
                      <ContentCard
                        key={content.id}
                        content={content}
                        progress={progress}
                        onStart={() => handleStartContent(content)}
                      />
                    );
                  })}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">{!userProgress.some(p=>p.status==="completed"&&filteredContent.some(c=>c.id===p.content_id))&&<p className="p-4">{t("No completed lessons match these filters yet.","لا توجد دروس مكتملة تطابق هذه الخيارات بعد.")}</p>}
              <div className="grid md:grid-cols-3 gap-6">
                {userProgress
                  .filter(p => p.status === 'completed')
                  .map(progress => {
                    const content = filteredContent.find(c => c.id === progress.content_id);
                    if (!content) return null;
                    return (
                      <ContentCard
                        key={content.id}
                        content={content}
                        progress={progress}
                        onStart={() => handleStartContent(content)}
                      />
                    );
                  })}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {academyContent
                  .filter(content => !userProgress.find(p => p.content_id === content.id))
                  .slice(0, 12)
                  .map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      progress={null}
                      onStart={() => handleStartContent(content)}
                      isNew
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Full progress and achievements — expandable, below the learning library */}
          <details className="border border-gray-200 rounded-2xl bg-white">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-gray-900">
              {t("Your learning progress", "تقدمك في التعلّم")}
            </summary>
            <div className="px-2 pb-2">
              <ProgressTracker
                userProgress={userProgress}
                academyContent={academyContent}
                totalPoints={totalPoints}
              />
            </div>
          </details>
        </div>
      </div>

      {/* Course Viewer Modal */}
      {selectedContent && (
        <CourseViewer
          content={selectedContent}
          progress={userProgress.find(p => p.content_id === selectedContent.id)}
          onClose={() => setSelectedContent(null)}
          saving={completeContentMutation.isPending||startContentMutation.isPending}
          onComplete={() => handleCompleteContent(selectedContent)}
        />
      )}
    </div>
  );
}