import assert from "node:assert/strict";
import {selectCareLanguage,selectCareProse} from "../lib/careArabic.js";
const legacy="Read your care guide. / راجع دليل العناية.\nAsk your team. / اسأل فريقك.";
assert.equal(selectCareLanguage(legacy,"en"),"Read your care guide.\nAsk your team.");
assert.equal(selectCareLanguage(legacy,"ar"),"راجع دليل العناية.\nاسأل فريقك.");
assert.equal(selectCareLanguage("راجع الدليل. / Read the guide.","en"),"Read the guide.");
assert.equal(selectCareLanguage("Iron / Ferritin","en"),"Iron / Ferritin");
assert.equal(selectCareLanguage("Use PRP when directed.","en"),"Use PRP when directed.");
assert.equal(selectCareLanguage("تقييم الشعر","en"),"Hair Assessment");
const steps="Preview instruction: read your supplied care guide.\nPreview instruction: ask the Skin Team if anything is unclear.";
assert.equal(selectCareLanguage(steps,"ar"),"تعليمات اختبار: راجع دليل العناية المقدم لك.\nتعليمات اختبار: اسأل فريق البشرة عن أي أمر غير واضح.");
assert.match(selectCareProse("Untranslated clinic instruction.","ar"),/غير متاحة بالعربية/);
assert.match(selectCareProse("تعليمات خاصة غير مترجمة.","en"),/not available in English/);
assert.equal(selectCareProse("راجع تعليمات PRP مع فريقك.","ar"),"راجع تعليمات PRP مع فريقك.");
console.log("PASS: single-language legacy notes, both language directions, preserved multiline instructions, medical abbreviations, and explicit unavailable translation notices.");

assert.match(selectCareProse("تعليمات: read the guide", "ar"),/غير متاحة بالعربية/);
