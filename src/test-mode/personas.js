// Fictional preview fixtures. Never written to Base44 entities.
export const TEST_PERSONAS = [
  {id:"new", name:"Noura · New user", nameAr:"نورة · مستخدمة جديدة", language:"ar", location:"kuwait", scenario:"Fresh account; onboarding not started", scenarioAr:"حساب جديد قبل بدء التسجيل"},
  {id:"hair", name:"Omar · Active hair", nameAr:"عمر · برنامج شعر نشط", language:"en", location:"dubai", scenario:"3 of 6 sessions; no case file or photos", scenarioAr:"٣ من ٦ جلسات، دون ملف حالة أو صور"},
  {id:"skin", name:"Sara · Completed skin", nameAr:"سارة · برنامج بشرة مكتمل", language:"ar", location:"kuwait", scenario:"4 of 4 sessions; completed care history", scenarioAr:"٤ من ٤ جلسات مع سجل رعاية مكتمل"},
  {id:"laser", name:"Layla · Laser & booking", nameAr:"ليلى · ليزر وموعد", language:"en", location:"dubai", scenario:"Active laser; confirmed, pending and cancelled appointments", scenarioAr:"ليزر نشط ومواعيد مؤكدة ومعلقة وملغاة"},
  {id:"multi", name:"Youssef · Multiple programs", nameAr:"يوسف · برامج متعددة", language:"ar", location:"dubai", scenario:"Hair, skin and health; partial lab results", scenarioAr:"شعر وبشرة وصحة مع نتائج تحاليل جزئية"}
];
export function seedPersona(persona, now = new Date()) {
  const email = persona.id + "@bato-preview.invalid";
  const date = days => new Date(now.getTime() + days * 86400000).toISOString();
  const day = days => date(days).slice(0,10);
  const user = {id:"test-user-"+persona.id, email, full_name:persona.name.split(" · ")[0], role:"user", is_test_persona:true};
  const records = {};
  const add = (entity, data) => {
    const row = {id:"test-"+persona.id+"-"+entity+"-"+(records[entity]?.length || 0), created_date:date(-60), updated_date:date(-1), ...data};
    (records[entity] ||= []).push(row); return row;
  };
  add("User",user);
  if (persona.id !== "new") {
    add("BATOProfile",{client_email:email, onboarding_path:"booked_client", user_status:"active_client", completed:true, current_step:6, consent_acknowledged:true, main_concern:"Fictional preview concern", biggest_worry:"not_sure", desired_result:"Preview care goals", uploaded_photos:[], uploaded_documents:[], visit_prep_read:true});
    add("ClientLifecycle",{client_email:email,lifecycle_stage:"active",loyalty_points:120,total_sessions:3,vip_status:false,loyalty_tier:"bronze",engagement_score:60,churn_risk_score:0});
  }
  const program = (department,type,name,used,total,completed=false,withCase=true) => {
    const pkg = add("Package",{client_email:email,department,package_type:type,package_name:name,total_sessions:total,sessions_used:used,status:completed?"completed":"active",start_date:day(-90),expiry_date:day(180),next_recommended_date:completed?undefined:day(7),price:0});
    if(withCase) add("CaseFile",{client_email:email,primary_department:department,case_status:completed?"completed":"in_treatment",total_sessions_planned:total,start_date:day(-90),before_photos:[],assigned_specialist:"Test specialist",treatment_plan:"Fictional preview program"});
    const treatment = {hair_restoration:"mesotherapy",skin_care:"hydrafacial",laser_hair_removal:"laser_hair_removal_body",general_health:"iv_therapy"}[department];
    for(let i=1;i<=used;i++) add("TreatmentSession",{client_email:email,package_id:pkg.id,department,treatment_type:treatment,session_number:i,session_date:day(-7-(used-i)*14),photos:[],specialist_name:"Test specialist"});
    return pkg;
  };
  if(persona.id==="hair") program("hair_restoration","full_head_hair_program","Full Head Hair Program",3,6,false,false);
  if(persona.id==="skin") program("skin_care","hydrafacial_dermapen","HydraFacial + Dermapen",4,4,true);
  if(persona.id==="laser") {
    const pkg=program("laser_hair_removal","laser_full_body","Full Body Laser",2,6);
    for(const [status,days] of [["confirmed",5],["requested",10],["cancelled",-2]]) add("Appointment",{client_email:email,department:pkg.department,package_id:pkg.id,service_name:pkg.package_name,appointment_date:date(days),status,type:"treatment",location:"Dubai",timezone:"Asia/Dubai"});
  }
  if(persona.id==="multi") {
    program("hair_restoration","full_head_hair_program","Full Head Hair Program",2,6);
    program("skin_care","hydrafacial","HydraFacial",1,4);
    program("general_health","glutathione_drip_course_of_4","Glutathione Drip Course",2,4);
    for(const [marker,value,min,max,targetMin,targetMax,unit] of [["Ferritin",32,15,150,50,100,"ng/mL"],["Vitamin D",38,20,100,40,70,"ng/mL"],["Vitamin B12",null,200,900,400,800,"pg/mL"]])
      add("BiomarkerResult",{client_email:email,marker_name:marker,current_value:value,unit,general_health_min:min,general_health_max:max,bato_target_min:targetMin,bato_target_max:targetMax,test_date:day(-10),category:"vitamins_minerals",review_status:"pending_review"});
    add("Message",{client_email:email,sender_name:"Test care team",sender_role:"doctor",is_from_doctor:true,is_read:false,content:"Preview message: your care team is available.",tags:["hair_team"]});
  }
  for(const [category,name,price] of [["shampoo","Preview Shampoo",75],["serum","Preview Serum",120]]) add("Product",{name,description:"Fictional product for checkout testing",category,price,currency:"AED",is_active:true,stock_quantity:20});
  return {user,records,log:[],checkouts:{}};
}
