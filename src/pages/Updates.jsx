import CareText from "@/components/CareText";
import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Bell} from 'lucide-react';
import {useLocation} from '@/components/LocationContext';
import {visibleNotifications,notificationDestination} from '@/lib/customerNavigation';
import {useCustomerAccount} from '@/hooks/useCustomerAccount';
import CustomerLoadState from '@/components/CustomerLoadState';
import {customerDate} from '@/lib/customerDate';
export default function Updates(){
 const {t,isRTL}=useLocation();const account=useCustomerAccount();const user=account.data;const qc=useQueryClient();const [savingAll,setSavingAll]=useState(false);const [saveError,setSaveError]=useState(false);
 const query=useQuery({queryKey:['notifications',user?.email],queryFn:async()=>visibleNotifications(await base44.entities.Notification.filter({client_email:user.email},'-created_date',50)),enabled:!!user,refetchInterval:30000});
 const rows=query.data||[];const unread=rows.filter(n=>!n.is_read);
 const mark=useMutation({mutationFn:id=>base44.entities.Notification.update(id,{is_read:true,read_date:new Date().toISOString()}),onSuccess:()=>{setSaveError(false);qc.invalidateQueries({queryKey:['notifications',user.email]});},onError:()=>setSaveError(true)});
 const markAll=async()=>{if(savingAll)return;setSavingAll(true);const results=await Promise.allSettled(unread.map(n=>base44.entities.Notification.update(n.id,{is_read:true,read_date:new Date().toISOString()})));setSaveError(results.some(r=>r.status==='rejected'));await qc.invalidateQueries({queryKey:['notifications',user.email]});setSavingAll(false);};
 if(account.isError||query.isError)return <CustomerLoadState error onRetry={()=>{account.refetch();query.refetch();}}/>;
 if(!user||query.isPending)return <CustomerLoadState/>;
 return <div className="max-w-lg mx-auto px-4 py-5 space-y-4 text-[#3a2e1e]" dir={isRTL?'rtl':'ltr'}>
  <h1 className="text-2xl font-bold">{t('Updates','التحديثات')}</h1><p className="text-sm text-[#7c8689]">{t('Your latest 50 reminders, notices and care updates from BATO.','آخر ٥٠ تذكيراً وإشعاراً وتحديث رعاية من باتو.')}</p>
  {unread.length>0&&<div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm">{t('Unread updates: ','التحديثات غير المقروءة: ')}{unread.length}</span><button disabled={savingAll||mark.isPending} onClick={markAll} className="underline p-2">{savingAll?t('Saving…','جارٍ الحفظ…'):t('Mark all read','وضع علامة مقروء على الكل')}</button></div>}
  {saveError&&<p role="alert" className="text-sm text-red-700">{t('Some updates could not be marked as read. Please try again.','تعذر وضع علامة مقروء على بعض التحديثات. حاول مرة أخرى.')}</p>}
  {!rows.length&&<section className="bg-white rounded-2xl p-8 text-center"><Bell className="mx-auto mb-3"/><h2 className="font-semibold">{t('No updates yet','لا توجد تحديثات بعد')}</h2><p className="text-sm mt-2 text-[#7c8689]">{t('Your reminders and care updates will appear here.','ستظهر تذكيراتك وتحديثات رعايتك هنا.')}</p></section>}
  {rows.map(n=>{const destination=notificationDestination(n.action_url);const route=(destination||"").split("?")[0].toLowerCase();const names={"/clinicappointments":t("View appointment","عرض الموعد"),"/messages":t("Open messages","افتح الرسائل"),"/academy":t("Open Academy","افتح الأكاديمية"),"/orders":t("View order","عرض الطلب"),"/mybilling":t("View billing","عرض الفواتير"),"/hairjourney":t("View hair journey","عرض رحلة الشعر")};const destinationLabel=names[route]||t("View details","عرض التفاصيل");const typeLabel=({general:t("Notice","إشعار"),appointment_reminder:t("Appointment","موعد"),payment_reminder:t("Billing","فواتير"),care_update:t("Care update","تحديث رعاية"),message:t("Message","رسالة")})[n.type]||t("Update","تحديث");return <section key={n.id} className={'rounded-2xl bg-white border p-4 space-y-3 '+(!n.is_read?'border-[#c4aa8b]':'border-[#eeebe6]')}>
   <span className="inline-block rounded-full bg-[#eeebe6] px-2.5 py-1 text-xs text-[#7c8689]">{typeLabel}</span>
   <div className="flex justify-between gap-3"><h2 className="font-semibold break-words min-w-0 flex items-start gap-2">{!n.is_read&&<span aria-label={t('Unread','غير مقروء')} className="mt-1.5 w-2 h-2 rounded-full bg-[#c4aa8b] shrink-0" />}<span className="break-words min-w-0"><CareText value={n.title} /></span></h2>{!n.is_read&&<span className="shrink-0 text-xs font-semibold">{t('New','جديد')}</span>}</div>
    {['urgent','high'].includes(n.priority)&&<p className="text-xs inline-block rounded-full px-2 py-0.5" style={{ background: n.priority==='urgent'?'#fef2f2':'#fff7ed', color: n.priority==='urgent'?'#9b1c1c':'#9a3412' }}>{n.priority==='urgent'?t('Urgent','عاجل'):t('Important','مهم')}</p>}
   <p className="text-sm whitespace-pre-wrap break-words"><CareText value={n.message} prose /></p><p className="text-xs text-[#7c8689]">{customerDate(n.created_date,isRTL)}</p>
   <div className="flex flex-wrap gap-3">{destination&&<Link className="rounded-xl bg-[#3a2e1e] text-white px-4 py-3 text-sm" to={destination} onClick={()=>{if(!n.is_read)mark.mutate(n.id);}}>{destinationLabel}</Link>}{!n.is_read&&<button disabled={mark.isPending||savingAll} className="underline p-2 text-sm" onClick={()=>mark.mutate(n.id)}>{t('Mark read','وضع علامة مقروء')}</button>}</div>
  </section>;})}
 </div>;
}