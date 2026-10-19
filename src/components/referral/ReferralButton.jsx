import React from 'react';
import {Link} from 'react-router-dom';
import {Gift} from 'lucide-react';
import {useLocation} from '@/components/LocationContext';
export default function ReferralButton(){const {t}=useLocation();return <Link to="/Profile?tab=referrals" aria-label={t('Referrals','دعوات الأصدقاء')} className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"><Gift className="w-5 h-5"/></Link>;}
