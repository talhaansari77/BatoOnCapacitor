import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronRight, FileText, Search, Stethoscope, RefreshCw } from 'lucide-react';
import { useLocation } from '@/components/LocationContext';
import { getPatientReports, getPatientReportDetail } from '@/native/patientApi';

const value = (v) => v == null || v === '' || v === 'N/A' ? '—' : String(v);
function DetailFields({ data, ar = false }) {
  const t = (en, arabic) => ar ? arabic : en;
  if (!data || typeof data !== 'object') return <p className="text-gray-500">{t('No report details were returned.', 'لم يتم إرجاع تفاصيل التقرير.')}</p>;
  const report = data.report && typeof data.report === 'object' ? data.report : data;
  const tests = Array.isArray(report.tests) ? report.tests : [];
  const flagStyle = (flag) => flag === 'High' || flag === 'Low' ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-gray-700 bg-gray-50 border-gray-200';
  return <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        [t('Report Date', 'تاريخ التقرير'), report.report_date],
        [t('Doctor', 'الطبيب'), report.doctor_name],
        [t('Conclusion', 'الخلاصة'), report.conclusion],
      ].map(([label, field]) => <div key={label} className="rounded-xl border border-[#e8dfd4] p-4 bg-white/70"><div className="text-xs text-gray-500 mb-1">{label}</div><div className="font-medium text-[#3a2e1e] break-words">{value(field)}</div></div>)}
    </div>
    <section><h3 className="font-semibold text-lg mb-3">{t('Tests', 'الفحوصات')}</h3>
      {tests.length === 0 ? <p className="text-gray-500">{t('No tests recorded.', 'لا توجد فحوصات مسجلة.')}</p> : <div className="space-y-2">{tests.map((test, i) => <div key={test?.id ?? i} className="rounded-xl border border-[#e8dfd4] bg-white/70 p-4 text-sm break-words space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="font-semibold text-base">{value(test.test_name)}</div>{test.flag && <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-medium ${flagStyle(test.flag)}`}>{test.flag}</span>}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><div className="text-xs text-gray-500">{t('Result', 'النتيجة')}</div><div className="font-medium">{value(test.test_value)}{test.unit ? ` ${test.unit}` : ''}</div></div>
          <div><div className="text-xs text-gray-500">{t('Normal Range', 'النطاق الطبيعي')}</div><div className="font-medium">{value(test.normal_range)}</div></div>
        </div>
        {test.remarks && <div><div className="text-xs text-gray-500">{t('Remarks', 'ملاحظات')}</div><div>{test.remarks}</div></div>}
      </div>)}</div>}
    </section>
    {report.pdf_attachment && typeof report.pdf_attachment === 'string' && /^https:\/\//i.test(report.pdf_attachment) && <a href={report.pdf_attachment} target="_blank" rel="noopener noreferrer" className="underline text-[#3a2e1e]">{t('View attached PDF', 'عرض ملف PDF المرفق')}</a>}
  </div>;
}

