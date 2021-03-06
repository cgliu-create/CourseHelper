/// <reference path='toggle.ts'/>
/// <reference path='coursesDataTree.ts' />
/// <reference path="coursesForms.ts" />


let forms = ['majorforms', 'categoryforms', 'subcategoryforms',
      'requirementforms', 'courseforms', 'prereqforms', 'apforms'];
//some button functions for toggling
function activateCourseButtons(){
    let refresh = document.getElementById('refreshcoursesdata')
    // refresh button is shown only when user is signed in
    if (refresh != null) {
      refresh.onclick = ()=>{ 
        updateCoursesData();
      }  
      document.getElementById('majoroperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('majorforms');
        activateMajorFormA();
        activateMajorFormB();
      }
      document.getElementById('categoryoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('categoryforms');
        activateCategoryFormA();
        activateCategoryFormB();
      }
      document.getElementById('subcategoryoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('subcategoryforms');
        activateSubcategoryFormA();
        activateSubcategoryFormB();
      }
      document.getElementById('requirementoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('requirementforms');
        activateRequirementFormA();
        activateRequirementFormB();
      }
      document.getElementById('courseoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('courseforms');
        activateCourseFormA();
        activateCourseFormB();
      }
      document.getElementById('prereqoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('prereqforms');
        activatePrereqForms();
      }
      document.getElementById('apoperation').onclick = ()=>{
        for (const item of forms) { dontShowIt(item);}
        showIt('apforms');
        activateAPFormA();
        activateAPFormB();
      }
    }
    let operations = [
      "majorFormA", "majorFormB",
      "categoryFormA", "categoryFormB", "categoryFormC",
      "subcategoryFormA", "subcategoryFormB", "subcategoryFormC", 
      "requirementFormA", "requirementFormB", "requirementFormC",
      "courseFormA", "courseFormB", "courseFormC",
      "prereqFormA", "apFormA", "apFormB"
    ];
    if (document.getElementById('majorforms') != null) {
      document.getElementById('createmajoroperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("majorFormA");
        activateMajorFormA();
      }
      document.getElementById('deletemajoroperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("majorFormB"); 
        activateMajorFormB();
      }
    }
    if (document.getElementById('categoryforms') != null) {
      document.getElementById('createcategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("categoryFormA");
        activateCategoryFormA();
      }
      document.getElementById('addcategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("categoryFormC"); 
        activateCategoryFormC();
      }
      document.getElementById('deletecategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("categoryFormB"); 
        activateCategoryFormB();
      }
    }
    if (document.getElementById('subcategoryforms') != null) {
      document.getElementById('createsubcategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("subcategoryFormA");
        activateSubcategoryFormA();
      }
      document.getElementById('addsubcategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("subcategoryFormC"); 
        activateSubcategoryFormC();
      }
      document.getElementById('deletesubcategoryoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("subcategoryFormB");
        activateSubcategoryFormB();
      }
    }
    if (document.getElementById('requirementforms') != null) {
      document.getElementById('createrequirementoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("requirementFormA");
        activateRequirementFormA();
      }
      document.getElementById('addrequirementoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("requirementFormC");
        activateRequirementFormC();
      }
      document.getElementById('deleterequirementoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("requirementFormB"); 
        activateRequirementFormB();
      }
    }
    if (document.getElementById('courseforms') != null) {
      document.getElementById('createcourseoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("courseFormA");
        activateCourseFormA();
      }
      document.getElementById('addcourseoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("courseFormC"); 
        activateCourseFormC();
      }
      document.getElementById('deletecourseoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("courseFormB"); 
        activateCourseFormB();
      }
    } 
    if (document.getElementById('prereqforms') != null) {
      document.getElementById('addprereqoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("prereqFormA"); 
        showIt("prereqaddbutton");
        dontShowIt("prereqdeletebutton");
        activatePrereqForms();
      }
      document.getElementById('deleteprereqoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("prereqFormA");
        showIt("prereqdeletebutton");
        dontShowIt("prereqaddbutton");
        activatePrereqForms();
      }
    } 
    if (document.getElementById('apforms') != null) {
      document.getElementById('createapoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("apFormA");
        activateAPFormA();
      }
      document.getElementById('addapoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("apFormB"); 
        showIt("apaddbutton");
        dontShowIt("apdeletebutton");
        activateAPFormB();
      }
      document.getElementById('deleteapoperation').onclick = () => {
        for (const operation of operations) { dontShowIt(operation); } 
        showIt("apFormB"); 
        showIt("apdeletebutton");
        dontShowIt("apaddbutton");
        activateAPFormB();
      }
    } 
}
