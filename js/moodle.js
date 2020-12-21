function checkHW() {
    console.log("JCT Tools->" + " Cheking homework status");

    var urlParam = location.search.replace('?', '').replace('&', '=').split('=');
    var urlCourseId = null;
    for (var i = 0; i < urlParam.length; i++) {
        if (urlParam[i] == "id") {
            urlCourseId = urlParam[i + 1];
            console.log("JCT Tools->" + " Homework id = " + urlCourseId);
            break;
        }
    }
    if (urlCourseId == null)
        return;

    if ($(".submissionstatussubmitted").length > 0 || $(".latesubmission").length > 0 || $(".earlysubmission").length > 0) {
        //setObjectInObject:function(objName,hash1, hash2, value = null,callBackFunction = null)
        DataAccess.setObjectInObject("eventDone", urlCourseId, "checked", true);
        console.log("JCT Tools->" + " Homework is done");

    }

}

function moodle(password, data) {
    if (location.pathname.includes("assign")) {
        checkHW();
        return;
    }

    if (location.pathname.includes("course/view.php")) {
        if (data.Config != null && data.Config["testInCoursePage"] != false)
            addTestDate(data);
        return;
    }
    if(location.pathname == "/" && !$("#frontpage-course-list").length)
        window.location.replace("https://moodle.jct.ac.il/login/index.php")
    
    if (($("#username").length != 0 && $("#password").length != 0) && data.anonymous != true) {
        if (data["mo"] && data.enable) {
            $("#username").val(data.username);
            $("#password").val(password);
            $("#loginbtn").click();
        }
    }
    else {
        console.log("JCT Tools->" + "Moodle hide user events: " + data.Config["MoodleHiddeUE"]);


        if (undefined == data)
            data = {};

        if (data.Config == undefined)
            data.Config = {};

        hideCourses(data.moodleCoursesTable, data.moodleCoursesTable2,  data.Config.hiddeModdelHelp);

        if (!data["mo"] || !data.enable)
            return;


        var courseId;
        $(".event").each(function () {

            if ($(this).find("img").attr("alt") == "אירוע משתמש") {
                if (data.Config["MoodleHiddeUE"])
                    $(this).remove();
            } else {

                /********** Delete homeworks done***************
                 homeworkId = ($(this).find("a"))[0];
                 homeworkId = $(homeworkId).attr('href');
                 homeworkId = homeworkId.substring(homeworkId.lastIndexOf("id")+3);
                 if(data.eventDone[homeworkId] != null && data.eventDone[homeworkId].checked)
                 $(this).remove();
                 ************************************************/

                if (data.Config.hiddeNoSelectedCourseInMoodle) {
                    /**************************************
                     * Search the homework course id
                     ***************************************/
                    //data.Config.hiddeNoSelectedCourseInWindows == true &&
                    courseId = $(this).find('.course').find('a');
                    if (courseId == undefined || courseId.length == 0)
                        return undefined;
                    courseId = $(courseId).attr('href');
                    // Get id from href (ex: https://moodle.jct.ac.il/course/view.php?id=28513)
                    courseId = courseId.substring(courseId.lastIndexOf("id") + 3);
                    if (data.moodleCoursesTable[courseId] != true) {
                        console.log("JCT Tools->Homework with course id: " + courseId + " deleted");
                        $(this).next("hr").remove();
                        $(this).remove();
                    }
                }

            }

        });

        if (data.Config["moodleTopic"])
            $(".sitetopic").remove();

        if (data.Config["eventsOnTop"] && data["mo"] && data.enable) {
            $("#inst121811").find(".block_action").remove();
            var eventsDiv = $("#inst121811");
            $("#inst121811").remove();
            $("#block-region-side-post").prepend(eventsDiv);
        }


        if (data.testsDate != undefined && data.Config.showTestDay != false) {

            //var to save all courses in "mycourses"
            var mycourses = Object.keys(data.moodleCoursesTable) +  Object.keys(data.moodleCoursesTable2);
            //var to save the current course
            var courseTest;
            //save the course test in html format
            var courseHtml;
            // Save the place where the extension will save insert the data
            var li;

            for (var i = 0; i < mycourses.length; i++) {

                courseTest = data.courses[mycourses[i]];

                if (courseTest == undefined || courseTest.id == undefined)
                    continue;

                console.log("JCT Tools-> Course id: " + courseTest.id);

                courseTest = data.testsDate[courseTest.id.split('.')[0]];
                if (courseTest == undefined)
                    continue;


                courseHtml = getCourseSpan(courseTest);
                if (courseHtml == null)
                    continue;

                li = $("[data-courseid=" + mycourses[i] + "]").find(".moreinfo");
                $(li).append(courseHtml);
                $(li).css({"text-align": "center", "color": "#0070a8", "font-weight": "bold", "margin-left": "15px"});
            }

        }

    }
}

function getCourseSpan(courseTest) {

    var testDateHtml = "";

    if (courseTest["moed1day"] == undefined || courseTest["moed1time"] == undefined) {
        return null;
    }


    var moed = stringDateToDateObject(courseTest["moed1day"], courseTest["moed1time"]);
    if (courseTest["registerToMoed3"] != true && Date.parse(moed) > Date.now()) {
        testDateHtml = "מועד א";
        testDateHtml += "<br/>";
        testDateHtml += courseTest["moed1day"] + " - " + courseTest["moed1time"];
    }
    else {

        if (courseTest["moed2day"] == undefined || courseTest["moed2time"] == undefined) {
            return null;
        }


        if (courseTest["registerToMoed3"] != true && courseTest["registerToMoedBet"] == true) {
            moed = stringDateToDateObject(courseTest["moed2day"], courseTest["moed2time"]);
            console.log("JCT Tools-> Moed 2: " + moed);
            if (Date.parse(moed) > Date.now()) {
                testDateHtml = "מועד ב";
                testDateHtml += "<br/>";
                testDateHtml += courseTest["moed2day"] + " - " + courseTest["moed2time"];
            }

        }
        else if (courseTest["registerToMoed3"] == true) {
            moed = stringDateToDateObject(courseTest["moed3day"], courseTest["moed3time"]);
            console.log("JCT Tools-> Moed 3: " + courseTest["moed3day"]);

            if (Date.parse(moed) > Date.now()) {
                testDateHtml = "מועד ג";
                testDateHtml += "<br/>";
                testDateHtml += courseTest["moed3day"] + " - " + courseTest["moed3time"];
            }
        } else
            return null;
    }
    return testDateHtml;

}


function addTestDate(data) {

    console.log("JCT Tools->" + " Checking for tests");

    if (data == null)
        return;

    var urlParam = location.search.replace('?', '').replace('&', '=').split('=');
    var urlCourseId = null;
    for (var i = 0; i < urlParam.length; i++) {
        if (urlParam[i] == "id") {
            urlCourseId = urlParam[i + 1];
            console.log("JCT Tools->" + " Homework id = " + urlCourseId);
            break;
        }
    }

    var courseTest = data.courses[urlCourseId];
    if (courseTest == null) {
        console.log("JCT Tools->" + " The course isn't in the database" + urlCourseId);
        return;

    }

    var courseHtml = getCourseSpan(data.testsDate[courseTest.id.split('.')[0]]);

    if (courseHtml == null)
        return;

    var div = '<span style=" background-color: lightgoldenrodyellow;' +
        ' display: block; text-align: center; color: rgb(0, 112, 168);  font-weight: bold; ">' +
        courseHtml +
        '</span>'
    $("#user-notifications").append(div);
}


