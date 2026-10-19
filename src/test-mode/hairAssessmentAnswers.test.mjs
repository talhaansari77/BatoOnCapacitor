import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,hairAssessmentAnswer} from '../lib/hairAssessmentAnswers.js';
test('every Hair answer follows the selected language, including saved legacy answers',()=>{
 for(const question of QUESTIONS)question.optionsEn.forEach((english,index)=>{
 const arabic=question.optionsAr[index];
 assert.equal(hairAssessmentAnswer(english,true),arabic);
 assert.equal(hairAssessmentAnswer(arabic,false),english);
 assert.equal(hairAssessmentAnswer(arabic,true),arabic);
 assert.equal(hairAssessmentAnswer(english,false),english);
 });
});
test('multiple answers use matching locale labels and punctuation',()=>{
 const question=QUESTIONS.find(q=>q.multiple);
 assert.equal(hairAssessmentAnswer(question.optionsEn.slice(0,2),true),question.optionsAr.slice(0,2).join('، '));
 assert.equal(hairAssessmentAnswer(question.optionsAr.slice(0,2),false),question.optionsEn.slice(0,2).join(', '));
});
