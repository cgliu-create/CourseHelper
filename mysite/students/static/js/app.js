"use strict";
// --- making a request for data ---
function requestAJAX(url_source, workspace_id, add_data_function) {
    let my_request = new XMLHttpRequest();
    my_request.open('GET', url_source, true);
    my_request.onload = () => {
        if (my_request.status == 200) {
            let response = my_request.responseXML;
            if (response != null) {
                add_data_function(workspace_id, response);
            }
        }
    };
    my_request.send();
    // cant return value in an asynchronous request
}
// --- spaces in url_source ---
function substituteChar(message, spot, item) {
    let before = message.substring(0, spot);
    let after = message.substring(spot + 1);
    let result = before + item + after;
    return result;
}
function substituteURLSpace(message) {
    let edited_message = message;
    if (message.indexOf(' ') == -1) {
        return message;
    }
    for (let index = 0; index < message.length; index++) {
        let char = message.charAt(index);
        if (char == ' ') {
            edited_message = substituteChar(edited_message, index, '%20');
        }
    }
    return edited_message;
}
function readMyDataInput(inputs, input_breakdown, options, option_breakdown) {
    let data = {};
    if (options != null) {
        for (let index = 0; index < options.length; index++) {
            const selector = options[index];
            if (selector != null) {
                const selector_breakdown = option_breakdown[index];
                let values = getSelectionValue(selector);
                let value_list = readMySessionString(values);
                for (let v_index = 0; v_index < value_list.length; v_index++) {
                    const value = value_list[v_index];
                    const tag = selector_breakdown[v_index];
                    data[tag] = value;
                }
            }
        }
    }
    if (inputs != null) {
        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            let value = getInputValue(input);
            let tag = input_breakdown[index];
            data[tag] = value;
        }
    }
    return data;
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
/// django - ajax
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function activateTHISForm(submit_button_id, url_request, inputs, input_breakdown, options, option_breakdown, onclick_update_function) {
    document.getElementById(submit_button_id).onclick = () => {
        let json_data = readMyDataInput(inputs, input_breakdown, options, option_breakdown);
        $.ajax({
            url: url_request,
            type: "POST",
            data: json_data,
            dataType: "json",
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            },
            success: function () {
                //alert("ok");
            },
            error: function () {
                //alert("no");
            }
        });
        if (onclick_update_function != null) {
            onclick_update_function();
        }
    };
}
// show and don't show operations
function showIt(id) {
    let element = document.getElementById(id);
    if (element == null) {
        return;
    }
    element.style.display = 'block';
}
function dontShowIt(id) {
    let element = document.getElementById(id);
    if (element == null) {
        return;
    }
    element.style.display = 'none';
}
function toggleIt(element) {
    if (element == null) {
        return;
    }
    if (element.style.display === 'block') {
        element.style.display = 'none';
    }
    else {
        element.style.display = 'block';
    }
}
function toggleShow(id) {
    let element = document.getElementById(id);
    toggleIt(element);
}
// adding session data
// --- helper 
function addSessionDataList(data, data_name) {
    window.sessionStorage.setItem(data_name, JSON.stringify(data));
}
// ---
function addSessionCourses(majors, categories, subcategories, requirements, courses, prereqs, ap) {
    addSessionDataList(majors, "major");
    addSessionDataList(categories, "category");
    addSessionDataList(subcategories, "subcategory");
    addSessionDataList(requirements, "requirement");
    addSessionDataList(courses, "course");
    addSessionDataList(prereqs, "prereq");
    addSessionDataList(ap, "ap");
}
function addSessionMajors(majors) {
    addSessionDataList(majors, "mymajor");
}
function addSessionAP(ap) {
    addSessionDataList(ap, "myap");
}
function addSessionPlanner(years, semesters) {
    addSessionDataList(years, "myyear");
    addSessionDataList(semesters, "mysemester");
}
function addSessionSchedule(schedules, courses) {
    addSessionDataList(schedules, "myschedule");
    addSessionDataList(courses, "mycourse");
}
function addAPTranferSessionData(courses, ap_test) {
    addSessionDataList(courses, `mycourseap-${ap_test}`);
}
// interacting with session data
function clearSession() {
    window.sessionStorage.clear();
}
function removeSessionData(data_id) {
    window.sessionStorage.removeItem(data_id);
}
function getSessionData(data_id) {
    let data = window.sessionStorage.getItem(data_id);
    return JSON.parse(data);
}
function readMySessionString(data_string) {
    let data_content = data_string;
    let output = [];
    while (data_content.indexOf("/") != -1) {
        let data = data_content.substring(0, data_content.indexOf("/"));
        output.push(data);
        data_content = data_content.substring(data_content.indexOf("/") + 1);
    }
    output.push(data_content);
    return output;
}
function getSubSessionData(data_id) {
    let data = getSessionData(data_id);
    if (data == null) {
        return;
    }
    let subdata = [];
    for (const info of data) {
        subdata.push(info[0]);
    }
    return subdata;
}
// reading xml response
function readXMLNodes(tags, subdatatags, subparenttags) {
    let tag_data = [];
    for (const tag of tags) {
        let tag_content = tag.childNodes;
        let subtag_data = {};
        for (const node of tag_content) {
            for (const subtag of subdatatags) {
                if (node.nodeName == subtag) {
                    subtag_data[subtag] = node.textContent;
                }
            }
            if (subparenttags != null) {
                for (const subtag of subparenttags) {
                    if (node.nodeName == subtag) {
                        subtag_data[subtag] = node;
                    }
                }
            }
        }
        tag_data.push(subtag_data);
    }
    return tag_data;
}
function readMainTags(tags, subdatatags, subparenttags) {
    return readXMLNodes(tags, subdatatags, subparenttags);
}
function readSubNodeList(list, subdatatags, subparenttags) {
    return readXMLNodes(list, subdatatags, subparenttags);
}
///<reference path='ajax.ts'/>
///<reference path='dataTree.ts'/>
/// <reference path='sessionDataStuff.ts' />
/// <reference path='readXML.ts' />
//helperdata
// my majors
// --- major helper functions ---
function addListedMajors(workspace_id, response) {
    let session_mymajors = [];
    let majors = response.getElementsByTagName('major');
    for (const major of majors) {
        session_mymajors.push(major.innerHTML);
    }
    //display majors in tracker
    //add session data
    addSessionMajors(session_mymajors);
}
// ---
// resulting ajax function
function updateMajorData() {
    let workspace_id = 'majorstracked';
    clearData(workspace_id);
    let url_source = '/requestmymajors';
    requestAJAX(url_source, workspace_id, addListedMajors);
}
// my ap
// --- ap helper functions ---
function readMyAP(tests) {
    return readMainTags(tests, ["test_name", "test_score"], null);
}
function addListedAp(workspace_id, response) {
    let session_myap = [];
    let tests = response.getElementsByTagName('test');
    let test_data = readMyAP(tests);
    for (const test of test_data) {
        let info = `${test.test_name}/${test.test_score}`;
        session_myap.push(info);
    }
    //display majors in tracker
    //add session data
    addSessionAP(session_myap);
}
// ---
// resulting ajax function
function updateAPData() {
    let workspace_id = '';
    clearData(workspace_id);
    let url_source = '/requestmytransfercredit';
    requestAJAX(url_source, workspace_id, addListedAp);
}
// my planner
// --- planner helper functions ---
function readMyYears(years) {
    return readMainTags(years, ["year_name"], ["semesters"]);
}
function readMySemesters(semesters) {
    return readSubNodeList(semesters, ["semester_name"], null);
}
function addPlannerData(workspace_id, response) {
    // --- session catalog ---
    let session_years = []; // ex year
    let session_semesters = []; // ex year/semester
    // ---
    let years = response.getElementsByTagName('year');
    let year_data = readMyYears(years);
    for (const year of year_data) {
        // data tree
        if (year.year_name == "before") {
            addCaretList(workspace_id, `YEAR:${year.year_name}`, true, "myapactions");
        }
        else {
            addCaretList(workspace_id, `YEAR:${year.year_name}`, false, null);
        }
        // session
        session_years.push(year.year_name);
        if (year.semesters != null) {
            let semesters = year.semesters.childNodes;
            let semester_data = readMySemesters(semesters);
            for (const semester of semester_data) {
                // data tree
                addCaretList(`YEAR:${year.year_name}`, semester.semester_name, true, "mytermactions");
                // session
                session_semesters.push(`${year.year_name}/${semester.semester_name}`);
            }
        }
    }
    addSessionPlanner(session_years, session_semesters);
}
// resulting ajax function
function updatePlannerData() {
    let workspace_id = 'plannerdata';
    clearData(workspace_id);
    let url_source = '/requestmyplanner';
    requestAJAX(url_source, workspace_id, addPlannerData);
}
// my schedule
// --- schedule helper functions ---
function readMySchedules(schedules) {
    return readMainTags(schedules, ["schedule_name"], ["courses"]);
}
function readMyCourses(courses) {
    return readSubNodeList(courses, ["course_name"], null);
}
function addScheduleData(workspace_id, response) {
    // --- session catalog ---
    let session_schedules = []; // ex sched (semester)
    let session_courses = []; // ex sched/course
    // ---
    let schedules = response.getElementsByTagName('schedule');
    let schedule_data = readMySchedules(schedules);
    for (const schedule of schedule_data) {
        // session
        session_schedules.push(schedule.schedule_name);
        if (schedule.courses != null) {
            let courses = schedule.courses.childNodes;
            let course_data = readMyCourses(courses);
            for (const course of course_data) {
                // session
                session_courses.push(`${schedule.schedule_name}/${course.course_name}`);
            }
        }
    }
    addSessionSchedule(session_schedules, session_courses);
}
// resulting ajax function
function updateScheduleData() {
    let workspace_id = '';
    clearData(workspace_id);
    let url_source = '/requestmyschedule';
    requestAJAX(url_source, workspace_id, addScheduleData);
}
/// <reference path="dataTree.ts" />
/// <reference path="sessionDataStuff.ts" />
/// <reference path="helperButtons.ts" />
/// <reference path="betterDark.ts" />
function createMajorTracker(workspace_id, major_name) {
    let workspace = document.getElementById(workspace_id);
    if (workspace == null) {
        return;
    }
    let tracker = document.createElement("div");
    tracker.className = "hstack tracker";
    let name = document.createElement("label");
    name.innerHTML = major_name;
    let progress = document.createElement("button");
    progress.onclick = () => {
        for (const item of actions) {
            dontShowIt(item);
        }
        showIt('status');
    };
    progress.className = "bigfield progresscontainer";
    let background = document.createElement("div");
    background.className = "progress";
    let bar = document.createElement("div");
    bar.className = "bar";
    bar.id = `${major_name}-bar`;
    bar.innerHTML = "progress";
    background.appendChild(bar);
    progress.appendChild(background);
    tracker.appendChild(name);
    tracker.appendChild(progress);
    workspace.appendChild(tracker);
    //dark
    if (workspace.style.backgroundColor == "black") {
        darkit(bar);
        darkit(background);
        darkit(progress);
        darkit(name);
        darkit(tracker);
    }
}
function showTrackedMajors() {
    clearData("majorstracked");
    let majors = getSessionData("mymajor");
    if (majors == null) {
        return;
    }
    for (const major of majors) {
        if (major != null) {
            createMajorTracker("majorstracked", major);
        }
    }
}
/// <reference path="dataTree.ts" />
/// <reference path="sessionDataStuff.ts" />
/// <reference path="helperButtons.ts" />
function createCourseBlock(workspace_id, course_name, credit) {
    let workspace = document.getElementById(workspace_id);
    if (workspace == null) {
        return;
    }
    let course = document.createElement("div");
    course.className = "hstack";
    let name = document.createElement("label");
    name.innerHTML = course_name;
    if (course_name.length > 10) {
        name.className = "bigfield";
    }
    let value = document.createElement("button");
    value.innerHTML = credit;
    course.appendChild(name);
    course.appendChild(value);
    workspace.appendChild(course);
    // dark
    if (workspace.style.background == "black") {
        darkit(course);
        darkit(value);
        darkit(name);
    }
}
function getCourseCredit(course_name) {
    let courses = getSessionData("course");
    if (courses == null) {
        return;
    }
    for (const course of courses) {
        if (course != null) {
            let name = course[0].substring(course[0].lastIndexOf("/") + 1);
            let credit = course[1];
            if (name == course_name) {
                return credit;
            }
        }
    }
    return "not found";
}
function showTermCourses(term_name) {
    clearData("coursesinaterm");
    let mycourses = getSessionData("mycourse");
    if (mycourses == null) {
        return;
    }
    let term_courses = [];
    for (const course of mycourses) {
        if (course != null) {
            if (course.indexOf(term_name) != -1) {
                term_courses.push(course);
            }
        }
    }
    for (const term_course of term_courses) {
        if (term_course != null) {
            let course_name = term_course.substring(term_course.indexOf("/") + 1);
            ;
            let credit = getCourseCredit(course_name);
            createCourseBlock("coursesinaterm", course_name, credit);
        }
    }
}
function showTranferCourses(test_name) {
    clearData("coursesinaptranfer");
    let mytests = getSessionData("myap");
    if (mytests == null) {
        return;
    }
    let myscore = "";
    for (const test of mytests) {
        if (test != null) {
            let test_content = readMySessionString(test);
            if (test_content[0] == test_name) {
                myscore = test_content[1];
            }
        }
    }
    let ap_data = getSessionData("ap");
    if (ap_data == null) {
        return;
    }
    let coursesap = [];
    for (const ap_test of ap_data) {
        if (ap_test != null) {
            let ap_content = readMySessionString(ap_test);
            let course_relation = "";
            for (let index = 0; index < ap_content.length - 3; index++) {
                course_relation = `${course_relation}/${ap_content[index]}`;
            }
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
                    createCourseBlock("coursesinaptranfer", course_relation, credit);
                }
            }
        }
    }
    addAPTranferSessionData(coursesap, test_name);
}
/// <reference path="ajaxForm.ts" />
function semesterAJAX(sub_url_request, semesters, year) {
    for (const semester of semesters) {
        $.ajax({
            url: sub_url_request,
            type: "POST",
            data: { "year": `${year}`, "semester": semester },
            dataType: "json",
            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            },
            success: function () { },
            error: function () { }
        });
    }
}
function yearAJAX(url_request, year) {
    $.ajax({
        url: url_request,
        type: "POST",
        data: { "year": `${year}` },
        dataType: "json",
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        success: function () { },
        error: function () { }
    });
}
function makeSemesters(year, terms, startingindex = 1, add_or_delete) {
    let semesters = [];
    if (add_or_delete == "add") {
        for (let index = startingindex; index < startingindex + parseInt(terms); index++) {
            let semester = `${year}:TERM-${index}`;
            semesters.push(semester);
        }
    }
    if (add_or_delete == "delete") {
        for (let index = startingindex; index > startingindex - parseInt(terms); index--) {
            let semester = `${year}:TERM-${index}`;
            semesters.push(semester);
        }
    }
    return semesters;
}
function getLatestYearID() {
    let list = document.getElementById("plannerdata");
    let header = list.getElementsByTagName("span");
    let years = [];
    let year_in_question = "";
    for (const element of header) {
        let id = element.id;
        if (id.indexOf("YEAR") != -1) {
            years.push(id);
        }
    }
    year_in_question = years[years.length - 1];
    for (const year_id of years) {
        let symbol = document.getElementById(year_id);
        if (symbol.className == "caret caret-down") {
            year_in_question = year_id;
        }
    }
    let year_value = year_in_question.substring(year_in_question.indexOf("-") + 1);
    return year_value;
}
function activateYearManager() {
    document.getElementById("addbuttonyearmanager").onclick = () => {
        let startingyear = document.getElementById("startingyear").value;
        let yearnum = document.getElementById("plannerdata").children.length;
        if (yearnum == 0) {
            yearAJAX("/addMyYear", startingyear);
        }
        if (yearnum >= 1) {
            let year = `${parseInt(startingyear) + (yearnum)}`;
            yearAJAX("/addMyYear", year);
        }
    };
    document.getElementById("deletebuttonyearmanager").onclick = () => {
        let year_id = getLatestYearID();
        let year = year_id.substring(year_id.indexOf(":") + 1);
        if (year != null) {
            yearAJAX("/deleteMyYear", year);
        }
    };
    document.getElementById("addbuttonsemestermanager").onclick = () => {
        let terms = document.getElementById("termsperyear").value;
        let year = getLatestYearID();
        let index = document.getElementById(year).children.length + 1;
        if (year != null) {
            let year_val = year.substring(year.indexOf(":") + 1);
            let semesters = makeSemesters(year_val, terms, index, "add");
            semesterAJAX("/addMySemester", semesters, year_val);
        }
    };
    document.getElementById("deletebuttonsemestermanager").onclick = () => {
        let terms = document.getElementById("termsperyear").value;
        let year = getLatestYearID();
        let index = document.getElementById(year).children.length;
        if (year != null) {
            let year_val = year.substring(year.indexOf(":") + 1);
            let semesters = makeSemesters(year_val, terms, index, "delete");
            semesterAJAX("/deleteMySemester", semesters, year_val);
        }
    };
}
function updatemajormanageroptionsmajors() {
    addSelectionOptions("majormanageroptionsmajors", getSessionData("major"));
}
function activateMajorManagerAdd() {
    updatemajormanageroptionsmajors();
    activateTHISForm("majormanageraddbutton", "/addMyMajor", null, null, ["majormanageroptionsmajors"], [["major"]], updatemajormanageroptionsmajors);
}
function activateMajorManagerDelete() {
    updatemajormanageroptionsmajors();
    activateTHISForm("majormanagerdeletebutton", "/deleteMajor", null, null, ["majormanageroptionsmajors"], [["major"]], updatemajormanageroptionsmajors);
}
function updatecoursemanageroptions() {
    addSelectionOptions("coursemanageroptionscourse", getSubSessionData("course"));
    addSelectionOptions("coursemanageroptionsterms", getSessionData("mysemester"));
}
function activateCourseManagerAdd() {
    updatecoursemanageroptions();
    activateTHISForm("coursemanageraddbutton", "/addMyCourse", null, null, ["coursemanageroptionscourse", "coursemanageroptionsterms"], [[null, null, null, null, "course"],
        ["year", "semester"]], updatecoursemanageroptions);
}
function activateCourseManagerDelete() {
    updatecoursemanageroptions();
    activateTHISForm("coursemanagerdeletebutton", "/deleteMyCourse", null, null, ["coursemanageroptionscourse", "coursemanageroptionsterms"], [[null, null, null, null, "course"],
        ["year", "semester"]], updatecoursemanageroptions);
}
function inarray(list, value) {
    if (list == null) {
        return false;
    }
    for (const item of list) {
        if (item == value) {
            return true;
        }
    }
    return false;
}
function updatetestmanageroptionstests() {
    let ap_data = getSessionData("ap");
    if (ap_data == null) {
        return;
    }
    let ap = [];
    for (const instance of ap_data) {
        let data = readMySessionString(instance);
        let test_name = data[data.length - 3];
        if (!inarray(ap, test_name)) {
            ap.push(test_name);
        }
    }
    addSelectionOptions("testmanageroptionstests", ap);
}
function activateTestManagerAdd() {
    updatetestmanageroptionstests();
    activateTHISForm("testmanageraddbutton", "/addMyAP", ["testmanagerscore"], ["score"], ["testmanageroptionstests"], [["test_name"]], updatetestmanageroptionstests);
}
function activateTestManagerDelete() {
    updatetestmanageroptionstests();
    activateTHISForm("testmanagerdeletebutton", "/deleteMyAP", ["testmanagerscore"], ["score"], ["testmanageroptionstests"], [["test_name"]], updatetestmanageroptionstests);
}
function activateHelperForms() {
    activateYearManager();
    activateMajorManagerAdd();
    activateMajorManagerDelete();
    activateCourseManagerAdd();
    activateCourseManagerDelete();
    activateTestManagerAdd();
    activateTestManagerDelete();
}
/// <reference path="helperForms.ts" />
/// <reference path="dataTree.ts" />
function getMyCourses() {
    let output = [];
    let cd_courses = getSessionData("mycourse");
    if (cd_courses == null) {
        return output;
    }
    let tests = getSessionData("myap");
    if (tests == null) {
        return output;
    }
    for (const test of tests) {
        let name = `mycourseap-${test.substring(0, test.indexOf("/"))}`;
        let tranfer = getSessionData(name);
        if (tranfer != null) {
            for (const course of tranfer) {
                output.push(`before/${course}`);
            }
        }
    }
    for (const course of cd_courses) {
        output.push(course);
    }
    return output;
}
function recordCompletion(session_data_list, child_session_data_list, child_completion_list) {
    let output_completed_list = [];
    if (session_data_list == null) {
        return output_completed_list;
    }
    for (const data_instance of session_data_list) {
        let data_relation = data_instance;
        let data_child_requirements = [];
        if (child_session_data_list == null) {
            return output_completed_list;
        }
        for (const child_instance of child_session_data_list) {
            let child_relation = child_instance;
            if (child_relation.indexOf(data_relation) != -1) {
                data_child_requirements.push(child_relation);
            } // gather requirements for this data instance
        }
        if (child_completion_list == null) {
            return output_completed_list;
        }
        for (const child of child_completion_list) {
            let name = child.substring(child.lastIndexOf("/") + 1);
            let to_delete = [];
            for (let index = data_child_requirements.length - 1; index >= 0; index--) {
                const element = data_child_requirements[index];
                let test = element.substring(element.lastIndexOf("/") + 1);
                if (test == name) {
                    to_delete.push(index);
                }
            }
            let temp = [];
            for (let index = 0; index < data_child_requirements.length; index++) {
                if (!inarray(to_delete, index)) {
                    temp.push(data_child_requirements[index]);
                }
            }
            data_child_requirements = temp;
        } // remove completed requirements from list
        if (data_child_requirements.length == 0) {
            output_completed_list.push(data_relation);
        }
    }
    return output_completed_list;
}
function buildStatusTree() {
    // list of completed courses
    let cd_courses = getMyCourses();
    let courses = getSubSessionData("course");
    // console.log("----------cour")
    // console.log(cd_courses)
    // console.log(courses)
    // list of completed requirements
    let cd_requirements = [];
    let requirements = getSubSessionData("requirement");
    cd_requirements = recordCompletion(requirements, courses, cd_courses);
    // console.log("----------req")
    // console.log(cd_requirements)
    // console.log(requirements)
    // list of completed subcategories
    let cd_subcategories = [];
    let subcategories = getSubSessionData("subcategory");
    cd_subcategories = recordCompletion(subcategories, requirements, cd_requirements);
    // console.log("----------sub")
    // console.log(cd_subcategories)
    // console.log(subcategories)
    // list of completed categories
    let cd_categories = [];
    let categories = getSessionData("category");
    cd_categories = recordCompletion(categories, subcategories, cd_subcategories);
    // console.log("----------cat")
    // console.log(cd_categories)
    // console.log(categories)
    // list of completed majors
    let cd_majors = [];
    let majors = getSessionData("major");
    cd_majors = recordCompletion(majors, categories, cd_categories);
    // console.log("----------major")
    // console.log(cd_majors)
    // console.log((majors))
    // build data tree with completion marks
    let order = ["MAJ", "CAT", "SUB", "REQ", "COU"];
    let workspace_id = "mystatusdata";
    clearData(workspace_id);
    function build(cd_list, data_list, iscourses) {
        for (const data_instance of data_list) {
            if (data_instance != null) {
                let relation_list = readMySessionString(data_instance);
                if (relation_list.length == 1) {
                    if (inarray(cd_majors, data_instance)) {
                        addStatusList(workspace_id, `MAJ:${data_instance}`, true);
                    }
                    else {
                        addStatusList(workspace_id, `MAJ:${data_instance}`, false);
                    }
                }
                else {
                    let leparent = "";
                    let lechild = "";
                    let name = "";
                    for (let index = 0; index < relation_list.length; index++) {
                        name = `${name}${order[index]}:${relation_list[index]}`;
                        if (index == relation_list.length - 2) {
                            leparent = name;
                        }
                        if (index == relation_list.length - 1) {
                            lechild = name;
                        }
                    }
                    if (iscourses) {
                        let lename = data_instance.substring(data_instance.lastIndexOf("/") + 1);
                        if (inarray(cd_list, lename)) {
                            addStatusList(leparent, lechild, true);
                        }
                        else {
                            addStatusList(leparent, lechild, false);
                        }
                    }
                    else {
                        if (inarray(cd_list, data_instance)) {
                            addStatusList(leparent, lechild, true);
                        }
                        else {
                            addStatusList(leparent, lechild, false);
                        }
                    }
                }
            }
        }
    }
    build(cd_majors, majors, false);
    build(cd_categories, categories, false);
    build(cd_subcategories, subcategories, false);
    build(cd_requirements, requirements, false);
    let names = [];
    for (const name of getMyCourses()) {
        names.push(name.substring(name.indexOf("/") + 1));
    }
    build(names, courses, true);
    cleanUPStatus();
}
function cleanUPStatus() {
    let workspace_id = "mystatusdata";
    let order = ["MAJ", "CAT", "SUB", "REQ", "COU"];
    let tags = document.getElementById(workspace_id).getElementsByTagName("span");
    for (const tag of tags) {
        let id = tag.id;
        let list_id = id.substring(id.indexOf("-") + 1);
        let important = id.substring(indexoflasttag(id, order));
        let list = document.getElementById(list_id);
        if (list.children.length > 0) {
            let check_list = [];
            for (const child of list.children) {
                for (const item of child.children) {
                    if (item.id.indexOf("symbol") != -1) {
                        if (item.className.indexOf("checkmark") != -1) {
                            check_list.push(0);
                        }
                        else {
                            check_list.push(1);
                        }
                    }
                }
            }
            let check = 0;
            for (const num of check_list) {
                check = check + num;
            }
            if (check == 0) {
                document.getElementById(id).className = "checkmark";
            }
            else {
                document.getElementById(id).className = "xmark";
            }
        }
        if (list.children.length == 0 && important.indexOf("COU") == -1) {
            document.getElementById(id).className = "checkmark";
        }
        document.getElementById(id).innerHTML = important;
    }
}
function indexoflasttag(input, tags) {
    let data = {};
    for (const tag of tags) {
        data[tag] = input.lastIndexOf(tag);
    }
    let last = -1;
    for (const tag of tags) {
        if (data[tag] > last) {
            last = data[tag];
        }
    }
    return last;
}
/// <reference path='toggle.ts'/>
/// <reference path='helperData.ts' />
/// <reference path="myMajors.ts" />
/// <reference path="myAP.ts" />
/// <reference path="myYears.ts" />
/// <reference path="betterDark.ts" />
/// <reference path="helperForms.ts" />
/// <reference path="myStatus.ts" />
let actions = ['mymajoractions', 'mytermactions', 'myapactions',
    'tranfercredit', 'status',
    'mycourseoperation'];
