export function customerDate(value,isRTL=false,includeTime=false){
 if(!value)return isRTL?'لم يُسجل التاريخ':'Date not recorded';
 const date=new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value))?value+'T12:00:00':value);
 if(!Number.isFinite(date.getTime()))return isRTL?'لم يُسجل التاريخ':'Date not recorded';
 return date.toLocaleDateString(isRTL?'ar':'en-GB',{year:'numeric',month:'short',day:'numeric',...(includeTime?{hour:'numeric',minute:'2-digit'}:{})});
}

export function validBirthDate(value, today=new Date()) {
 if(!value)return true;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const [year,month,day]=value.split("-").map(Number);
 const d=new Date(value+"T12:00:00");
 const current=new Date(today.getFullYear(),today.getMonth(),today.getDate(),23,59,59);
 return Number.isFinite(d.getTime())&&d.getFullYear()===year&&d.getMonth()+1===month&&d.getDate()===day&&d<=current;
}
