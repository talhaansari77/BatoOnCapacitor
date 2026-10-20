import {clearPatientAuth} from "../native/patientApi.js";
import {TEST_PERSONAS, seedPersona} from "./personas.js";
import {readLocalSession, clearLocalSession, localAccountDataKey} from "../native/localAuth.js";
const STANDALONE = import.meta.env?.MODE === 'mobile';
const ACTIVE = "bato-preview-persona-v1";
const PREFIX = "bato-preview-data-v1:";
const clone = value => value === undefined ? undefined : structuredClone(value);
const storage = () => typeof window !== "undefined" ? (STANDALONE ? window.localStorage : window.sessionStorage) : null;
export const isStandaloneBuild = STANDALONE;
export function hasStandaloneSession() { return STANDALONE && Boolean(readLocalSession(storage())); }
export function endStandaloneSession() {
  if (!STANDALONE) return;
  clearLocalSession(storage());
  clearPatientAuth();
  // A previous build used a demo session; it must not bypass the new sign-in screen.
  storage()?.removeItem('bato-standalone-session-v1');
  state = undefined;
  window.location.assign('/Welcome');
}
export function standaloneOnboardingComplete() {
  if (!STANDALONE) return false;
  const account = readLocalSession(storage());
  if (!account) return false;
  const saved = storage()?.getItem(localAccountDataKey(account.email));
  if (!saved) return false;
  try { return JSON.parse(saved)?.records?.BATOProfile?.some(p => p.completed === true || p.onboarding_skipped === true) || false; }
  catch { return false; }
}
export function activePersona() {
  // Standalone uses one fresh UI fixture per local email. The five QA personas
  // still work unchanged in development builds.
  if (STANDALONE) return TEST_PERSONAS[0];
  return TEST_PERSONAS.find(p => p.id === storage()?.getItem(ACTIVE)) || null;
}
let state;
function current() {
  const persona = activePersona();
  if (!persona) throw new Error("No preview persona selected");
  const account = STANDALONE ? readLocalSession(storage()) : null;
  if (STANDALONE && !account) throw new Error('Local sign-in required');
  const uid = STANDALONE ? 'local-user-' + account.email : 'test-user-' + persona.id;
  const key = STANDALONE ? localAccountDataKey(account.email) : PREFIX + persona.id;
  if (!state || state.user.id !== uid) {
    try { state = JSON.parse(storage().getItem(key)); } catch { state = null; }
    if (!state?.records || state.user?.id !== uid) {
      state = seedPersona(persona);
      if (STANDALONE) {
        state.user = { ...state.user, id: uid, email: account.email, full_name: account.name };
        state.records.User = [{ ...state.user }];
        // Avoid development-fixture labels in the main UI.
        for (const item of state.records.Product || []) {
          item.name = item.category === 'shampoo' ? 'BATO Shampoo' : 'BATO Serum';
          item.description = 'Product details will be available from the clinic.';
        }
      }
    }
  }
  return state;
}
function save() {
  try {
    const key = STANDALONE ? localAccountDataKey(readLocalSession(storage()).email) : PREFIX + activePersona().id;
    storage()?.setItem(key, JSON.stringify(current()));
  } catch { /* Storage can be unavailable or full; preserve UI state in memory. */ }
}
export function testSnapshot() { return clone(current()); }
export function selectPersona(id) {
  if(id && !TEST_PERSONAS.some(p=>p.id===id)) throw new Error("Unknown test persona");
  const local = window.localStorage;
  if(id && !activePersona()) storage().setItem("bato-preview-preferences",JSON.stringify({language:local.getItem("bato_language"),location:local.getItem("bato_location"),currency:local.getItem("bato_shop_currency")}));
  if(id) {
    storage().setItem(ACTIVE,id);
    const p=activePersona(); local.setItem("bato_language",p.language); local.setItem("bato_location",p.location); local.removeItem("bato_shop_currency");
  } else {
    storage().removeItem(ACTIVE);
    try { const saved=JSON.parse(storage().getItem("bato-preview-preferences")); for(const [key,value] of Object.entries(saved||{})) { const k={language:"bato_language",location:"bato_location",currency:"bato_shop_currency"}[key]; if(value===null) local.removeItem(k); else local.setItem(k,value); } } catch { /* No preference backup. */ }
  }
  storage().removeItem("bato-preview-fault");
  state=undefined;
  window.location.assign("/Dashboard");
}
export function resetPersona() {
  const p=activePersona(); if(!p)return;
  storage().removeItem(PREFIX+p.id);
  storage().removeItem("bato-preview-cart:"+p.id);
  storage().removeItem("bato-preview-fault");
  state=undefined;
  window.location.assign("/Dashboard");
}
export function setTestFault(value) {
  if(!["none","reads","writes"].includes(value)) throw new Error("Unknown failure mode");
  storage().setItem("bato-preview-fault",value);
  window.location.reload();
}
function fail(write=false) {
  if(storage()?.getItem("bato-preview-fault") === (write?"writes":"reads")) throw new Error("Simulated preview "+(write?"save":"load")+" failure");
}
export function matches(row, query={}) {
  return Object.entries(query).every(([key,expected])=>{
    if(key==="$or") return expected.some(q=>matches(row,q));
    if(key==="$and") return expected.every(q=>matches(row,q));
    const value=row[key];
    if(expected && typeof expected==="object" && !Array.isArray(expected)) return Object.entries(expected).every(([op,arg])=>{
      if(op==="$in") return Array.isArray(value)?value.some(v=>arg.includes(v)):arg.includes(value);
      if(op==="$nin") return Array.isArray(value)?!value.some(v=>arg.includes(v)):!arg.includes(value);
      if(op==="$ne") return value!==arg;
      if(op==="$eq") return value===arg;
      if(op==="$exists") return (value!==undefined)===arg;
      if(op==="$gt") return value>arg;
      if(op==="$gte") return value>=arg;
      if(op==="$lt") return value<arg;
      if(op==="$lte") return value<=arg;
      throw new Error("Unsupported preview query operator: "+op);
    });
    return value===expected;
  });
}
function log(entity,operation,id) {
  const s=current(); s.log.push({entity,operation,id,time:new Date().toISOString()}); s.log=s.log.slice(-100);save();
}
function entityAPI(entity) {
  const rows = ()=>current().records[entity] ||= [];
  const read=(query={},sort,limit=100,skip=0)=>{
    fail(); let result=rows().filter(r=>matches(r,query));
    if(sort) {const desc=sort.startsWith("-"), key=sort.replace(/^[-+]/,"");result.sort((a,b)=>a[key]===b[key]?0:(a[key]>b[key]?1:-1)*(desc?-1:1));}
    return clone(result.slice(skip,skip+limit));
  };
  return {
    filter:async (...args)=>read(...args), list:async(sort,limit,skip)=>read({},sort,limit,skip),
    get:async id=>{fail();const row=rows().find(r=>r.id===id);if(!row)throw new Error("Preview record not found");return clone(row);},
    create:async data=>{fail(true);const row={...clone(data),id:"test-"+crypto.randomUUID(),created_date:new Date().toISOString(),updated_date:new Date().toISOString()};rows().push(row);log(entity,"create",row.id);return clone(row);},
    bulkCreate:async items=>Promise.all(items.map(item=>entityAPI(entity).create(item))),
    update:async(id,data)=>{fail(true);const row=rows().find(r=>r.id===id);if(!row)throw new Error("Preview record not found");Object.assign(row,clone(data),{id,updated_date:new Date().toISOString()});log(entity,"update",id);return clone(row);},
    delete:async id=>{fail(true);current().records[entity]=rows().filter(r=>r.id!==id);log(entity,"delete",id);return {success:true};},
    subscribe:()=>()=>{}
  };
}
const entityProxy=/* @__PURE__ */ new Proxy({}, {get:(_,name)=>entityAPI(name)});
const subscriptions=/* @__PURE__ */ new Map();
const simulated = {
  entities:entityProxy,
  auth:{
    me:async()=>clone(current().user), isAuthenticated:async()=>STANDALONE ? hasStandaloneSession() : true,
    updateMe:async data=>{fail(true);const s=current();Object.assign(s.user,clone(data),{id:s.user.id,email:s.user.email,is_test_persona:true,role:"user"});log("User","update",s.user.id);return clone(s.user);},
    logout:()=>STANDALONE?endStandaloneSession():selectPersona(null),redirectToLogin:()=>{window.location.assign(STANDALONE?"/SignIn":"/Dashboard");}
  },
  appLogs:{logUserInApp:async()=>{}},
  functions:{invoke:async(name,data={})=>{
    fail(true);
    if(name==="exchange-rates")return {data:{rates:{USD:1,AED:3.6725,KWD:0.307},updatedAt:new Date().toISOString(),simulated:true}};
    if(name==="cancel-shop-order"){const order=await entityAPI("Order").update(data.order_id,{status:"cancelled"});return {data:{order,simulated:true}};}
    if(name==="place-order"){
      const s=current();
      if(s.checkouts[data.checkout_key])return {data:{order:clone(s.checkouts[data.checkout_key]),simulated:true}};
      const products=s.records.Product||[];
      const items=data.items.map(item=>{const p=products.find(p=>p.id===item.product_id);if(!p||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>p.stock_quantity)throw new Error("Invalid preview cart");return {product_id:p.id,product_name:p.name,quantity:item.quantity,unit_price:p.price,total_price:p.price*item.quantity};});
      const rates={USD:1,AED:3.6725,KWD:0.307}, currency=data.currency||"AED";
      if(!rates[currency])throw new Error("Invalid preview currency");
      const money=n=>Math.round(n*(currency==="KWD"?1000:100))/(currency==="KWD"?1000:100);
      const snapshots=items.map(item=>({...item,product_price:money(item.unit_price/rates.AED*rates[currency]),subtotal:money(item.total_price/rates.AED*rates[currency]),currency}));
      const total=money(snapshots.reduce((sum,item)=>sum+item.subtotal,0));
      const order=await entityAPI("Order").create({client_email:s.user.email,order_number:"TEST-"+Date.now(),status:"pending",payment_status:"unpaid",inventory_status:"not_reserved",currency,total_amount:total,items:snapshots,fulfillment_method:data.fulfillment_method,shipping_address:data.shipping?.address||"",shipping_city:data.shipping?.city||"",shipping_country:data.shipping?.country||"",clinic_branch:data.clinic_branch});
      for(const item of snapshots)await entityAPI("OrderItem").create({...item,order_id:order.id});
      s.checkouts[data.checkout_key]=order;save();return {data:{order,simulated:true}};
    }
    throw new Error("This backend action is unavailable in isolated preview: "+name);
  }},
  integrations:{Core:/* @__PURE__ */ new Proxy({}, {get:(_,name)=>async({file}={})=>{
    fail(true);
    if(name==="SendEmail"||name==="SendSMS"){log("Integration",String(name),"simulated");return {success:true,simulated:true};}
    if(name==="UploadFile"){
      if (STANDALONE) throw new Error("Uploads are disabled in the offline iOS demo. Do not enter real patient data.");
      const file_url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
      log("Upload","local","simulated");return {file_url};
    }
    throw new Error("AI and external integrations are disabled in isolated preview");
  }})},
  agents:{
    listConversations:async()=>clone(current().records.TestConversation||[]),
    createConversation:async data=>entityAPI("TestConversation").create({...data,messages:[]}),
    subscribeToConversation:(id,callback)=>{subscriptions.set(id,callback);return ()=>subscriptions.delete(id);},
    addMessage:async(conversation,message)=>{
      fail(true);const api=entityAPI("TestConversation"), row=await api.get(conversation.id);
      row.messages.push({...message,id:"test-"+crypto.randomUUID(),created_date:new Date().toISOString()});
      row.messages.push({role:"assistant",content:"Test mode: this is a simulated reply. No clinic message or AI request was sent.",created_date:new Date().toISOString()});
      const updated=await api.update(row.id,{messages:row.messages});subscriptions.get(row.id)?.(updated);return updated;
    }
  }
};
// Resolve at invocation time so legacy exported methods are isolated too.
// An unknown API never falls through to a live service while a persona is active.
export function createPreviewClient(real) {
  const wrap=(path=[])=>new Proxy(function(){}, {
    get:(_,key)=> key==="then"?undefined:wrap([...path,key]),
    apply:(_,thisArg,args)=>{
      const root=STANDALONE ? simulated : (activePersona()?simulated:real);
      let owner=root;for(const key of path.slice(0,-1))owner=owner?.[key];
      const method=owner?.[path.at(-1)];
      if(typeof method!=="function")throw new Error("Unsupported isolated preview API: "+path.join("."));
      return method.apply(owner,args);
    }
  });
  return wrap();
}