function activateHelperButtons() {
    let update = document.getElementById('updatehelperdata');
    // update button is shown only when user is signed in
    if (update != null) {
        update.onclick = () => {
            updateMajorData();
            updateAPData();
            updatePlannerData();
            updateScheduleData();
            showTrackedMajors();
            showAPTransfer();
            showTranferCourses("test");
            activateHelperForms();
            buildStatusTree();
        };
    }
    document.getElementById("aptoggle").onclick = () => {
        toggleShow("myapactions");
        showAPTransfer();
        document.getElementById("aptoggle").classList.toggle("caret-down");
    };
    document.getElementById("extratermbutton").onclick = () => {
        toggleShow("mytermactions");
    };
    document.getElementById("extrayearbutton").onclick = () => {
        toggleShow("tranfercredit");
    };
    document.getElementById('mymajorbutton').onclick = () => {
        toggleShow("status");
        //      toggleShow('mymajoractions');
        //      showTrackedMajors();
        //      activateMajorManagerAdd();
        //      activateMajorManagerDelete();
    };
    document.getElementById('mycoursesbutton').onclick = () => {
        toggleShow('mycourseoperation');
        let year = getLatestYearID();
        let termlist = document.getElementById(year);
        let header = termlist.getElementsByTagName("span");
        let terms = [];
        let term_in_question = "";
        for (const element of header) {
            let id = element.id;
            if (id.indexOf("TERM") != -1) {
                terms.push(id);
            }
        }
        term_in_question = terms[terms.length - 1];
        for (const term_id of terms) {
            let symbol = document.getElementById(term_id);
            if (symbol.className == "caret caret-down") {
                term_in_question = term_id;
            }
        }
        let term_name = term_in_question.substring(term_in_question.indexOf("-") + 1);
        showTermCourses(term_name);
        document.getElementById("thistermname").innerHTML = term_name;
        activateCourseManagerAdd();
        activateCourseManagerDelete();
    };
    document.getElementById('myapbutton').onclick = () => {
        toggleShow('mytestoperation');
        activateTestManagerAdd();
        activateTestManagerDelete();
    };
}
/// <reference path="dataTree.ts" />
/// <reference path="sessionDataStuff.ts" />
/// <reference path="helperButtons.ts" />
/// <reference path="myYears.ts" />
function createAPTracker(workspace_id, test_name, score) {
    let workspace = document.getElementById(workspace_id);
    if (workspace == null) {
        return;
    }
    let ap = document.createElement("div");
    ap.className = "hstack";
    let test = document.createElement("label");
    test.innerHTML = test_name;
    let credit = document.createElement("button");
    credit.innerHTML = score;
    credit.onclick = () => {
        toggleShow('tranfercredit');
        showTranferCourses(test_name);
    };
    ap.appendChild(test);
    ap.appendChild(credit);
    workspace.appendChild(ap);
}
function showAPTransfer() {
    clearData("myaptests");
    let ap_data = getSessionData("myap");
    if (ap_data == null) {
        return;
    }
    for (const test of ap_data) {
        if (test != null) {
            let test_content = readMySessionString(test);
            let test_name = test_content[0];
            let score = test_content[1];
            createAPTracker("myaptests", test_name, score);
        }
    }
}
/// <reference path='toggle.ts'/>
/// <reference path="myAP.ts" />
/// <reference path="betterDark.ts" />
/// <reference path="coursesDataTree.ts" />
/// <reference path="myStatus.ts" />
function clearData(ul_id) {
    let list = document.getElementById(ul_id);
    if (list == null) {
        return;
    }
    while (list.firstChild) {
        let child = list.lastChild;
        if (child != null) {
            list.removeChild((child));
        }
    }
}
function addSpecificData(ul_id, info) {
    let list = document.getElementById(ul_id);
    if (list == null) {
        return;
    }
    let data = document.createElement('li');
    data.innerHTML = info;
    list.appendChild(data);
}
function addDataList(parent_ul_id, name, symbol_type, toggle_function) {
    let parent = document.getElementById(parent_ul_id);
    if (parent == null) {
        return;
    }
    let toggle = document.createElement('li');
    let symbol = document.createElement('span');
    symbol.innerHTML = name;
    symbol.id = `symbol-${name}`;
    symbol.className = symbol_type;
    symbol.onclick = () => {
        toggle_function(symbol);
        if (name.indexOf("MAJOR") != -1) {
            cleanUpDataTree();
        }
        if (name.indexOf("YEAR") != -1 && name.lastIndexOf("before") != -1) {
            showAPTransfer();
            toggleShow('mytestoperation');
        }
        if (name.indexOf("TERM") != -1) {
            showTermCourses(name);
        }
    };
    let nested = document.createElement('ul');
    nested.className = 'nested';
    nested.id = name;
    toggle.appendChild(symbol);
    toggle.appendChild(nested);
    parent.appendChild(toggle);
    // dark
    if (parent.style.background == "black") {
        darkit(nested);
        darkit(toggle);
        darkit(symbol);
    }
}
function addCaretList(parent_ul_id, name, is_special, special_id) {
    let toggle_function = function click(symbol) {
        let data = symbol.parentElement.querySelector(".nested");
        toggleIt(data);
        symbol.classList.toggle("caret-down");
        if (is_special) {
            if (parent_ul_id == `Year:before`) {
                showAPTransfer();
            }
            else if (parent_ul_id.indexOf("Year:") != -1) {
                showTermCourses(parent_ul_id.substring(parent_ul_id.indexOf(":") + 1));
            }
            cleanUPStatus();
            let element = document.getElementById(special_id);
            toggleIt(element);
        }
    };
    addDataList(parent_ul_id, name, 'caret', toggle_function);
}
function addStatusList(parent_ul_id, name, status) {
    let mark = 'xmark';
    if (status) {
        mark = 'checkmark';
    }
    let toggle_function = function click(symbol) {
        let data = symbol.parentElement.querySelector(".nested");
        toggleIt(data);
        if (status) {
            symbol.classList.toggle("checkmark_down");
        }
        else {
            symbol.classList.toggle("xmark-down");
        }
    };
    addDataList(parent_ul_id, name, mark, toggle_function);
}
function addSelectionOptions(selection_id, values) {
    clearData(selection_id);
    let selector = document.getElementById(selection_id);
    if (selector == null) {
        return;
    }
    if (values == null) {
        return;
    }
    for (const value of values) {
        let option = document.createElement('option');
        option.value = value;
        option.innerHTML = value;
        selector.append(option);
    }
}
function getSelectionValue(selection_id) {
    let selector = document.getElementById(selection_id);
    let option = selector.options[selector.selectedIndex].value;
    return option;
}
function getInputValue(input_id) {
    let input_value = document.getElementById(input_id).value;
    return input_value;
}
///<reference path='ajax.ts'/>
///<reference path='dataTree.ts'/>
///<reference path='sessionDataStuff.ts'/>
///<reference path="readXML.ts" />
// courses tree data
// --- courses data helper functions ---
function readMajors(majors) {
    return readMainTags(majors, ["major_name"], ["categories"]);
}
function readCategories(categories) {
    return readSubNodeList(categories, ["category_name"], ["subcategories"]);
}
function readSubcategories(subcategories) {
    return readSubNodeList(subcategories, ["subcategory_name", "subcategory_data"], ["requirements"]);
}
function readRequirements(requirements) {
    return readSubNodeList(requirements, ["requirement_name", "requirement_data"], ["courses"]);
}
function readCourses(courses) {
    return readSubNodeList(courses, ["course_name", "course_data"], ["prereqs", "ap"]);
}
function readPrereqs(prereqs) {
    return readSubNodeList(prereqs, ["prereq_name"], null);
}
function readAp(ap) {
    return readSubNodeList(ap, ["test_name"], null);
}
function addCoursesData(workspace_id, response) {
    // -- data tree --
    // ex major:major_name
    // -- session catalog ---
    let session_majors = []; //ex  major
    let session_categories = []; //ex major/category
    let session_subcategories = []; //ex major/category/subcategory //ex subcategory/note
    let session_requirements = []; //ex major/category/subcategory/requirement //ex requirement/credit
    let session_courses = []; //ex major/category/subcategory/requirement/course //ex course/credit
    let session_prereqs = []; //ex  major/category/subcategory/requirement/course/prereq/course
    let session_ap = []; //ex  major/category/subcategory/requirement/course/test/testname
    // ---
    let majors = response.getElementsByTagName('major');
    let major_data = readMajors(majors);
    for (const major of major_data) {
        // data tree
        addCaretList(workspace_id, `MAJOR:${major.major_name}`, false, null);
        // session
        session_majors.push(major.major_name);
        if (major.categories != null) {
            let categories = major.categories.childNodes;
            let category_data = readCategories(categories);
            for (const category of category_data) {
                // data tree
                addCaretList(`MAJOR:${major.major_name}`, `${major.major_name}CATEGORY:${category.category_name}`, false, null);
                // session
                session_categories.push(`${major.major_name}/${category.category_name}`);
                if (category.subcategories != null) {
                    let subcategories = category.subcategories.childNodes;
                    let subcategory_data = readSubcategories(subcategories);
                    for (const subcategory of subcategory_data) {
                        // data tree
                        addCaretList(`${major.major_name}CATEGORY:${category.category_name}`, `${major.major_name}${category.category_name}SUBCATEGORY:${subcategory.subcategory_name}`, false, null);
                        // session
                        let session_subcategories_data = [];
                        session_subcategories_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}`);
                        session_subcategories_data.push(`${subcategory.subcategory_data}`);
                        session_subcategories.push(session_subcategories_data);
                        if (subcategory.requirements != null) {
                            let requirements = subcategory.requirements.childNodes;
                            let requirement_data = readRequirements(requirements);
                            for (const requirement of requirement_data) {
                                // data tree
                                addCaretList(`${major.major_name}${category.category_name}SUBCATEGORY:${subcategory.subcategory_name}`, `${major.major_name}${category.category_name}${subcategory.subcategory_name}REQUIREMENT:${requirement.requirement_name}`, false, null);
                                // session
                                let session_requirements_data = [];
                                session_requirements_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}`);
                                session_requirements_data.push(`${requirement.requirement_data}`);
                                session_requirements.push(session_requirements_data);
                                if (requirement.courses != null) {
                                    let courses = requirement.courses.childNodes;
                                    let course_data = readCourses(courses);
                                    for (const course of course_data) {
                                        // data tree
                                        addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}REQUIREMENT:${requirement.requirement_name}`, `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`, false, null);
                                        // session
                                        let session_courses_data = [];
                                        session_courses_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}/${course.course_name}`);
                                        session_courses_data.push(`${course.course_data}`);
                                        session_courses.push(session_courses_data);
                                        if (course.prereqs != null) {
                                            // data tree
                                            addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`, `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}PREREQ:${course.course_name}`, false, null);
                                            let prereqs = course.prereqs.childNodes;
                                            let prereq_data = readPrereqs(prereqs);
                                            for (const prereq of prereq_data) {
                                                addSpecificData(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}PREREQ:${course.course_name}`, prereq.prereq_name);
                                                // session
                                                session_prereqs.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}/${course.course_name}/prereq/${prereq.prereq_name}`);
                                            }
                                        }
                                        if (course.ap != null) {
                                            // data tree
                                            addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`, `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}AP:${course.course_name}`, false, null);
                                            let ap = course.ap.childNodes;
                                            let ap_data = readAp(ap);
                                            for (const ap_test of ap_data) {
                                                addSpecificData(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}AP:${course.course_name}`, ap_test.test_name);
                                                // session
                                                session_ap.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}/${course.course_name}/test/${ap_test.test_name}`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    addSessionCourses(session_majors, session_categories, session_subcategories, session_requirements, session_courses, session_prereqs, session_ap);
}
function cleanUpDataTree() {
    let tags = ["major", "category", "subcategory", "requirement", "course"];
    for (const tag of tags) {
        let data = [];
        if (tag == "subcategory" || tag == "requirement" || tag == "course") {
            data = getSubSessionData(tag);
        }
        else {
            data = getSessionData(tag);
        }
        if (data == null) {
            return;
        }
        for (const instance of data) {
            let separated_sections = readMySessionString(instance);
            let tree_name = "";
            let important = "";
            for (let index = 0; index < separated_sections.length; index++) {
                let section = separated_sections[index];
                tree_name = tree_name;
                if (index == separated_sections.length - 1) {
                    if (tag == "course") {
                        let prereq = `symbol-${tree_name}PREREQ:${section}`;
                        let ap = `symbol-${tree_name}AP:${section}`;
                        document.getElementById(prereq).innerHTML = `PREREQ:${section}`;
                        document.getElementById(ap).innerHTML = `AP:${section}`;
                    }
                    tree_name = `${tree_name}${tag.toUpperCase()}:${section}`;
                    important = `${tag.toUpperCase()}:${section}`;
                }
                else {
                    tree_name = `${tree_name}${section}`;
                }
            }
            let id = `symbol-${tree_name}`;
            document.getElementById(id).innerHTML = important;
        }
    }
}
// resulting ajax function
function updateCoursesData() {
    let workspace_id = 'coursesdata';
    clearData(workspace_id);
    let url_source = '/requestcoursesdata';
    requestAJAX(url_source, workspace_id, addCoursesData);
}
/// <reference path="coursesDataTree.ts" />
function darkit(thing) {
    thing.style.background = "black";
    thing.style.color = "white";
    thing.style.borderColor = "white";
}
function undarkit(thing) {
    thing.style.background = "transparent";
    thing.style.color = "black";
    thing.style.borderColor = "black";
}
function toggledark(tag) {
    let things = document.getElementsByTagName(tag);
    for (let thing of things) {
        let thingy = thing;
        if (thingy.style.background != "black") {
            if (thingy.className != "modal") {
                darkit(thingy);
            }
        }
        else {
            undarkit(thingy);
        }
    }
}
function thisNeedsToBeWhite(thing) {
    if (thing.hasChildNodes) {
        for (const child of thing.children) {
            let working_child = child;
            working_child.style.background = "white";
            thisNeedsToBeWhite(working_child);
        }
    }
    else {
        return;
    }
}
function togglemodal() {
    let things = document.getElementsByClassName("modal");
    let darkmode = document.getElementById("darkmode");
    for (const thing of things) {
        if (darkmode.style.background != "black") {
            let working_thing = thing;
            thisNeedsToBeWhite(working_thing);
        }
    }
}
function darkmode() {
    toggledark("body");
    toggledark("input");
    toggledark("select");
    toggledark("label");
    toggledark("button");
    toggledark("section");
    toggledark("ul");
    toggledark("li");
    toggledark("h1");
    toggledark("h2");
    toggledark("span");
    toggledark("b");
    toggledark("form");
    toggledark("div");
    togglemodal();
    cleanUpDataTree();
}
/// <reference path="dataTree.ts" />
/// <reference path="sessionDataStuff.ts" />
/// <reference path="ajaxForm.ts" />
// major create
function activateMajorFormA() {
    activateTHISForm("majorcreatebutton", "/courses/createmajor", ["majorFormAmajor"], ["major"], null, null, null);
}
// major delete
function updatemajorFormBoptionsmajors() {
    addSelectionOptions("majorFormBoptionsmajors", getSessionData("major"));
}
function activateMajorFormB() {
    updatemajorFormBoptionsmajors();
    activateTHISForm("majordeletebutton", "/courses/deletemajor", null, null, ["majorFormBoptionsmajors"], [["major"]], updatemajorFormBoptionsmajors);
}
//------------------------------
// category create
function updatecategoryFormAoptionsmajors() {
    addSelectionOptions("categoryFormAoptionsmajors", getSessionData("major"));
}
function activateCategoryFormA() {
    updatecategoryFormAoptionsmajors();
    activateTHISForm("categorycreatebutton", "/courses/createcategory", ["categoryFormAcategory"], ["category"], ["categoryFormAoptionsmajors"], [["major"]], updatecategoryFormAoptionsmajors);
}
// category delete
function updatecategoryFormBoptionscategories() {
    addSelectionOptions("categoryFormBoptionscategories", getSessionData("category"));
}
function activateCategoryFormB() {
    updatecategoryFormBoptionscategories();
    activateTHISForm("categorydeletebutton", "/courses/deletecategory", null, null, ["categoryFormBoptionscategories"], [["major", "category"]], updatecategoryFormBoptionscategories);
}
// category add
function updatecategoryFormCoptionscategories() {
    addSelectionOptions("categoryFormCoptionsmajors", getSessionData("major"));
    addSelectionOptions("categoryFormCoptionscategories", getSessionData("category"));
}
function activateCategoryFormC() {
    updatecategoryFormCoptionscategories();
    activateTHISForm("categoryaddbutton", "/courses/addcategory", null, null, ["categoryFormCoptionscategories", "categoryFormCoptionsmajors"], [["major", "category"], ["oldmajor"]], updatecategoryFormCoptionscategories);
}
//------------------------------
// subcategory create
function updatesubcategoryFormAoptionscategories() {
    addSelectionOptions("subcategoryFormAoptionscategories", getSessionData("category"));
}
function activateSubcategoryFormA() {
    updatesubcategoryFormAoptionscategories();
    activateTHISForm("subcategorycreatebutton", "/courses/createsubcategory", ["subcategoryFormAsubcategory", "subcategoryFormAnote"], ["subcategory", "note"], ["subcategoryFormAoptionscategories"], [["major", "category"]], updatesubcategoryFormAoptionscategories);
}
// subcategory delete
function updatesubcategoryFormBoptionssubcategories() {
    addSelectionOptions("subcategoryFormBoptionssubcategories", getSubSessionData("subcategory"));
}
function activateSubcategoryFormB() {
    updatesubcategoryFormBoptionssubcategories();
    activateTHISForm("subcategorydeletebutton", "/courses/deletesubcategory", null, null, ["subcategoryFormBoptionssubcategories"], [["major", "category", "subcategory"]], updatesubcategoryFormBoptionssubcategories);
}
// subcategory add
function updatesubcategoryFormCoptionssubcategories() {
    addSelectionOptions("subcategoryFormCoptionscategories", getSessionData("category"));
    addSelectionOptions("subcategoryFormCoptionssubcategories", getSubSessionData("subcategory"));
}
function activateSubcategoryFormC() {
    updatesubcategoryFormCoptionssubcategories();
    activateTHISForm("subcategoryaddbutton", "/courses/addsubcategory", null, null, ["subcategoryFormCoptionssubcategories", "subcategoryFormCoptionscategories"], [["major", "category", "subcategory"], ["oldmajor", "oldcategory"]], updatesubcategoryFormCoptionssubcategories);
}
//------------------------------
// requirement create
function updaterequirementFormAoptionssubcategories() {
    addSelectionOptions("requirementFormAoptionssubcategories", getSubSessionData("subcategory"));
}
function activateRequirementFormA() {
    updaterequirementFormAoptionssubcategories();
    activateTHISForm("requirementcreatebutton", "/courses/createrequirement", ["requirementFormArequirement", "requirementFormAcredit"], ["requirement", "credit"], ["requirementFormAoptionssubcategories"], [["major", "category", "subcategory"]], updaterequirementFormAoptionssubcategories);
}
// requirement delete
function updaterequirementFormBoptionsrequirements() {
    addSelectionOptions("requirementFormBoptionsrequirements", getSubSessionData("requirement"));
}
function activateRequirementFormB() {
    updaterequirementFormBoptionsrequirements();
    activateTHISForm("requirementdeletebutton", "/courses/deleterequirement", null, null, ["requirementFormBoptionsrequirements"], [["major", "category", "subcategory", "requirement"]], updaterequirementFormBoptionsrequirements);
}
// requirement add
function updaterequirementFormCoptionsrequirements() {
    addSelectionOptions("requirementFormCoptionssubcategories", getSubSessionData("subcategory"));
    addSelectionOptions("requirementFormCoptionsrequirements", getSubSessionData("requirement"));
}
function activateRequirementFormC() {
    updaterequirementFormCoptionsrequirements();
    activateTHISForm("requirementaddbutton", "/courses/addrequirement", null, null, ["requirementFormBoptionsrequirements", "requirementFormCoptionssubcategories"], [["major", "category", "subcategory", "requirement"], ["oldmajor", "oldcategory", "oldsubcategory"]], updaterequirementFormCoptionsrequirements);
}
//------------------------------
// course create
function updatecourseFormAoptionsrequirements() {
    addSelectionOptions("courseFormAoptionsrequirements", getSubSessionData("requirement"));
}
function activateCourseFormA() {
    updatecourseFormAoptionsrequirements();
    activateTHISForm("coursecreatebutton", "/courses/createcourse", ["courseFormAcourse", "courseFormAcredit"], ["course", "credit"], ["courseFormAoptionsrequirements"], [["major", "category", "subcategory", "requirement"]], updatecourseFormAoptionsrequirements);
}
// course delete
function updatecourseFormBoptionscourses() {
    addSelectionOptions("courseFormBoptionscourses", getSubSessionData("course"));
}
function activateCourseFormB() {
    updatecourseFormBoptionscourses();
    activateTHISForm("coursedeletebutton", "/courses/deletecourse", null, null, ["courseFormBoptionscourses"], [["major", "category", "subcategory", "requirement", "course"]], updatecourseFormBoptionscourses);
}
// course add
function updatecourseFormCoptionscourses() {
    addSelectionOptions("courseFormCoptionscourses", getSubSessionData("course"));
    addSelectionOptions("courseFormCoptionsrequirements", getSubSessionData("requirement"));
}
function activateCourseFormC() {
    updatecourseFormCoptionscourses();
    activateTHISForm("courseaddbutton", "/courses/addcourse", null, null, ["courseFormCoptionscourses", "courseFormCoptionsrequirements"], [["major", "category", "subcategory", "requirement", "course"], ["oldmajor", "oldcategory", "oldsubcategory", "oldrequirement"]], updatecourseFormCoptionscourses);
}
//------------------------------
// prereq add and delete
function updateprereqForms() {
    addSelectionOptions("prereqFormAoptionscourses", getSubSessionData("course"));
    addSelectionOptions("prereqFormAoptionsprereqs", getSubSessionData("course"));
}
function activatePrereqForms() {
    updateprereqForms();
    activateTHISForm("prereqaddbutton", "/courses/addprereq", null, null, ["prereqFormAoptionscourses", "prereqFormAoptionsprereqs"], [["major", "category", "subcategory", "requirement", "course"],
        ["pmajor", "pcategory", "psubcategory", "prequirement", "pcourse"]], updateprereqForms);
    activateTHISForm("prereqdeletebutton", "/courses/deleteprereq", null, null, ["prereqFormAoptionscourses", "prereqFormAoptionsprereqs"], [["major", "category", "subcategory", "requirement", "course"],
        ["pmajor", "pcategory", "psubcategory", "prequirement", "pcourse"]], updateprereqForms);
}
//------------------------------
// ap create
function updateapFormAoptionscourses() {
    addSelectionOptions("apFormAoptionscourses", getSubSessionData("course"));
}
function activateAPFormA() {
    updateapFormAoptionscourses();
    activateTHISForm("apcreatebutton", "/courses/createap", ["apFormAtest", "apFormAmin", "apFormAmax"], ["test", "scoremin", "scoremax"], ["apFormAoptionscourses"], [["major", "category", "subcategory", "requirement", "course"]], updateapFormAoptionscourses);
}
function updateapFormBoptions() {
    addSelectionOptions("apFormBoptionscourses", getSubSessionData("course"));
    addSelectionOptions("apFormBoptionstests", getSessionData("ap"));
}
function activateAPFormB() {
    updateapFormBoptions();
    activateTHISForm("apaddbutton", "/courses/addap", null, null, ["apFormBoptionstests", "apFormBoptionscourses"], [["major", "category", "subcategory", "requirement", "course", "skip", "test", "scoremin", "scoremax"],
        ["oldmajor", "oldcategory", "oldsubcategory", "oldrequirement", "oldcourse"]], updateapFormBoptions);
    activateTHISForm("apdeletebutton", "/courses/deleteap", null, null, ["apFormBoptionstests", "apFormBoptionscourses"], [["major", "category", "subcategory", "requirement", "course", "skip", "test", "scoremin", "scoremax"],
        ["oldmajor", "oldcategory", "oldsubcategory", "oldrequirement", "oldcourse"]], updateapFormBoptions);
}
/// <reference path='toggle.ts'/>
/// <reference path='coursesDataTree.ts' />
/// <reference path="coursesForms.ts" />
let forms = ['majorforms', 'categoryforms', 'subcategoryforms',
    'requirementforms', 'courseforms', 'prereqforms', 'apforms'];
//some button functions for toggling
function activateCourseButtons() {
    let refresh = document.getElementById('refreshcoursesdata');
    // refresh button is shown only when user is signed in
    if (refresh != null) {
        refresh.onclick = () => {
            updateCoursesData();
        };
        document.getElementById('majoroperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('majorforms');
            activateMajorFormA();
            activateMajorFormB();
        };
        document.getElementById('categoryoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('categoryforms');
            activateCategoryFormA();
            activateCategoryFormB();
        };
        document.getElementById('subcategoryoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('subcategoryforms');
            activateSubcategoryFormA();
            activateSubcategoryFormB();
        };
        document.getElementById('requirementoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('requirementforms');
            activateRequirementFormA();
            activateRequirementFormB();
        };
        document.getElementById('courseoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('courseforms');
            activateCourseFormA();
            activateCourseFormB();
        };
        document.getElementById('prereqoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('prereqforms');
            activatePrereqForms();
        };
        document.getElementById('apoperation').onclick = () => {
            for (const item of forms) {
                dontShowIt(item);
            }
            showIt('apforms');
            activateAPFormA();
            activateAPFormB();
        };
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
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("majorFormA");
            activateMajorFormA();
        };
        document.getElementById('deletemajoroperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("majorFormB");
            activateMajorFormB();
        };
    }
    if (document.getElementById('categoryforms') != null) {
        document.getElementById('createcategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("categoryFormA");
            activateCategoryFormA();
        };
        document.getElementById('addcategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("categoryFormC");
            activateCategoryFormC();
        };
        document.getElementById('deletecategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("categoryFormB");
            activateCategoryFormB();
        };
    }
    if (document.getElementById('subcategoryforms') != null) {
        document.getElementById('createsubcategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("subcategoryFormA");
            activateSubcategoryFormA();
        };
        document.getElementById('addsubcategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("subcategoryFormC");
            activateSubcategoryFormC();
        };
        document.getElementById('deletesubcategoryoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("subcategoryFormB");
            activateSubcategoryFormB();
        };
    }
    if (document.getElementById('requirementforms') != null) {
        document.getElementById('createrequirementoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("requirementFormA");
            activateRequirementFormA();
        };
        document.getElementById('addrequirementoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("requirementFormC");
            activateRequirementFormC();
        };
        document.getElementById('deleterequirementoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("requirementFormB");
            activateRequirementFormB();
        };
    }
    if (document.getElementById('courseforms') != null) {
        document.getElementById('createcourseoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("courseFormA");
            activateCourseFormA();
        };
        document.getElementById('addcourseoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("courseFormC");
            activateCourseFormC();
        };
        document.getElementById('deletecourseoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("courseFormB");
            activateCourseFormB();
        };
    }
    if (document.getElementById('prereqforms') != null) {
        document.getElementById('addprereqoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("prereqFormA");
            showIt("prereqaddbutton");
            dontShowIt("prereqdeletebutton");
            activatePrereqForms();
        };
        document.getElementById('deleteprereqoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("prereqFormA");
            showIt("prereqdeletebutton");
            dontShowIt("prereqaddbutton");
            activatePrereqForms();
        };
    }
    if (document.getElementById('apforms') != null) {
        document.getElementById('createapoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("apFormA");
            activateAPFormA();
        };
        document.getElementById('addapoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("apFormB");
            showIt("apaddbutton");
            dontShowIt("apdeletebutton");
            activateAPFormB();
        };
        document.getElementById('deleteapoperation').onclick = () => {
            for (const operation of operations) {
                dontShowIt(operation);
            }
            showIt("apFormB");
            showIt("apdeletebutton");
            dontShowIt("apaddbutton");
            activateAPFormB();
        };
    }
}
/// <reference path='toggle.ts'/>
/// <reference path='coursesDataTree.ts' />
/// <reference path='helperData.ts' />
/// <reference path='coursesButtons.ts' />
/// <reference path='helperButtons.ts' />
/// <reference path='betterDark.ts' />
document.addEventListener("DOMContentLoaded", () => {
    // nav buttons
    document.getElementById('creditsneeded').onclick = () => {
        showIt('section-b');
        dontShowIt('section-a');
        dontShowIt('section-c');
    };
    document.getElementById('creditswanted').onclick = () => {
        showIt('section-c');
        dontShowIt('section-a');
        dontShowIt('section-b');
    };
    let signin = document.getElementById('signin');
    if (signin != null) {
        signin.onclick = () => { showIt('signinform'); };
    }
    let signup = document.getElementById('signup');
    if (signup != null) {
        signup.onclick = () => { showIt('signupform'); };
    }
    let signout = document.getElementById('signout');
    if (signout != null) {
        signout.onclick = () => { window.location.href = '/signOut'; };
    }
    document.getElementById('cancelsignin').onclick = () => {
        dontShowIt('signinform');
    };
    document.getElementById('cancelsignup').onclick = () => {
        dontShowIt('signupform');
    };
    // course buttons
    activateCourseButtons();
    // helper buttons
    activateHelperButtons();
    activateHelperForms();
    document.getElementById("darkmode").onclick = () => {
        darkmode();
    };
});
