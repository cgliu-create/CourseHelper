import requests
from django.contrib.sites.shortcuts import get_current_site

# --- get operations ---
# given the name of a major
# return related major data


# --- helper functions ---
def getCoursesAPI(request, data_model):
    data_sets = {
        'major': 'majors',
        'category': 'categories',
        'subcategory': 'subcategories',
        'requirement': 'requirements',
        'course': 'courses',
        'prereq': 'prereqs',
        'test': 'apcredits',
    }
    current_site = get_current_site(request)
    data_set = data_sets[data_model]
    api_domain = f'http://{current_site.domain}/courses/{data_set}/'
    return api_domain


def getInstancePK(request, data_model, name):
    api_request = getCoursesAPI(request, data_model) 
    result = requests.get(api_request)
    for instance in result.json():
        instance_name = instance[data_model]
        if instance_name == name:
            return instance.get('pk')
    return -1


def getSubDataList(request, data_model, parent_model, parrent_name):
    sub_data_names = []
    api_requuest = getCoursesAPI(request, data_model)
    relation = None
    if parent_model is not None:
        parent_pk = getInstancePK(request, parent_model, parrent_name)
        relation = getCoursesAPI(request, parent_model) + parent_pk
    result = requests.get(api_requuest)
    if result.status_code != 200:
        raise Exception('ERROR: API request unsuccessful.') 
    for instance in result.json():
        if relation is not None:
            if instance[parent_model] == relation:
                instance_name = instance[data_model]
                sub_data_names.append(instance_name)
        if relation is None:
            instance_name = instance[data_model]
            sub_data_names.append(instance_name)
    return sub_data_names


def checkValidData(request, data_model, data_name):
    data_pk = getInstancePK(request, data_model, data_name)
    api_request = getCoursesAPI(request, data_model) + data_pk
    result = requests.get(api_request)
    if result.status_code != 200:
        raise Exception('ERROR: API request unsuccessful.')
    validity = True
    try: validity = result.json()['detail'] == 'Not found.'
    except KeyError: pass
    return validity


# --- get data list fuctions ---
def getMajorList(request):
    return getSubDataList(request, 'major', None, None)


def getCategoryList(request, major_name):
    return getSubCategoryList(request, 'category', 'major', major_name)


def getSubCategoryList(request, category_name):
    return getSubCategoryList(request, 'subcategory', 'category', category_name)

def getRequirementList(request, subcategory_name):
    return getSubCategoryList(request, 'requirement', 'subcategory', subcategory_name)


def getCourseList(request, requirement_name):
    return getSubCategoryList(request, 'course', 'requirement', requirement_name)


def getPrereqList(request, course_name):
    return getSubCategoryList(request, 'prereq', 'course', course_name)


def getAPList(request, course_name):
    return getSubCategoryList(request, 'test', 'course', course_name)
    