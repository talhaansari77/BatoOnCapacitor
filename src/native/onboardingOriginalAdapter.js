/**
 * Data-only bridge for the original, illustrated BATO onboarding screens.
 * The backend remains authoritative for valid option VALUES, conditional steps,
 * validation and completion. No UI is rendered here.
 */
import { EXPLORER_STARTS } from '@/lib/explorerStart';

export const UI_STEPS = {
  explorer: ['path', null, 'interests', 'assessment', 'hair_detail', 'goals', 'visit', null],
  booked: ['path', 'appointment', 'service', 'visit_details', 'history', 'desired_result', 'worry', 'health', 'photos', 'consent', null],
};

export function indexForStep(path, step) {
  const steps = UI_STEPS[path];
  if (!steps) throw new Error(`Unsupported onboarding path: ${path}`);
  if (step === null || step === undefined) return steps.length - 1;
  const index = steps.indexOf(step);
  if (index < 1) throw new Error(`Unsupported onboarding step from BATO API: ${step}`);
  return index;
}

const simplify = x => String(x ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const snake = x => simplify(x).replace(/\s+/g, '_');
const isPresent = x => x !== null && x !== undefined && x !== '' && (!Array.isArray(x) || x.length > 0);
const array = x => Array.isArray(x) ? x : [];
const fieldKey = q => String(q.key ?? q.question_key ?? q.name ?? q.id ?? '');
const fieldOptions = q => array(q.options ?? q.choices ?? q.values);
const typeOf = q => String(q.type ?? q.input_type ?? 'text').toLowerCase();
const parseObj = x => typeof x === 'object' && x !== null && !Array.isArray(x) ? x : {};

export function stepQuestions(payload, questionnaire, stepKey) {
  // The resolved step can omit conditional questions until previous answers are
  // saved. Our ORIGINAL UI collects those answers on the same screen. Prefer
  // the complete public questionnaire schema for submission and resolve
  // conditions against the CURRENT UI selections below.
  const collection = questionnaire?.steps ?? questionnaire?.data?.steps ?? questionnaire;
  const group = Array.isArray(collection) ? collection.find(s => (s.key ?? s.step ?? s.id) === stepKey) : collection?.[stepKey];
  if (Array.isArray(group?.questions)) return group.questions;
  const resolved = payload?.step;
  if (Array.isArray(resolved?.questions)) return resolved.questions;
  return array(payload?.questions);
}

function aliasCandidates(step, source) {
  const visit = parseObj(source.visit_specific_answers);
  const interest = array(source.explorer_interests);
  const assess = parseObj(source.explorer_assessment);
  const start = EXPLORER_STARTS.find(s => s.title === source.explorer_recommended_start)?.interest ?? (interest.length === 1 ? interest[0] : undefined);
  const subject = Object.fromEntries(Object.entries(assess).map(([k,v]) => [`${snake(k)}_concerns`, v]));
  const common = {
    appointment_status: source.appointment_confirmed === true ? 'confirmed' : source.appointment_confirmed === false ? 'needs_help' : undefined,
    appointment_id: source.appointment_id,
    service: source.booked_service_type,
    main_concern: source.main_concern,
    hair_onset: visit.duration ?? source.visit_specific_answers?.hair_duration,
    hair_duration: source.visit_specific_answers?.hair_duration ?? visit.duration,
    hair_worsening: visit.getting_worse ?? source.visit_specific_answers?.hair_getting_worse,
    hair_getting_worse: source.visit_specific_answers?.hair_getting_worse ?? visit.getting_worse,
    hair_areas: visit.areas,
    hair_shedding: visit.shedding,
    scalp_symptoms: visit.scalp_symptoms,
    hair_family_history: visit.family_history,
    hair_trigger: source.visit_specific_answers?.hair_trigger,
    skin_concerns: visit.skin_concerns,
    skin_onset: visit.duration,
    skin_duration: visit.duration,
    skin_sensitive: visit.is_sensitive,
    skin_products: visit.current_products,
    skin_bad_reaction: visit.bad_reaction,
    laser_areas: visit.areas,
    laser_before: visit.done_before,
    laser_reaction: visit.previous_reaction,
    laser_sun_exposure: visit.recent_tanning,
    laser_done_before: visit.done_before,
    laser_previous_reaction: visit.previous_reaction,
    laser_recent_tanning: visit.recent_tanning,
    laser_pregnant: visit.pregnant,
    injectable_type: visit.injectable_type,
    injectable_treatment: visit.injectable_type,
    injectable_before: visit.done_before,
    blood_thinners: visit.blood_thinners,
    injectable_areas: visit.areas,
    injectable_done_before: visit.done_before,
    injectable_bad_reaction: visit.bad_reaction,
    injectable_blood_thinners: visit.blood_thinners,
    injectable_pregnant: visit.pregnant,
    drip_type: visit.drip_type,
    iv_treatment: visit.drip_type,
    iv_before: visit.done_before,
    iv_reaction: visit.previous_reaction,
    drip_done_before: visit.done_before,
    drip_previous_reaction: visit.previous_reaction,
    drip_pregnant: visit.pregnant,
    panel_types: visit.panels,
    panel_checks: visit.panels,
    panel_medications: visit.on_medication,
    pregnant_or_breastfeeding: visit.pregnant ?? source.is_pregnant_or_breastfeeding,
    panel_monitoring: visit.monitoring,
    panel_on_medication: visit.on_medication,
    previous_treatments: source.previous_treatments,
    tried_before: source.previous_treatments,
    tried_outcome: source.previous_experience_result,
    team_notes: source.previous_experience_notes,
    previous_result: source.previous_experience_result,
    previous_experience_result: source.previous_experience_result,
    previous_notes: source.previous_experience_notes,
    previous_experience_notes: source.previous_experience_notes,
    desired_result: source.desired_result,
    biggest_worry: source.biggest_worry,
    worry_detail: source.fears_and_concerns,
    worry: source.biggest_worry,
    worry_detail: source.fears_and_concerns,
    fears_and_concerns: source.fears_and_concerns,
    on_medications: source.has_medications,
    medications: source.medications_detail,
    on_supplements: source.has_supplements,
    supplements: source.supplements_detail,
    has_allergies: source.has_allergies,
    allergies: source.allergies_detail,
    allergy_details: source.allergies_detail,
    has_conditions: source.has_medical_conditions,
    conditions: source.medical_conditions_detail,
    recent_surgery: source.had_recent_surgery,
    had_bad_reaction: source.had_bad_reaction,
    bad_reaction: source.had_bad_reaction,
    bad_reaction_details: source.bad_reaction_detail,
    bad_reaction_detail: source.bad_reaction_detail,
    pregnant_breastfeeding: source.is_pregnant_or_breastfeeding,
    is_pregnant_or_breastfeeding: visit.pregnant ?? source.is_pregnant_or_breastfeeding,
    deficiencies: source.known_deficiencies,
    consent: source.consent_acknowledged,
    ...visit,
  };
  if (step === 'interests') return {
    interests: interest,
    start_with: start,
  };
  if (step === 'assessment') {
    // This API asks about the PRIMARY category only (start_with), even when
    // the illustrated UI lets patients explore several interests.
    const group = ({ hair:'Hair',skin:'Skin',health:'Health / Panels',laser:'Laser',injectables:'Injectables' })[snake(start)] ?? start;
    return { help_with: array(assess[group]) };
  }
  if (step === 'hair_detail') return {
    hair_duration: source.visit_specific_answers?.hair_duration,
    hair_onset: source.visit_specific_answers?.hair_duration,
    hair_worsening: source.visit_specific_answers?.hair_getting_worse,
    hair_getting_worse: source.visit_specific_answers?.hair_getting_worse,
    hair_trigger: source.visit_specific_answers?.hair_trigger,
  };
  if (step === 'goals') return {
    desired_result: source.desired_result,
    motivation: source.desired_result && !['I want more confidence','I want to understand my options','I want to improve something specific','I tried something before and want a better answer',"I'm preparing for an event",'Other'].includes(source.desired_result) ? 'other' : source.desired_result,
    motivation_detail: source.desired_result && !['I want more confidence','I want to understand my options','I want to improve something specific','I tried something before and want a better answer',"I'm preparing for an event",'Other'].includes(source.desired_result) ? source.desired_result : undefined,
    goal: source.desired_result,
    goals: source.desired_result ? [source.desired_result] : [],
    biggest_worry: source.biggest_worry,
    worry_detail: source.fears_and_concerns,
    worry: source.biggest_worry,
  };
  if (step === 'visit') return {
    location: source.explorer_preferred_branch,
    branch: source.explorer_preferred_branch,
    name: source.explorer_contact_name,
    phone: source.explorer_contact_phone,
  };
  if (step === 'photos') return {};
  if (step === 'consent') return { consent: source.consent_acknowledged };
  return common;
}

const choiceAliases = {
  'hair restoration': ['hair', 'hair_treatment'],
  'hair treatment': ['hair', 'hair_treatment'],
  'skin treatments': ['skin', 'skin_treatment', 'skin_care'],
  'wellness iv drips': ['health', 'iv_drip', 'iv_therapy'],
  'not sure yet': ['not_sure', 'unsure'],
  'health panels': ['health', 'wellness', 'panels'],
  'aesthetic care': ['aesthetic', 'injectables'],
  'hair consultation': ['hair_consultation'],
  'hair treatment hair program': ['hair_treatment', 'hair_program'],
  'skin consultation': ['skin_consultation'],
  'skin treatment': ['skin_treatment'],
  'laser session': ['laser', 'laser_session'],
  'injectables': ['injectables', 'aesthetic'],
  'drips iv therapy': ['iv_drip', 'iv_therapy', 'drips'],
  'panels lab tests': ['panels', 'lab_tests', 'lab_panels'],
  'general medical consultation': ['general', 'general_consultation'],
  'not sure': ['not_sure', 'unsure'],
  'hair loss thinning': ['hair_loss', 'thinning'],
  'receding hairline': ['receding_hairline', 'hairline'],
  'acne breakouts': ['acne', 'breakouts'],
  'iron ferritin': ['iron', 'iron_ferritin'],
  'temporary result': ['temporary'],
  'no result': ['no_result', 'ineffective'],
  'it worked well': ['worked', 'worked_well', 'positive'],
  'hair thinning': ['thinning'],
  'hair shedding': ['shedding'],
  'a few months': ['3_6_months', 'few_months'],
  'just started under 3 months': ['less_3_months', 'under_3_months', '0_3_months'],
  'over a year': ['over_1_year', '1_2_years'],
  'several years': ['over_2_years', '2_plus_years'],
  'yes noticeably': ['yes', 'worsening'],
  'seems stable': ['no', 'stable'],
  'im worried it wont work': ['not_work', 'effectiveness'],
  'im worried about the cost': ['cost', 'price'],
  'i want more confidence': ['confidence'],
  'i want to understand my options': ['options'],
  'i want to improve something specific': ['improve_specific'],
  'i tried something before and want a better answer': ['tried_before'],
  'im preparing for an event': ['event'],
  'i m preparing for an event': ['event'],
  'other': ['other'],
  'it just started': ['just_started'],
  'medical reason': ['medical'],
  'diet change': ['diet'],
  'i have been disappointed before': ['disappointed_before'],
  'ive been disappointed before': ['disappointed_before'],
  'im not sure what is right for me': ['unsure_what_is_right'],
  'im nervous about what ill find out': ['nervous_findings'],
  'im nervous about the procedure itself': ['nervous_procedure'],
  'something else': ['something_else'],
  'full scalp': ['full_scalp'],
  'done laser before': ['laser_before'],
  'less than 3 months': ['under_3_months'],
  '3 6 months': ['3_6_months'],
  '6 12 months': ['6_12_months'],
  '1 2 years': ['1_2_years'],
  'over 2 years': ['over_2_years'],
  'hairline crown full scalp': ['hairline_crown'],
  'scalp concern': ['scalp'],
  'low energy': ['low_energy'],
  'hair related panels': ['hair_panels'],
  'natural refinement': ['natural_refinement'],
  'first time laser': ['first_time'],
  'fatigue low energy': ['fatigue'],
  'injectables botox': ['botox'],
  'facial refinement': ['facial_refinement'],
  'nothing yet': ['nothing', 'none'],
};
function matchedOption(value, question) {
  if (typeof value === 'boolean') return value;
  const opts = fieldOptions(question).map(o => typeof o === 'string' ? { value: o, label: o } : o);
  if (!opts.length) return typeof value === 'string' ? snake(value) : value;
  const n = simplify(value);
  let match = opts.find(o => [o.value, o.label, o.label?.en, o.title].some(x => x && simplify(x) === n));
  if (!match) {
    const tokens = choiceAliases[n] ?? [];
    match = opts.find(o => tokens.some(t => simplify(o.value) === simplify(t) || simplify(o.label) === simplify(t)));
  }
  if (!match) match = opts.find(o => (simplify(o.value).includes(n) || n.includes(simplify(o.value))) && Math.min(simplify(o.value).length, n.length) > 3);
  // Refuse to send an invented/incorrect option for patient medical records.
  if (!match) throw new Error(`“${value}” is not an available backend option for ${fieldKey(question)}. Please ask for the API's /onboarding/questions response to align the choices without changing the original UI.`);
  return match.value;
}
function matchAnswer(raw, question) {
  const type = typeOf(question);
  if (!isPresent(raw) && raw !== false) return undefined;
  if (type === 'multi' || type === 'multiple') {
    const values = (Array.isArray(raw) ? raw : [raw]).map(v => matchedOption(v, question));
    const excluded = array(question.exclusive);
    return values.some(v => excluded.includes(v)) ? values.filter(v => excluded.includes(v)).slice(0, 1) : values;
  }
  if (type === 'consent') return raw === true;
  if (type === 'yes_no' || type === 'boolean') {
    if (typeof raw === 'boolean') return raw;
    const normalized = simplify(raw);
    if (['yes', 'true', 'yes noticeably', 'getting worse'].includes(normalized)) return true;
    if (['no', 'false', 'seems stable', 'stable'].includes(normalized)) return false;
    throw new Error(`Please choose Yes or No for ${fieldKey(question)}. “${raw}” is not a boolean answer.`);
  }
  if (type === 'single' || type === 'select' || type === 'radio') return matchedOption(raw, question);
  if (type === 'phone') return String(raw).replace(/[\s()-]/g, '');
  if (type === 'appointment_id' || type === 'appointment') return raw === null ? null : Number(raw);
  if (Array.isArray(raw)) return raw.join(', ');
  return typeof raw === 'string' ? raw.trim() : raw;
}

/**
 * A conditional start_with question can be absent from GET /steps/interests
 * until interests have actually been saved. On Continue we must submit BOTH
 * values together, or backend validation will reject multiple interests.
 * Reuse the API-mapped interest value (rather than translating UI labels by
 * assumption) so Hair + Skin with Hair selected becomes hair + skin / hair.
 */
function completeInterestAnswers(answers, candidates) {
  const rawInterests = array(candidates.interests);
  const mappedInterests = array(answers.interests);
  const knownValues = {
    'hair': 'hair',
    'skin': 'skin',
    'laser': 'laser',
    'injectables': 'injectables',
    'health / panels': 'health',
    'not sure yet': 'not_sure',
  };
  const toCanonical = text => knownValues[simplify(text)] ?? snake(text);
  const selections = mappedInterests.length
    ? mappedInterests.map((value, index) =>
        // If the resolved questions were absent, the old fallback supplied
        // literal UI labels. Convert only those, not actual backend values.
        value === rawInterests[index] ? toCanonical(value) : value)
    : rawInterests.map(toCanonical);

  if (!selections.length) return answers;
  answers.interests = selections;

  // Find the selected start among the original UI chips, then take the same
  // index in the converted API interest array. No artificial value is added.
  const selectedIndex = rawInterests.findIndex(interest =>
    simplify(interest) === simplify(candidates.start_with));
  const selected = selectedIndex >= 0 ? selections[selectedIndex] : null;

  if (selections.length > 1) {
    // The API always requires start_with for multiple selected interests,
    // even when the resolved step omitted its conditional question.
    if (!selected || !selections.includes(selected)) {
      throw new Error('Please choose which interest you would like to start with.');
    }
    answers.start_with = selected;
  } else if (selected) {
    // Valid for single-interest selection; the backend may also infer this.
    answers.start_with = selected;
  }
  return answers;
}

/**
 * The GET /steps/service response can be resolved against the PREVIOUS saved
 * service/category (or omit main_concern on a new run). The original UI
 * collects service AND concern on one screen, so submit them atomically using
 * the complete published API choices, not a stale resolved option list.
 */
const BOOKED_SERVICE_VALUES = {
  'Hair Consultation': 'hair_consultation',
  'Hair Treatment / Hair Program': 'hair_treatment',
  'Skin Consultation': 'skin_consultation',
  'Skin Treatment': 'skin_treatment',
  'Laser Session': 'laser',
  'Injectables': 'injectables',
  'Drips / IV Therapy': 'iv_therapy',
  'Panels / Lab Tests': 'panels',
  'General Medical Consultation': 'general_consultation',
  'Not sure': 'not_sure',
};
const BOOKED_CONCERN_VALUES = {
  hair: { 'Hair loss / thinning':'hair_loss', 'Receding hairline':'receding_hairline', 'Bald patches':'bald_patches', 'Overall density loss':'density_loss', 'Scalp health':'scalp_health', 'Other':'other' },
  skin: { 'Acne / breakouts':'acne', 'Uneven skin tone':'uneven_tone', 'Fine lines / ageing':'fine_lines', 'Texture / pores':'texture_pores', 'Pigmentation':'pigmentation', 'Other':'other' },
  laser: { 'Unwanted hair':'unwanted_hair', 'Full body laser':'full_body', 'Specific area':'specific_area', 'Tattoo removal':'tattoo_removal', 'Not sure':'not_sure' },
  injectables: { 'Facial refinement':'facial_refinement', 'Injectables / Botox':'botox', 'Filler':'filler', 'Skin booster':'skin_booster', 'Not sure':'not_sure' },
  iv: { 'Fatigue / low energy':'fatigue', 'Lab review':'lab_review', 'Hormone check':'hormone_check', 'Iron / ferritin':'iron_ferritin', 'Not sure':'not_sure' },
  panels: { 'Fatigue / low energy':'fatigue', 'Lab review':'lab_review', 'Hormone check':'hormone_check', 'Iron / ferritin':'iron_ferritin', 'Not sure':'not_sure' },
  general: { 'Hair loss / thinning':'hair_loss', 'Scalp concern':'scalp', 'Skin concern':'skin', 'Pigmentation':'pigmentation', 'Acne / breakouts':'acne', 'Laser / unwanted hair':'laser', 'Injectables / facial refinement':'injectables', 'Fatigue / low energy':'fatigue', 'Lab review':'lab_review', 'Not sure':'not_sure', 'Other':'other' },
};
function buildBookedServiceAnswers(source) {
  const selectedService = source.booked_service_type;
  const selectedConcern = source.main_concern;
  const service = Object.entries(BOOKED_SERVICE_VALUES).find(([label, value]) =>
    simplify(label) === simplify(selectedService) || simplify(value) === simplify(selectedService))?.[1];
  if (!service) throw new Error('Please select the service you are visiting us for.');
  const category = service.startsWith('hair_') ? 'hair'
    : service.startsWith('skin_') ? 'skin'
    : service === 'laser' ? 'laser'
    : service === 'injectables' ? 'injectables'
    : service === 'iv_therapy' ? 'iv'
    : service === 'panels' ? 'panels' : 'general';
  const concern = Object.entries(BOOKED_CONCERN_VALUES[category]).find(([label, value]) =>
    simplify(label) === simplify(selectedConcern) || simplify(value) === simplify(selectedConcern))?.[1];
  if (!concern) throw new Error('Please select your main concern for the chosen service.');
  return { service, main_concern: concern };
}

/** History options are conditional on tried_before. A GET of the current step
 * can omit tried_outcome before any previous treatment has been saved, even
 * though the original UI collects both answers together. Submit both at once.
 */
const HISTORY_TREATMENTS = {
  'PRP': 'prp',
  'Medications': 'medications',
  'Topical products': 'topical',
  'Hair transplant': 'hair_transplant',
  'Laser': 'laser',
  'Nothing yet': 'nothing',
  'Other': 'other',
};
const HISTORY_OUTCOMES = {
  'It worked well': 'worked',
  'Temporary result': 'temporary',
  'No result': 'no_result',
  'Had a bad reaction': 'bad_reaction',
  'Not sure': 'not_sure',
};
function normalizeKnownOption(input, options, field) {
  const selected = Object.entries(options).find(([label, value]) =>
    simplify(input) === simplify(label) || simplify(input) === simplify(value));
  if (!selected) throw new Error(`Please select a valid option for ${field}.`);
  return selected[1];
}
function buildBookedHistoryAnswers(source) {
  const treatments = array(source.previous_treatments).map(x =>
    normalizeKnownOption(x, HISTORY_TREATMENTS, 'previous treatments'));
  if (!treatments.length) throw new Error('Please select what you have tried before.');
  // Backend exclusive option: Nothing yet cannot be combined with treatment options.
  if (treatments.includes('nothing') && treatments.length > 1) {
    throw new Error('Please select either Nothing yet or previous treatments, not both.');
  }
  const answers = { tried_before: treatments };
  if (!treatments.includes('nothing')) {
    if (!source.previous_experience_result) throw new Error('Please choose how your previous treatments went.');
    answers.tried_outcome = normalizeKnownOption(source.previous_experience_result, HISTORY_OUTCOMES, 'treatment outcome');
  }
  const notes = String(source.previous_experience_notes ?? '').trim();
  if (notes) answers.team_notes = notes;
  return answers;
}

/** Only answer keys actually published by the API are sent in schema mode. */
export function buildApiAnswers(step, source, questions) {
  if (step === 'service') return buildBookedServiceAnswers(source);
  if (step === 'history') return buildBookedHistoryAnswers(source);
  const candidates = aliasCandidates(step, source);
  if (step === 'photos') return {};
  if (Array.isArray(questions) && questions.length) {
    const answers = {};
    for (const q of questions) {
      const key = fieldKey(q);
      const normalized = snake(key);
      let raw = candidates[key] ?? candidates[normalized];
      // Optional conditional extras may not be exposed in the original UI.
      if ((raw === undefined || raw === '') && q.prefill !== undefined) raw = q.prefill;
      const category = step === 'assessment' ? snake(EXPLORER_STARTS.find(s => s.title === source.explorer_recommended_start)?.interest ?? source.explorer_recommended_start) :
        ['service','visit_details'].includes(step) ? (String(source.booked_service_type || '').toLowerCase().includes('hair') ? 'hair' : String(source.booked_service_type || '').toLowerCase().includes('skin') ? 'skin' : String(source.booked_service_type || '').toLowerCase().includes('laser') ? 'laser' : String(source.booked_service_type || '').toLowerCase().includes('inject') ? 'injectables' : String(source.booked_service_type || '').toLowerCase().includes('panel') ? 'panels' : String(source.booked_service_type || '').toLowerCase().includes('iv') || String(source.booked_service_type || '').toLowerCase().includes('drip') ? 'iv' : 'general') : null;
      if (q.when?.q === 'category' && category && Array.isArray(q.when.in) && !q.when.in.includes(category)) continue;
      if (q.when?.q && q.when.q !== 'category') {
        const conditionValue = answers[q.when.q] ?? candidates[q.when.q];
        if ('equals' in q.when && conditionValue !== q.when.equals) continue;
        if (Array.isArray(q.when.any_except) && !array(conditionValue).some(v => !q.when.any_except.includes(v))) continue;
      }
      const resolvedQuestion = q.options_by?.map && category ? { ...q, options: q.options_by.map[category] ?? q.options } : q;
      const value = matchAnswer(raw, resolvedQuestion);
      if (value !== undefined) answers[key] = value;
    }
    return step === 'interests' ? completeInterestAnswers(answers, candidates) : answers;
  }
  // Some server versions supply question definitions only from GET /questions.
  // Use documented keys instead of manufacturing fields from the original UI.
  const allowed = {
    interests: ['interests','start_with'],
    assessment: ['help_with'],
    hair_detail: ['hair_duration','hair_worsening','hair_trigger'],
    goals: ['motivation','motivation_detail','worry'],
    visit: ['location','name','phone'],
    appointment: ['appointment_status','appointment_id'],
    service: ['service','main_concern'],
    visit_details: Object.keys(candidates).filter(x => x.startsWith('hair_') || x.startsWith('skin_') || x.startsWith('laser_') || x.startsWith('injectable_') || x.startsWith('drip_') || x.startsWith('panel_')),
    history: ['tried_before','tried_outcome','team_notes'],
    desired_result: ['desired_result'],
    worry: ['worry','worry_detail'],
    health: ['on_medications','medications','on_supplements','supplements','has_allergies','allergies','has_conditions','conditions','recent_surgery','had_bad_reaction','bad_reaction_detail','deficiencies'],
    consent: ['consent'],
  };
  const answers = Object.fromEntries((allowed[step] || []).filter(k => isPresent(candidates[k]) || candidates[k] === false).map(k => [k, candidates[k]]));
  if (step === 'assessment' && Array.isArray(answers.help_with)) {
    // Without a resolved schema, do not send UI display labels as stored values.
    answers.help_with = answers.help_with.map(snake);
  }
  return step === 'interests' ? completeInterestAnswers(answers, candidates) : answers;
}

/** Restore pre-filled UI fields from the backend answers when reopening the app. */
export function uiProfileFromAnswers(state, patient) {
  const raw = state?.answers;
  const flat = Array.isArray(raw)
    ? Object.fromEntries(raw.map(item => [item.question_key ?? item.key, item.value ?? item.answer]))
    : Object.fromEntries(Object.entries(parseObj(raw)).flatMap(([k,v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if ('answer' in v || 'value' in v) return [[k, v.answer ?? v.value]];
        return Object.entries(v);
      }
      return [[k,v]];
    }));
  const from = (...keys) => keys.map(k => flat[k]).find(x => x !== undefined);
  const interestTags = { hair: 'Hair', skin: 'Skin', laser: 'Laser', injectables: 'Injectables', aesthetic: 'Injectables', health: 'Health / Panels', wellness: 'Health / Panels', not_sure: 'Not sure yet' };
  const interests = array(from('interests')).map(s => interestTags[String(s)] ?? s);
  // The backend stores one combined `help_with` array; redistribute the
  // selected options into the same grouped chips that the original UI uses.
  const groupedHelp = {};
  const chipGroups = {
    Hair: ['Hair thinning','Hair shedding','Scalp concern','Hairline / crown / full scalp','Not sure'],
    Skin: ['Acne','Pigmentation','Texture','Dullness','Pores','Sensitivity','Not sure'],
    Laser: ['Full body','Specific area','Maintenance','First time laser','Not sure'],
    Injectables: ['Botox','Filler','Skin booster','Natural refinement','Not sure'],
    'Health / Panels': ['Low energy','Hair-related panels','Iron / ferritin','Vitamin D','Hormones','Not sure'],
  };
  const combinedHelp = array(from('help_with'));
  const firstCategory = interestTags[from('start_with')] ?? interests[0];
  if (combinedHelp.length) {
    for (const [group, chips] of Object.entries(chipGroups)) {
      if (group !== firstCategory) continue;
      const matched = chips.filter(chip => combinedHelp.some(v => {
        const n = simplify(v);
        return n === simplify(chip) || n === snake(chip) ||
          array(choiceAliases[simplify(chip)]).some(alias => n === simplify(alias));
      }));
      if (matched.length) groupedHelp[group] = matched;
    }
  }
  const start = interestTags[from('start_with')] ?? interests[0];
  const visitAnswers = {
    duration: from('hair_onset','hair_duration','skin_onset','skin_duration'),
    getting_worse: from('hair_worsening','hair_getting_worse'),
    areas: from('hair_areas','laser_areas','injectable_areas'),
    shedding: from('hair_shedding'),
    scalp_symptoms: from('scalp_symptoms'),
    family_history: from('hair_family_history'),
    skin_concerns: from('skin_concerns'),
    is_sensitive: from('skin_sensitive'),
    current_products: from('skin_products'),
    bad_reaction: from('skin_bad_reaction','injectable_bad_reaction'),
    done_before: from('laser_done_before','injectable_done_before','drip_done_before'),
    previous_reaction: from('laser_previous_reaction','drip_previous_reaction'),
    recent_tanning: from('laser_recent_tanning'),
    pregnant: from('laser_pregnant','injectable_pregnant','drip_pregnant'),
    injectable_type: from('injectable_type'),
    blood_thinners: from('injectable_blood_thinners'),
    drip_type: from('drip_type'),
    panels: from('panel_types'),
    monitoring: from('panel_monitoring'),
    on_medication: from('panel_on_medication'),
  };
  const motivationLabels = {confidence:'I want more confidence', options:'I want to understand my options', improve_specific:'I want to improve something specific',tried_before:'I tried something before and want a better answer',event:"I'm preparing for an event",other:'Other'};
  const worryLabels = {wont_work:"I'm worried it won't work",cost:"I'm worried about the cost",disappointed_before:"I've been disappointed before",unsure_what_is_right:"I'm not sure what is right for me",nervous_findings:"I'm nervous about what I'll find out",nervous_procedure:"I'm nervous about the procedure itself",something_else:'Something else'};
  const common = {
    current_step: 1,
    explorer_interests: interests,
    explorer_recommended_start: EXPLORER_STARTS.find(s => s.interest === start)?.title ?? '',
    explorer_assessment: Object.fromEntries([
      ['Hair', from('hair_concerns') ?? groupedHelp.Hair], ['Skin', from('skin_concerns') ?? groupedHelp.Skin],
      ['Laser', from('laser_concerns') ?? groupedHelp.Laser], ['Injectables', from('injectables_concerns') ?? groupedHelp.Injectables],
      ['Health / Panels', from('health_concerns') ?? groupedHelp['Health / Panels']],
    ].filter(([,v]) => Array.isArray(v))),
    visit_specific_answers: {
      ...Object.fromEntries(Object.entries(visitAnswers).filter(([,v]) => v !== undefined)),
      hair_duration: from('hair_duration','hair_onset'),
      hair_getting_worse: from('hair_getting_worse','hair_worsening'),
      hair_trigger: from('hair_trigger'),
    },
    desired_result: motivationLabels[from('motivation')] ?? from('motivation_detail','desired_result','goal') ?? '',
    biggest_worry: worryLabels[from('worry')] ?? from('biggest_worry', 'worry') ?? '',
    explorer_preferred_branch: from('location', 'branch') ?? '',
    explorer_contact_name: from('name') ?? patient?.full_name ?? '',
    explorer_contact_phone: from('phone') ?? patient?.full_mobile_number ?? '',
    appointment_confirmed: from('appointment_status') === undefined ? undefined : from('appointment_status') === 'confirmed',
    booked_service_type: ({hair_consultation:'Hair Consultation',hair_treatment:'Hair Treatment / Hair Program',skin_consultation:'Skin Consultation',skin_treatment:'Skin Treatment',laser:'Laser Session',injectables:'Injectables',iv_therapy:'Drips / IV Therapy',panels:'Panels / Lab Tests',general_consultation:'General Medical Consultation',not_sure:'Not sure'})[from('service')] ?? from('service') ?? '',
    main_concern: from('main_concern') ?? '',
    previous_treatments: array(from('tried_before','previous_treatments')).map(v=>({prp:'PRP',medications:'Medications',topical:'Topical products',hair_transplant:'Hair transplant',laser:'Laser',nothing:'Nothing yet',other:'Other'})[v] ?? v), 
    previous_experience_result: ({worked:'It worked well',temporary:'Temporary result',no_result:'No result',bad_reaction:'Had a bad reaction',not_sure:'Not sure'})[from('tried_outcome')] ?? from('tried_outcome','previous_experience_result','previous_result') ?? '',
    previous_experience_notes: from('team_notes','previous_experience_notes','previous_notes') ?? '',
    fears_and_concerns: from('fears_and_concerns','worry_detail') ?? '',
    has_medications: from('on_medications'), medications_detail: from('medications') ?? '',
    has_supplements: from('on_supplements'), supplements_detail: from('supplements') ?? '',
    has_allergies: from('has_allergies'), allergies_detail: from('allergies','allergy_details') ?? '',
    has_medical_conditions: from('has_conditions'), medical_conditions_detail: from('conditions') ?? '',
    had_recent_surgery: from('recent_surgery'), had_bad_reaction: from('had_bad_reaction','bad_reaction'),
    bad_reaction_detail: from('bad_reaction_detail','bad_reaction_details') ?? '', known_deficiencies: array(from('deficiencies')),
    consent_acknowledged: from('consent') === true,
  };
  const photoFiles = array(state?.files).filter(f => f.step === 'photos').map(f => ({id:f.id,slot:f.slot,name:f.original_name || f.filename || 'Photo'}));
  const docFiles = array(state?.files).filter(f => f.step === 'health').map(f => ({id:f.id,slot:f.slot,name:f.original_name || f.filename || 'Document'}));
  return { ...common, uploaded_photos: photoFiles, uploaded_documents: docFiles };
}