export function setCareScenario(stage) {
  if(!["requested","scheduled","confirmed","visited","active","completed","missing","stale"].includes(stage))throw new Error("Unknown care stage");
  const s=current(),email=s.user.email;
  const branch=activePersona().location;
  const now=new Date(),date=days=>new Date(now.getTime()+days*86400000).toISOString();
  const day=days=>date(days).slice(0,10);
  const row=(id,data)=>({id:"test-care-"+id,client_email:email,created_date:date(-20),updated_date:date(0),...data});
  const care={Appointment:[],Package:[],CaseFile:[],TreatmentSession:[],ConsultationOutcome:[]};
  const apt=row("visit",{department:"skin_care",type:"consultation",location:branch==="kuwait"?"Kuwait":"Dubai",timezone:branch==="kuwait"?"Asia/Kuwait":"Asia/Dubai",appointment_date:date(["visited","active","completed","missing","stale"].includes(stage)?-3:3),status:["visited","active","completed","missing"].includes(stage)?"completed":stage==="stale"?"requested":stage,pre_appointment_instructions:stage==="confirmed"?"Preview: bring the documents requested by your team.":undefined});
  care.Appointment.push(apt);
  if(["visited","active","completed","missing"].includes(stage))care.ConsultationOutcome.push(row("outcome",{appointment_id:apt.id,consultation_date:date(-3),recommended_next_step:stage==="visited"?"follow_up_consultation":"session_1",recommendation_reason:"Preview recommendation: discuss your next step with the Skin Team.",post_consultation_state:"follow_up_needed",staff_note:"PRIVATE STAFF TEST — NEVER DISPLAY",client_objection:"PRIVATE OBJECTION TEST — NEVER DISPLAY"}));
  if(["active","completed","missing"].includes(stage)){
    const pkg=row("program",{department:"skin_care",package_type:"hydrafacial",package_name:"HydraFacial",status:stage==="completed"?"completed":"active",total_sessions:4,sessions_used:stage==="completed"?4:1,start_date:day(-30),next_recommended_date:day(7),maintenance_plan:stage==="completed"?"Preview maintenance plan: arrange a review with your Skin Team.":undefined,maintenance_review_date:stage==="completed"?day(30):undefined});
    care.Package.push(pkg);
    if(stage!=="missing")care.CaseFile.push(row("case",{package_id:pkg.id,primary_department:"skin_care",case_status:stage==="completed"?"completed":"in_treatment",treatment_plan:"Preview care plan: four sessions followed by a team review."}));
    care.TreatmentSession.push(row("session",{package_id:pkg.id,department:"skin_care",session_date:day(-2),treatment_type:"hydrafacial",specialist_name:"Preview specialist",next_steps:stage==="missing"?undefined:"Preview instruction: read your supplied care guide.\nPreview instruction: ask the Skin Team if anything is unclear."}));
  }
  Object.assign(s.records,care);
  if(!s.records.BATOProfile?.length)s.records.BATOProfile=[row("profile",{completed:true,onboarding_path:"explorer",explorer_interests:["Skin"],explorer_recommended_start:"Skin Consultation",explorer_preferred_branch:branch,current_step:7})];
  s.careScenario=stage;
  save();
  window.location.assign("/Dashboard");
}

