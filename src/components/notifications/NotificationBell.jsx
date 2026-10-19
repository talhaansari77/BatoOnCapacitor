import React from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {Bell} from 'lucide-react';
import {base44} from '@/api/base44Client';
import {useLocation} from '@/components/LocationContext';
import {visibleNotifications} from '@/lib/customerNavigation';
export default function NotificationBell({userEmail}){
 const {t}=useLocation();const query=useQuery({queryKey:['notifications',userEmail],queryFn:async()=>visibleNotifications(await base44.entities.Notification.filter({client_email:userEmail},'-created_date',50)),enabled:!!userEmail,refetchInterval:30000});
 const count=(query.data||[]).filter(n=>!n.is_read).length;
 return <Link to="/Updates" aria-label={t('Updates','التحديثات')+(count?' · '+count+' '+t('unread','غير مقروءة'):'')} className="relative w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100"><Bell className="w-5 h-5"/>{count>0&&<span aria-hidden="true" className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{count>9?'9+':count}</span>}</Link>;
}
