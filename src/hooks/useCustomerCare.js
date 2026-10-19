import {useQuery} from "@tanstack/react-query";
import {base44} from "@/api/base44Client";
import {loadCompletedTreatmentSessions} from "@/lib/treatmentSessions";
async function readAll(entity,email,sort) {
  const rows=[];
  for(let skip=0;;skip+=100) {
    const batch=await base44.entities[entity].filter({client_email:email},sort,100,skip);
    rows.push(...batch);
    if(batch.length<100)break;
  }
  return [...new Map(rows.map(r=>[r.id,r])).values()].filter(r=>r.client_email===email);
}
export function useCustomerCare(email) {
  return useQuery({
    queryKey:["customerCare",email],
    enabled:!!email,
    queryFn:async()=>{
      const [appointments,programs,cases,outcomes,sessions,messages]=await Promise.all([
        readAll("Appointment",email,"-appointment_date"),
        readAll("Package",email,"-created_date"),
        readAll("CaseFile",email,"-start_date"),
        readAll("ConsultationOutcome",email,"-consultation_date"),
        loadCompletedTreatmentSessions(email),
        base44.entities.Message.filter({client_email:email,is_from_doctor:true,is_read:false},"-created_date")
      ]);
      return {appointments,programs,cases,outcomes,sessions,messages};
    },
    staleTime:20000,refetchOnMount:"always",refetchInterval:60000
  });
}