export function setAuditScenario(){
 const s=current(),email=s.user.email,now=new Date().toISOString();
 const row=(id,data)=>({id:"test-audit-"+id,client_email:email,created_date:now,updated_date:now,...data});
 s.records.Invoice=[row("invoice-aed",{invoice_number:"TEST-AED-001",status:"partially_paid",currency:"AED",issue_date:now.slice(0,10),due_date:now.slice(0,10),total_amount:500,amount_paid:200,balance_due:300,line_items:[{description:"Fictional care service",unit_price:500,quantity:1,total:500}]}),row("invoice-kwd",{invoice_number:"TEST-KWD-001",status:"sent",currency:"KWD",issue_date:now.slice(0,10),total_amount:25,amount_paid:0,balance_due:25}),row("draft",{invoice_number:"PRIVATE-DRAFT-TEST",status:"draft",currency:"AED",total_amount:9999})];
 s.records.Payment=[row("payment",{invoice_id:"test-audit-invoice-aed",amount:200,currency:"AED",payment_method:"cash",status:"success",payment_date:now,transaction_id:"TEST-PAYMENT"}),row("failed",{invoice_id:"test-audit-invoice-aed",amount:300,currency:"AED",payment_method:"credit_card",status:"failed",payment_date:now})];
 s.records.AcademyContent=[row("lesson",{title:"Fictional care orientation",description:"Local test lesson. No clinical advice.",content_type:"guide",category:"treatment_prep",difficulty_level:"beginner",content_body:"This is an isolated test lesson.",estimated_duration_minutes:2,points_reward:10,is_published:true,is_featured:true,order_index:1}),row("completed-lesson",{title:"Previously completed test lesson",content_type:"article",difficulty_level:"beginner",content_body:"Reviewing this must keep completed status.",points_reward:5,is_published:true,order_index:2})];
 s.records.AcademyProgress=[row("progress",{content_id:"test-audit-completed-lesson",status:"completed",points_earned:5,completed_date:now})];
 s.records.CommunityPost=[row("post",{author_email:"bato-fan@preview.invalid",author_name:"BATO fan (fictional customer)",title:"Fictional community post",content:"Skin care test discussion.",category:"general_discussion",status:"approved",likes_count:0,comments_count:1})];
 s.records.CommunityComment=[row("comment",{post_id:"test-audit-post",author_name:"Fictional participant",content:"A local test comment.",status:"approved"})];
 s.records.Notification=[row("notice",{title:"Test invoice update",message:"Fictional notification for invoice review.",type:"general",is_read:false,action_url:"/MyBilling"}),row("expired",{title:"EXPIRED-NOTICE-TEST",message:"Must not appear.",is_read:false,expires_at:"2000-01-01T00:00:00Z"}),row("unsafe",{title:"Test invalid destination",message:"No external action should be rendered.",action_url:"javascript:alert(1)",is_read:false})];
 if(!s.records.ClientLifecycle?.length)s.records.ClientLifecycle=[row("lifecycle",{loyalty_level:"bronze",loyalty_points:1200})];
 s.auditScenario=true;save();window.location.assign("/MyBilling");
}

// Non-clinical aspect-ratio fixtures, isolated in the current fictional persona.
// These shapes test framing and comparison only; they are not patient results.
export function setPhotoAuditScenario() {
  const s=current(), email=s.user.email;
  const makeImage=(width,height,color)=>"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#eeebe6"/><rect x="4" y="4" width="${width-8}" height="${height-8}" rx="12" fill="none" stroke="${color}" stroke-width="8"/><circle cx="${width/2}" cy="${height/2}" r="30" fill="${color}"/></svg>`);
  s.records.ProgressPhoto=[
    {id:"test-photo-layout-baseline",client_email:email,journey_type:"hair",photo_source:"official_bato",client_visible:true,checkpoint_name:"Baseline",angle:"crown",captured_date:"2026-09-01",photo_url:makeImage(240,400,"#c4aa8b"),client_facing_note:"Layout test image only — not a clinical photo."},
    {id:"test-photo-layout-session",client_email:email,journey_type:"hair",photo_source:"official_bato",client_visible:true,checkpoint_name:"Session 3",angle:"crown",captured_date:"2026-09-29",photo_url:makeImage(400,240,"#7c8689"),client_facing_note:"Layout test image only — not a clinical photo."}
  ];
  save();window.location.assign("/HairJourney");
}
