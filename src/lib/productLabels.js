import { selectCareLanguage } from "./careArabic.js";
export function productCategory(value,isRTL=false) {
 const labels={shampoo:"شامبو",conditioner:"بلسم",supplements:"مكملات",serum:"سيروم",medication:"أدوية",tools:"أدوات",aftercare:"العناية بعد العلاج"};
 return isRTL ? (labels[value] || selectCareLanguage(value,"ar")) : selectCareLanguage(value,"en");
}
