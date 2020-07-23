/// <reference path="dataTree.ts" />
/// <reference path="sessionData.ts" />
/// <reference path="helperButtons.ts" />

function createCourseBlock(workspace_id:string, course_name:string, credit:string){
    let workspace = document.getElementById(workspace_id);
    if (workspace == null) { return} 
    let course = document.createElement("div");
    course.className = "hstack";
    let name = document.createElement("label");
    name.innerHTML = course_name;
    let value = document.createElement("button");
    value.innerHTML = credit;
    course.appendChild(name);
    course.appendChild(value);
    workspace.appendChild(course);
}

function getCourseCredit(course_name:string){
    let courses = getSessionData("course");
    if (courses == null){ return}
    for (const course of courses) {
        if (course != null) {
            let name = course[0].substring(course[0].lastIndexOf("/")+1);
            let credit = course[1];
            if (name == course_name) {
                return credit;
            }
        }
    }
    return "not found" 
}

function showTermCourses(term_name:string){
    clearData("coursesinaterm");
    let mycourses = getSessionData("mycourse");
    if (mycourses == null){ return}
    let term_courses = [];
    for (const course of mycourses) {
        if ( course != null) {
            if (course.indexOf(term_name)!=-1) {
                term_courses.push(course);
            }
        }
    }
    for (const term_course of term_courses) {
        if (term_course != null) {
            let term_course_content = readMySessionString(term_course);
            alert(term_course_content)
            let course_name = term_course_content[2];
            let credit_num = getCourseCredit(course_name);
            let credit = `${credit_num}`;
            createCourseBlock("coursesinaterm", course_name, credit);
        } 
    }
}

function showTranferCourses(test_name:string){
    clearData("coursesinaptranfer");
    let mytests = getSessionData("myap");
    if (mytests == null){ return}
    let myscore = "";
    for (const test of mytests) {
        if (test != null){
            let test_content = readMySessionString(test);
            if (test_content[0] == test_name){
                myscore = test_content[1];
            }
        }
    }
    let ap_data = getSessionData("test");
    if (ap_data == null){ return}
    let coursesap:string[] = [];
    for (const ap_test of ap_data) {
        if (ap_test != null) {
            let ap_content = readMySessionString(ap_test);
            let ap_name = ap_content[ap_content.length - 3];
            if (ap_name == test_name) {
                let score_min = parseInt(ap_content[ap_content.length - 2]);
                let score_max = parseInt(ap_content[ap_content.length - 1]);
                let score = parseInt(myscore);
                if (score_min <= score && score <= score_max) {
                    let course_name = ap_content[ap_content.length - 4];
                    let credit_num = getCourseCredit(course_name);
                    let credit = `${credit_num}`;
                    coursesap.push(course_name);
                    createCourseBlock("coursesinaptranfer", course_name, credit); 
                }
            }
        }
    }
    addAPTranferSessionData(coursesap, test_name);
}