export default function MedicalReports() {
  const { language } = useLocation();
  const ar = language === 'ar';
  const t = (en, arabic) => ar ? arabic : en;
  const [params, setParams] = useSearchParams();
  const token = params.get('report');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('all');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    getPatientReports({ range, search }).then(data => {
      if (!cancelled) setReports(data.reports);
    }).catch(err => { if (!cancelled) setError(err.message || 'Unable to load reports.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range, search, retry]);

  useEffect(() => {
    if (!token) { setDetail(null); setDetailError(''); return; }
    let cancelled = false;
    setDetail(null); setDetailLoading(true); setDetailError('');
    getPatientReportDetail(token).then(data => { if (!cancelled) setDetail(data); })
      .catch(err => { if (!cancelled) setDetailError(err.message || 'Unable to load report details.'); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [token, retry]);

  const open = (reportToken) => { if (reportToken) setParams({ report: reportToken }); };
  const back = () => setParams({});
  return <main className="min-h-screen px-5 sm:px-8 py-9" style={{background:'#eeebe6',color:'#3a2e1e'}}>
    <div className="max-w-4xl mx-auto space-y-6">
      {token ? <button onClick={back} className="inline-flex items-center gap-2 text-sm font-medium"><ArrowLeft size={18}/>{t('All Medical Reports','كل التقارير الطبية')}</button> : null}
      <div><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{token ? t('Report Details','تفاصيل التقرير') : t('Medical Reports','التقارير الطبية')}</h1><p className="text-gray-500 mt-1">{token ? t('Your medical report information','معلومات تقريرك الطبي') : t('Your clinic reports and test results','تقارير العيادة ونتائج الفحوصات')}</p></div>
      {token ? <section className="bg-[#faf9f7] rounded-3xl p-5 sm:p-7 border border-[#e6ded4]">
        {detailLoading ? <p className="text-gray-500">{t('Loading report details…','جارٍ تحميل تفاصيل التقرير…')}</p> : detailError ? <div className="space-y-3"><p role="alert" className="text-red-700">{detailError}</p><button onClick={()=>setRetry(n=>n+1)} className="underline">{t('Retry','إعادة المحاولة')}</button></div> : <DetailFields data={detail} ar={ar} />}
      </section> : <>
        <div className="flex flex-col sm:flex-row gap-3"><label className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/><input aria-label={t('Search reports','البحث في التقارير')} value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Search reports','البحث في التقارير')} className="w-full rounded-xl border border-[#ddd2c5] bg-white/80 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#c4aa8b]"/></label><select aria-label={t('Date range','الفترة الزمنية')} value={range} onChange={e=>setRange(e.target.value)} className="rounded-xl border border-[#ddd2c5] bg-white/80 px-4 py-3"><option value="all">{t('All time','كل الفترات')}</option><option value="7">{t('Last 7 days','آخر ٧ أيام')}</option><option value="30">{t('Last 30 days','آخر ٣٠ يومًا')}</option><option value="90">{t('Last 90 days','آخر ٩٠ يومًا')}</option><option value="180">{t('Last 180 days','آخر ١٨٠ يومًا')}</option><option value="365">{t('Last year','العام الماضي')}</option></select></div>
        {loading ? <div className="rounded-3xl bg-white/80 p-8 text-gray-500">{t('Loading reports…','جارٍ تحميل التقارير…')}</div> : error ? <div className="rounded-3xl bg-white/80 p-6 space-y-3"><p role="alert" className="text-red-700">{error}</p><button onClick={()=>setRetry(n=>n+1)} className="inline-flex items-center gap-2 underline"><RefreshCw size={16}/>{t('Retry','إعادة المحاولة')}</button></div> : reports.length === 0 ? <div className="rounded-3xl bg-white/80 p-8 text-center text-gray-500"><FileText className="mx-auto mb-3"/>{t('No medical reports found','لا توجد تقارير طبية')}</div> : <div className="space-y-3">{reports.map((report, i) => <button key={report.report_token || report.id || i} onClick={()=>open(report.report_token)} disabled={!report.report_token} className="w-full text-left rounded-3xl border border-[#e6ded4] bg-[#faf9f7] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow disabled:opacity-60"><div className="flex gap-3 items-start"><div className="p-3 rounded-xl bg-[#eee7dd]"><FileText size={23}/></div><div className="flex-1 min-w-0"><div className="font-semibold text-lg">{value(report.doctor_name)}</div><div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500"><span className="inline-flex items-center gap-1"><CalendarDays size={15}/>{value(report.report_date)}</span><span className="inline-flex items-center gap-1"><Stethoscope size={15}/>{Number(report.total_tests_count) || (report.tests || []).length} {t('tests','فحوصات')}</span></div>{report.conclusion && <p className="mt-3 text-sm">{report.conclusion}</p>}{Array.isArray(report.tests) && report.tests.length > 0 && <p className="mt-2 text-xs text-gray-500">{report.tests.join(' · ')}</p>}</div><ChevronRight size={20} className="mt-3 shrink-0"/></div></button>)}</div>}
      </>}
    </div>
  </main>;
}
