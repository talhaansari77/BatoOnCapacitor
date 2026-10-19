import React from "react";
import {Link} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
export default function ReferralLeaderboard() {
 const {t}=useLocation();
 return <section className="bg-white rounded-2xl border border-[#eeebe6] p-5 space-y-3">
 <h3 className="font-semibold">{t("Referral benefits","مزايا الإحالات")}</h3>
 <p className="text-sm text-[#7c8689]">{t("Your referral records and confirmed rewards appear above. Customer service confirms eligibility and the current referral terms.","تظهر سجلات إحالاتك ومكافآتك المؤكدة أعلاه. تؤكد خدمة العملاء الأهلية والشروط الحالية للإحالات.")}</p>
 <Link className="underline text-sm" to="/Messages?channel=client_care&context=referral">{t("Ask about referral terms","استفسر عن شروط الإحالات")}</Link>
 </section>;
}
