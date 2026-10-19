import CareText from "@/components/CareText";
import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {useCustomerAccount} from '@/hooks/useCustomerAccount';
import CustomerLoadState from '@/components/CustomerLoadState';
import {useLocation} from '@/components/LocationContext';
import {formatMoney,currencyTotals} from '@/lib/commerce';
import {customerDate} from '@/lib/customerDate';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
const readAll=async(entity,email,sort)=>{const rows=[];for(let skip=0;;skip+=100){const page=await base44.entities[entity].filter({client_email:email},sort,100,skip);rows.push(...page);if(page.length<100)return rows;}};
export default function MyBilling(){
 const {t,isRTL,language}=useLocation();const account=useCustomerAccount();const user=account.data;const [tab,setTab]=useState('invoices');const [selected,setSelected]=useState(null);
 const query=useQuery({queryKey:['customerBilling',user?.email],enabled:!!user,queryFn:async()=>{const [invoices,payments,packages,orders]=await Promise.all([readAll('Invoice',user.email,'-issue_date'),readAll('Payment',user.email,'-payment_date'),readAll('Package',user.email,'-created_date'),readAll('Order',user.email,'-created_date')]);return {invoices:invoices.filter(i=>i.status!=='draft'),payments,packages,orders};},refetchOnMount:'always'});
 if(account.isError||query.isError)return <CustomerLoadState error onRetry={()=>{account.refetch();query.refetch();}}/>;
 if(!user||query.isPending)return <CustomerLoadState/>;
 const {invoices,payments,packages,orders}=query.data;
 const money=(amount,record)=>formatMoney(amount,record?.currency,language);
 const paymentRecords=payments.map(p=>({...p,currency:p.currency||invoices.find(i=>i.id===p.invoice_id)?.currency}));
 const invoicePayments=selected?paymentRecords.filter(p=>p.invoice_id===selected.id):[];
 const labels={sent:t('Issued','صادرة'),paid:t('Paid','مدفوعة'),partially_paid:t('Partially paid','مدفوعة جزئياً'),overdue:t('Overdue','متأخرة'),cancelled:t('Cancelled','ملغاة'),success:t('Paid','مدفوعة'),pending:t('Pending','قيد الانتظار'),failed:t('Failed','فشلت'),refunded:t('Refunded','مستردة'),active:t('Active','نشطة'),completed:t('Completed','مكتملة'),expired:t('Expired','منتهية')};
 const billingTabs=['invoices','payments','packages','orders'];
 const handleTabKey=(event)=>{
  const current=billingTabs.indexOf(tab);
  let next;
  if(event.key==='Home')next=0;
  else if(event.key==='End')next=billingTabs.length-1;
  else if(event.key==='ArrowRight')next=(current+(isRTL?-1:1)+billingTabs.length)%billingTabs.length;
  else if(event.key==='ArrowLeft')next=(current+(isRTL?1:-1)+billingTabs.length)%billingTabs.length;
  else return;
  event.preventDefault();setTab(billingTabs[next]);
  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
 };
 const ask=invoice=>'/Messages?channel=client_care&context=invoice&invoice='+encodeURIComponent(invoice.invoice_number||invoice.id);
 const summary=[{label:t('Recorded payments','المدفوعات المسجلة'),value:currencyTotals(paymentRecords.filter(p=>p.status==='success'),'amount',language)},{label:t('Outstanding balance','الرصيد المستحق'),value:currencyTotals(invoices.filter(i=>i.status!=='cancelled'),'balance_due',language)}];
 return <div className="max-w-2xl mx-auto p-4 space-y-5 text-[#3a2e1e]" dir={isRTL?'rtl':'ltr'}>
  <h1 className="text-2xl font-bold">{t('Billing & Payments','الفواتير والمدفوعات')}</h1><p className="text-sm text-[#7c8689]">{t('Your recorded invoices, payments, packages and orders.','فواتيرك ومدفوعاتك وباقاتك وطلباتك المسجلة.')}</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{summary.map(s=><section key={s.label} className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5"><h2 className="text-xs text-[#7c8689]">{s.label}</h2><p className="text-lg font-semibold mt-2 break-words tabular-nums">{s.value}</p></section>)}</div>
  <p className="text-xs text-[#7c8689]">{t('Amounts in different currencies are shown separately. Contact Customer service to discuss payment or request a receipt.','تُعرض مبالغ العملات المختلفة بشكل منفصل. تواصل مع خدمة العملاء لمناقشة الدفع أو طلب إيصال.')}</p>
  <div role="tablist" aria-label={t('Billing records','سجلات الفواتير')} className="grid grid-cols-2 min-[390px]:grid-cols-4 gap-2">{[['invoices',t('Invoices','الفواتير')],['payments',t('Payments','المدفوعات')],['packages',t('Packages','الباقات')],['orders',t('Orders','الطلبات')]].map(([key,title])=><button key={key} role="tab" id={"billing-tab-"+key} tabIndex={tab===key?0:-1} onKeyDown={handleTabKey} aria-selected={tab===key} aria-controls={'billing-'+key} onClick={()=>setTab(key)} className={'rounded-xl px-4 py-3 text-sm '+(tab===key?'bg-[#3a2e1e] text-white':'bg-white')}>{title}</button>)}</div>
  <div role="tabpanel" aria-labelledby={"billing-tab-"+tab} tabIndex={0} id={'billing-'+tab} className="space-y-3">
   {!query.data[tab].length&&<p className="bg-white p-6 rounded-2xl">{t('No records here yet.','لا توجد سجلات هنا بعد.')}</p>}
   {tab==='invoices'&&invoices.map(i=><section key={i.id} className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5 space-y-3"><div className="flex justify-between flex-wrap gap-2"><h2 className="font-semibold min-w-0 break-all">{i.invoice_number||t('Invoice','فاتورة')}</h2><span className="text-sm">{labels[i.status]||t('Check with Customer service','تحقق مع خدمة العملاء')}</span></div><p className="text-xs">{t('Issued: ','تاريخ الإصدار: ')}{customerDate(i.issue_date,isRTL)}</p><p className="text-sm space-y-1"><span className="block">{t('Total: ','الإجمالي: ')}{money(i.total_amount,i)}</span><span className="block font-semibold">{t('Balance due: ','الرصيد المستحق: ')}{money(i.balance_due,i)}</span></p><button className="underline py-2 min-h-11" onClick={()=>setSelected(i)}>{t('View invoice','عرض الفاتورة')}</button><Link className="bato-action-link w-full underline py-3" to={ask(i)}>{t('Request receipt or discuss payment','اطلب إيصالاً أو ناقش الدفع')}</Link></section>)}
   {tab==='payments'&&paymentRecords.map(p=><section key={p.id} className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5 space-y-2"><p className="font-semibold">{money(p.amount,p)}</p><p className="text-sm">{labels[p.status]||t('Check with Customer service','تحقق مع خدمة العملاء')}</p><p className="text-xs">{customerDate(p.payment_date,isRTL)}</p>{p.transaction_id&&<p className="text-xs break-all">{t('Reference: ','المرجع: ')}{p.transaction_id}</p>}</section>)}
   {tab==='packages'&&packages.map(p=><section key={p.id} className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5 space-y-2"><h2 className="font-semibold"><CareText value={p.package_name} /></h2><p className="text-sm">{labels[p.status]||t('Check with Customer service','تحقق مع خدمة العملاء')}</p><Link to="/TreatmentPlan" className="bato-action-link w-full underline py-3">{t('View care programs','عرض برامج الرعاية')}</Link></section>)}
   {tab==='orders'&&<Link to="/Orders" className="block bg-white p-4 rounded-2xl underline">{t('View order details and status','عرض تفاصيل الطلبات وحالتها')}</Link>}
  </div>
  <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto" dir={isRTL?'rtl':'ltr'}><DialogHeader><DialogTitle className="break-all">{t('Invoice','فاتورة')} {selected?.invoice_number}</DialogTitle><DialogDescription>{t('Recorded invoice details','تفاصيل الفاتورة المسجلة')}</DialogDescription></DialogHeader>{selected&&<div className="space-y-4 text-sm">
   <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-[#eeebe6] px-3 py-1 text-xs font-semibold">{labels[selected.status]||t('Check with Customer service','تحقق مع خدمة العملاء')}</span><strong>{t('Balance due: ','الرصيد المستحق: ')}{money(selected.balance_due,selected)}</strong></div>
   <p>{t('Due date: ','تاريخ الاستحقاق: ')}{customerDate(selected.due_date,isRTL)}</p>
   {(selected.line_items||[]).map((item,index)=><div key={index} className="bg-[#f9f8f6] rounded-xl p-3"><div className="flex flex-wrap items-start justify-between gap-3"><p className="min-w-0 break-words"><CareText value={item.description} /></p><strong className="tabular-nums break-words">{money(item.total,selected)}</strong></div><div className="text-xs text-[#7c8689] mt-2 space-y-1"><p>{t("Unit price: ","سعر الوحدة: ")}<bdi>{money(item.unit_price,selected)}</bdi></p><p>{t("Quantity: ","الكمية: ")}<bdi>{item.quantity}</bdi></p></div></div>)}
   {[[t('Total','الإجمالي'),selected.total_amount],[t('Recorded discount','الخصم المسجل'),selected.discount_amount],[t('Tax','الضريبة'),selected.tax_amount],[t('Amount paid','المبلغ المدفوع'),selected.amount_paid],[t('Balance due','الرصيد المستحق'),selected.balance_due]].filter(([,v])=>v!==undefined&&v!==null).map(([label,value])=><p key={label} className="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1"><span>{label}</span><strong className="tabular-nums break-words">{money(value,selected)}</strong></p>)}
   {invoicePayments.length>0&&<div><h3 className="font-semibold mb-2">{t('Payment history','سجل المدفوعات')}</h3>{invoicePayments.map(p=><p key={p.id} className="py-2">{money(p.amount,p)} · {labels[p.status]||t('Check with Customer service','تحقق مع خدمة العملاء')} · {customerDate(p.payment_date,isRTL)}</p>)}</div>}
   <Link to={ask(selected)} className="bato-record-action block rounded-xl bg-[#3a2e1e] text-white p-3 text-center">{t('Request receipt or discuss payment','اطلب إيصالاً أو ناقش الدفع')}</Link>
  </div>}</DialogContent></Dialog>
 </div>;
}