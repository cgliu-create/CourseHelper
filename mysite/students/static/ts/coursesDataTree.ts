///<reference path='ajax.ts'/>
///<reference path='dataTree.ts'/>
///<reference path='sessionDataStuff.ts'/>
///<reference path="readXML.ts" />

// courses tree data

// --- courses data helper functions ---
function readMajors(majors:HTMLCollection) {
  return readMainTags(
    majors,
    ["major_name"],
    ["categories"],
  );
}
function readCategories(categories:NodeList) {
  return readSubNodeList(
    categories,
    ["category_name"],
    ["subcategories"],
  );
}
function readSubcategories(subcategories:NodeList) {
  return readSubNodeList(
    subcategories,
    ["subcategory_name", "subcategory_data"],
    ["requirements"],
  );
}
function readRequirements(requirements:NodeList) {
  return readSubNodeList(
    requirements,
    ["requirement_name", "requirement_data"],
    ["courses"],
  );
}
function readCourses(courses:NodeList) {
  return readSubNodeList(
    courses,
    ["course_name", "course_data"],
    ["prereqs", "ap"]
  );
}
function readPrereqs(prereqs:NodeList) {
  return readSubNodeList(
    prereqs,
    ["prereq_name"],
    null
  );
}
function readAp(ap:NodeList) {
  return readSubNodeList(
    ap,
    ["test_name"],
    null
  );
}
function addCoursesData(workspace_id:string, response:Document){
  // -- data tree --
  // ex major:major_name
  // -- session catalog ---
  let session_majors:string[] = []; //ex  major
  let session_categories:string[] = []; //ex major/category
  let session_subcategories:string[][]= []; //ex major/category/subcategory //ex subcategory/note
  let session_requirements:any[] = []; //ex major/category/subcategory/requirement //ex requirement/credit
  let session_courses:any[] = []; //ex major/category/subcategory/requirement/course //ex course/credit
  let session_prereqs:string[] = []; //ex  major/category/subcategory/requirement/course/prereq/course
  let session_ap:string[] = []; //ex  major/category/subcategory/requirement/course/test/testname
  // ---
  let majors = response.getElementsByTagName('major');
  let major_data = readMajors(majors);
  for (const major of major_data) {
    // data tree
    addCaretList(workspace_id, `MAJOR:${major.major_name}`, false, null)
    // session
    session_majors.push(major.major_name)
    if (major.categories != null) {
      let categories = major.categories.childNodes;
      let category_data = readCategories(categories);
      for (const category of category_data) {
        // data tree
        addCaretList(`MAJOR:${major.major_name}`, 
                     `${major.major_name}CATEGORY:${category.category_name}`, false, null);
        // session
        session_categories.push(`${major.major_name}/${category.category_name}`);
        if (category.subcategories != null) {
          let subcategories = category.subcategories.childNodes;
          let subcategory_data = readSubcategories(subcategories);
          for (const subcategory of subcategory_data) {
            // data tree
            addCaretList(`${major.major_name}CATEGORY:${category.category_name}`, 
                         `${major.major_name}${category.category_name}SUBCATEGORY:${subcategory.subcategory_name}`, false, null);
            // session
            let session_subcategories_data:string[] = [];
            session_subcategories_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}`);
            session_subcategories_data.push(`${subcategory.subcategory_data}`);
            session_subcategories.push(session_subcategories_data);
            if (subcategory.requirements != null) {
              let requirements = subcategory.requirements.childNodes;
              let requirement_data = readRequirements(requirements);
              for (const requirement of requirement_data) {
                // data tree
                addCaretList(`${major.major_name}${category.category_name}SUBCATEGORY:${subcategory.subcategory_name}`,
                             `${major.major_name}${category.category_name}${subcategory.subcategory_name}REQUIREMENT:${requirement.requirement_name}`, false, null);
                // session
                let session_requirements_data:string[] = [];
                session_requirements_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}`);
                session_requirements_data.push(`${requirement.requirement_data}`);
                session_requirements.push(session_requirements_data);
                if (requirement.courses != null) {
                  let courses = requirement.courses.childNodes;
                  let course_data = readCourses(courses);
                  for (const course of course_data) {
                    // data tree
                    addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}REQUIREMENT:${requirement.requirement_name}`,
                                 `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`, false, null);
                    // session
                    let session_courses_data:string[] = [];
                    session_courses_data.push(`${major.major_name}/${category.category_name}/${subcategory.subcategory_name}/${requirement.requirement_name}/${course.course_name}`);
                    session_courses_data.push(`${course.course_data}`);
                    session_courses.push(session_courses_data);
                    if (course.prereqs != null) {
                      // data tree
                      addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`,
                                   `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}PREREQ:${course.course_name}`, false, null);
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
                      addCaretList(`${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}COURSE:${course.course_name}`, 
                                   `${major.major_name}${category.category_name}${subcategory.subcategory_name}${requirement.requirement_name}AP:${course.course_name}`, false, null);
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

  addSessionCourses(
    session_majors,
    session_categories,
    session_subcategories,
    session_requirements,
    session_courses,
    session_prereqs,
    session_ap
    );
}         

function cleanUpDataTree(){
  let tags = ["major", "category", "subcategory", "requirement", "course"]
  for (const tag of tags) {
    let data:string[] = [];
    if(tag=="subcategory"||tag=="requirement"||tag=="course"){ data = getSubSessionData(tag);
    } else { data = getSessionData(tag);}
    if(data == null){return}
    for (const instance of data) {
      let separated_sections = readMySessionString(instance);
      let tree_name = "";
      let important = "";
      for (let index = 0; index < separated_sections.length; index++) {
        let section =  separated_sections[index];
          tree_name = tree_name;
        if (index == separated_sections.length-1){
          if (tag=="course"){
            let prereq = `symbol-${tree_name}PREREQ:${section}`; 
            let ap = `symbol-${tree_name}AP:${section}`;  
            document.getElementById(prereq).innerHTML = `PREREQ:${section}`;
            document.getElementById(ap).innerHTML = `AP:${section}`;
          }
          tree_name = `${tree_name}${tag.toUpperCase()}:${section}`;
          important = `${tag.toUpperCase()}:${section}`;
        } else { tree_name = `${tree_name}${section}`;}
      }
      let id = `symbol-${tree_name}`
      document.getElementById(id).innerHTML = important;
    }
  }
}

// resulting ajax function
function updateCoursesData(){
  let workspace_id = 'coursesdata';
  clearData(workspace_id);
  let url_source = '/requestcoursesdata';
  requestAJAX(url_source, workspace_id, addCoursesData);
}
