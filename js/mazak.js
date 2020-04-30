function mazakConnect(data) {

    //Courses time as list page
    if (location.pathname.includes("/Student/ScheduleList.aspx")) {


        //In case that the user want to, remove the class 'right' from the table in order to fix the table
        if (data.Config.coursesOrder != undefined && data.Config.coursesOrder != false)
            $("td").removeClass('right');

        if(data.Config.coursesAddToCalendar == undefined || data.Config.coursesAddToCalendar)
            scheduleListPage();

        return;
    }

    //Grades page
    if (location.pathname.includes("Student/Grades.aspx")) {

        if (data.Config == null)
            data.Config = {};
        gradesButton(data);
        customGrades();
        return;
    }

    if (!location.pathname.includes("Login.aspx") && (data.anonymous == true)) {
        chrome.runtime.sendMessage({levnetLoginAndUpdate: true});
        return;
    }

    //Fix bug in mazak (09.07.2017)
    //The error show the menubar but its not redirect the student to the main page.
    if (location.pathname.includes("Login.aspx") && $("ul[role=menubar]").length > 0) {// Check if the menubar, exist in the login page
        window.location.href = '/Student/Default.aspx';
        return;
    }
    //LOGIN PAGE
    if (data.anonymous == true)
        return;

    //Check if the user active the auto login
    if (data["mz"] != true || data.enable != true)
        return;

    //check if the username input exist (in order to prevent a bug)
    if ($("#username").length == 0) {
        if (location.pathname.includes("Login")) {
            console.log("JCT Tools-> User name field not found")

        }
        return;
    }

    //check if the password input exist (in order to prevent a bug)
    if ($("#password").length == 0) {
        if (location.pathname.includes("Login")) {
            console.log("JCT Tools-> password field not found");

        }
        return;
    }

    //This function is a little hack to replace the chrome autofill.
    $(":input").each(function () {
        if (this.name == "username")
            this.value = username;
        if (this.name == "password")
            this.value = window.atob(data["password"]);
    });

    $("#username").val(username);
    $("#password").val(window.atob(data["password"]));

    console.log("JCT Tools-> Starting levnet autologin ");
    //This 2 lines is not requiered, but they are in order to prevent a bug
    $("#username").attr("value", username);
    $("#password").attr("value", window.atob(data["password"]));

    //Submit the form - Angular functions
    location.href = "javascript:console.log('JCT Tools-> trying mazak login');"
        + "var $scope = angular.element('#username').scope();"
        + "$scope.model = {username:'" + username + "', password: '" + window.atob(data["password"]) + "'};"
        + "$scope.canLogin = function(){return true};"
        + "$scope.$apply();"
        + "$scope.tryLogin();";

    // $("#mainForm").submit();
}


/**
 * This function will manager the grades page.
 */
function gradesButton(data) {
    console.log("JCT Tools-> gradesButton()");

    $("header").append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">');
    // $("td").removeClass('right');
    // $("th").css( "text-align", "center" );

    //First we check if the user wants this option then
    if (data.Config.customGrades != undefined && data.Config.customGrades != false) {

        if (data.Config.gradesOptions == undefined)
            data.Config.gradesOptions = {};


        // return;
        //Backup the line
        var dvGrades = $($("div[data-lev-course-legend]")[0]);
        //Check if the document is loaded
        if ($(dvGrades).find("label").length == 0)
            return setTimeout(function () {
                gradesButton(data)
            }, 300);

        //New content
        //Additional options
        $($(dvGrades).find('.text-warning')[0]).after('&nbsp;|<label><input id="couseWithoutPoints" type="checkbox" ' + ((data.Config.gradesOptions["couseWithoutPoints"] == true) ? "checked" : "") + '>&nbsp;קורס ללא נקודות זכות</label>&nbsp;|' +
            '<label><input id="couseWithoutGrade" type="checkbox" ' + ((data.Config.gradesOptions["couseWithoutGrade"] == true) ? "checked" : "") + '>&nbsp;קורס ללא ציון</label>');
        //After insert additional options, the program insert the checkbox
        var examples = $(dvGrades).find("label");
        $(examples[0]).prepend('<input id="courseNotPassed" type="checkbox" ' + ((data.Config.gradesOptions["courseNotPassed"] != false ) ? "checked" : "" ) + '>&nbsp;');
        $(examples[1]).prepend('<input id="courseDroppedOutPurple" type="checkbox" ' + ((data.Config.gradesOptions["courseDroppedOutPurple"] == true) ? "checked" : "") + '>&nbsp;');
        $(examples[2]).prepend('<input id="courseNotConfirmed" type="checkbox" ' + ((data.Config.gradesOptions["courseNotConfirmed"] != false) ? "checked" : "") + '>&nbsp;');
        //Set the checkbox on click to run the function customGrades
        $(examples).find("input[type=checkbox]").on("click", customGrades);
        setTimeout(function () {
            setGradeTableDBClick(data)
        }, 1500);
        //Set double cell double click event
        $(".ui-paging").find("li").click(function () {
            console.log("Table updated");
            setTimeout(function () {
                DataAccess.Data(setGradeTableDBClick);
            }, 1500);
        });
        //On page change, reset table preferences
        $("nav[data-on-page-change=pageChange]").click(function () {
            setTimeout(function () {
                customGrades();
                DataAccess.Data(setGradeTableDBClick);
            }, 1500);
        });
        //Add option to show all grades
        $($(".table-responsive").find(".ng-binding")[0]).prepend("<button id='showAllGrades' class='btn btn-default'>הראה כל הציונים</button>&nbsp;");
        $("#showAllGrades").click(function (e) {
            e.preventDefault();
            location.href = "javascript:var $scope = angular.element('.table-responsive').scope();"
                + "$scope.$$childTail.pageChange({pageSize:9999,current:1});"
            $(this).remove();
            setTimeout(function () {
                customGrades();
                setGradeTableDBClick(data);
            }, 1000);

        });
        //Run the function customGrades in order to refresh the table
        customGrades();
    }


    //In case the user wants to
    if (data.Config.showGrades != undefined && data.Config.showGrades != false) {

        //Create the last table line with the average
        var customTotal = '<tr id="customTotal" style="background-color:#004184;color:#fff;font-weight: bolder;">' +
            '<th></th>' +
            '<th> סה"כ קורסים:  </th> ' +
            '<th id="TCourses">0</td>' +
            '<th colspan="2">סכ"ה נ"ז:</th> ' +
            '<th id="TNZ">0</th> ' +
            '<th>ממוצע:</th> ' +
            '<th id="TG">-</th> ' +
            '<th colspan="2"></th>' +
            '</tr>';

        //append to the tabla
        $(".table-responsive").find("table").append(customTotal);

        //Run the function customGrades in order to set the average
        customGrades();

    }


}

function setGradeTableDBClick(data) {
    if (data.Config != null && data.Config.customAverage == true) {
        //Append instructions
        if ($("#changeGradeWarning").length == 0) {
            $($("div[data-lev-course-legend]")[0]).prepend("<div id='changeGradeWarning' class='filterBox' style='overflow:hidden;margin: 10px 0'><div  style='float:right;margin: 0;padding: 0;margin-left: 5px;'><span class='glyphicon glyphicon-info-sign'></span></div><div style='margin: 0;padding:0;'>ניתן לשנות את הציונים בתצוגה ( <b>בלבד  </b> ) לצורך חישוב הממוצע באמצעות לחיצה כפולה על הציון המבוקש</div></div>")
        }
        //This function will set the option of double click in a grade
        $(".table-responsive").find("tr").each(function () {
            $(this).dblclick(function () {

                var that = this;

                var td = $(this).find("td");

                var grade = $(td)[6];

                var min = $($(td)[5]).text().trim();

                if (isNaN(min)) min = 0;

                var gradeInput = $(grade).find(":input");

                if ($(gradeInput).length > 0) {
                    //Writing new grade
                    var value = $(gradeInput).val().trim();
                    $(grade).empty();
                    $(grade).append(value);
                    customGrades();


                    if (isNaN(value) || parseInt(value) >= parseInt(min)) {
                        if ($(this).hasClass("not-passed"))
                            $(this).removeClass("not-passed");
                    } else {
                        if (!$(this).hasClass("not-passed"))
                            $(this).addClass("not-passed");
                    }


                } else {
                    var tText = $(grade).text().trim();
                    if (isNaN(tText))
                        tText = "";
                    var inputGrade = "<input type='text' value='" + tText + "' style='width: 50px;text-align: center;font-size: 15px;height: 22px;'>";
                    $(grade).empty();
                    $(grade).append(inputGrade);
                    inputGrade = $(grade).find(":input");


                    $(inputGrade).keypress(function (e) {
                        if (e.which == 13) {
                            var gradeInput = $(grade).find(":input");
                            var value = $(gradeInput).val().trim();
                            $(grade).empty();
                            $(grade).append(value);

                            customGrades();

                            //Set new class
                            if (isNaN(value) || parseInt(value) >= parseInt(min)) {
                                if ($(that).hasClass("notPassed"))
                                    $(that).removeClass("notPassed ");
                            } else {
                                if (!isNaN(value))
                                    if (!$(that).hasClass("notPassed"))
                                        $(that).addClass("notPassed");
                            }
                        }
                    });


                }


            });
        });
    } else
        console.log("JCT Tools-> Double click option is off ");


}

/**
 * This function will:
 *    + Check with checkbox (from the first line) is checked and the reload the table
 *    + Calculate the average and the update the last line
 */
function customGrades() {


    var i = 0;
    var gradeTd = 0;
    var NZ = 0;
    var grade = 0;

    var sumNZ = 0;
    var sumGrade = 0;
    console.log("JCT Tools-> customGrades function called ");
    var customGradeDiv = $($("div[data-lev-course-legend]")[0]).find("label");


    var gradesOptions = {};
    gradesOptions["courseNotPassed"] = $(customGradeDiv).find("#courseNotPassed").is(":checked");
    gradesOptions["courseDroppedOutPurple"] = $(customGradeDiv).find("#courseDroppedOutPurple").is(":checked");
    gradesOptions["courseNotConfirmed"] = $(customGradeDiv).find("#courseNotConfirmed").is(":checked");
    gradesOptions["couseLineThrough"] = $(customGradeDiv).find("#couseLineThrough").is(":checked");
    gradesOptions["couseWithoutPoints"] = $(customGradeDiv).find("#couseWithoutPoints").is(":checked");
    gradesOptions["couseWithoutGrade"] = $(customGradeDiv).find("#couseWithoutGrade").is(":checked");
    DataAccess.setObject("Config", "gradesOptions", gradesOptions);

    //For every td in the grade table
    $(".table-responsive").find("table").find("tbody").find("tr").each(function () {


        //Check if this is not the last line (with the average)
        if ($(this).attr("id") == "customTotal")
            return;

        //Reset line background color
        /*  if ($(this).hasClass("alternateOdd"))
         $(this).removeClass("alternateOdd");

         if ($(this).hasClass("alternateEven"))
         $(this).removeClass("alternateEven");*/


        //Get all columns of this line
        gradeTd = $(this).find("td");

        //In order to prevent a bug
        if (gradeTd.length == 0) {
            return;
        }
        //Find the column where contains course gradde
        grade = $(gradeTd[6]).text().trim();

        //Find the column where contains course total points
        NZ = $(gradeTd[4]).text().trim();


        //This if will check with check box (on first line) is selected and then show/hide the line
        if (
            //For courses that the user didn't pass
        ($(this).hasClass("not-passed") && !gradesOptions["courseNotPassed"]) ||
        //For courses that are exclude
        ($(this).hasClass("dropped-out") && !gradesOptions["courseDroppedOutPurple"]) ||
        //For courses that is not confirmed
        ($(this).hasClass("not-confirmed") && !gradesOptions["courseNotConfirmed"]) ||
        //For courses that are not in the system
        ($(gradeTd[6]).hasClass("lineThrough") && !gradesOptions["couseLineThrough"]) ||
        // Check  if the total points are 0
        (NZ == 0 && !gradesOptions["couseWithoutPoints"]) ||
        //
        (isNaN(parseFloat(grade)) && !gradesOptions["couseWithoutGrade"] && (grade == "חסר" || grade == "עבר" || grade == "לא השלים"))
        ) {
            $(this).hide();

            return; //To stop and not calculate the average and i

        } else
            $(this).show();


        //Check if the grade is a number (in order to calculate the average
        if (!isNaN(parseFloat(grade)) && !isNaN(parseFloat(NZ))) {
            sumNZ += parseFloat(NZ);
            sumGrade += NZ * grade;
        }

        //With the  object 'i' it possible to check if this line is in even position and insert his class
        // (i % 2 != 0) ? $(this).addClass("alternateOdd") : $(this).addClass("alternateEven");

        i++;
    });

    //Get the average
    var average = (sumGrade / sumNZ).toFixed(3);
    //In case the table is not loaded
    if (isNaN(average)) {
        //To prevent a bug
        if (startCounter++ > 10)
            return;

        setTimeout(customGrades, 1000);
        return;
    }
    //Set total courses (by total of active lines)
    $("#TCourses").text((i - 1));
    //Set total of points
    $("#TNZ").text(sumNZ);
    //Set average
    $("#TG").text(average);


}

//Not in used
function customGradesTable() {
    var table = $("#dvGrades").find("#ctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolder1_grdGrades_itemPlaceholderContainer");


    if ($(table).length == 0) {
        console.log("JCT Tools-> table is empty");
        return;
    }
    var tr = $(table).find("tr");
    if ($(tr).length == 0) {
        console.log("JCT Tools-> tr is empty");
        return;
    }


    var customTr = "<table>";
    console.log("JCT Tools-> Fetching data");

    $(tr).each(function () {

        var i = 0;
        var customTd = "";
        $(this).find("td").each(function () {
            switch (i) {
                case 1:
                    customTd = "<td>" + $(this).text().trim() + "</td>";
                    break;

                case 2:
                    customTd += "<td>" + $(this).text().trim() + "</td>";
                    break;

                case 4:
                    customTd += "<td>" + $(this).text().trim() + "</td>";
                    break;
                case 6:
                    customTd += "<td>" + $(this).text().trim() + "</td>";
                    break;
            }

            i++;
        });
        customTr += "<tr>" + customTd + "</tr>";

    });
    console.log(customTr);

    customTr += "</table>";

    return customTr;

    //allTests
}

//ScheduleList
function scheduleListPage() {
    $(".table-responsive").bind("DOMSubtreeModified", updateScheduleTable);
    updateScheduleTable();

}

function updateScheduleTable() {
    $(".table-responsive").find("tr").each(function () {
        if ($(this).find(".cal").length == 0)
            if ($(this).find("th").length == 0) {

                if ($(this).text().includes("{{")) // Angular processing variables
                    return;
                $(this).append("<td class='cal'>" + generateCourseCalendar(this) + "</td>");
            }
            else
                $(this).append("<th class='cal' style='min-width: 200px;'>הוספה ליומן</th>");
    })
}

function generateCourseCalendar(row) {

    var tds = $(row).find("td").map(function () {
        return $(this).text().trim();
    });
    var course = {};
    course["id"] = tds[1];
    course["name"] = tds[2];
    course["type"] = tds[3];
    course["teacher"] = tds[4];
    course["frequency"] = tds[5];
    course["details"]  = tds[6];
    course["note"] = tds[7];

    //Get date
    course["room"] = course["details"].split(',')[1];
    course["time"] = course["details"].split(',')[0];
    course["date"] = getScheduleCourseFirstTime(course["time"]);
    jQuery.extend(course,getScheduleCourseDuration(course["date"], course["time"]));

    course["description"] = "מרצה: " + course["teacher"];
    if(course["note"].trim().length>0)
        course["description"] +="<br/>" + course["note"];

    console.log(course);
    return $(createCalendar({
        options: {
            class: 'my-class',
            // You can pass an ID. If you don't, one will be generated for you
            id: null
        },
        data: {
            // Event title
            title:course["name"] + " - " +course["type"],  //'Get on the front page of HN',

            // Event start date
            start:course["start"], //new Date('June 15, 2013 19:00'),

            // Event duration (IN MINUTES)
            duration: course["duration"],//120,

            // You can also choose to set an end time
            // If an end time is set, this will take precedence over duration
            end: course["end"],//new Date('June 15, 2013 23:00'),

            // Event Address
            address: course["room"],//'The internet',

            // Event Description
            description: course["description"]
        }
    })).html();
}

function getScheduleCourseFirstTime(stringTime) {
    var hebrewDay = stringTime.split(':')[0].split(" ")[1].trim();
    var weekday;
    switch (hebrewDay)
    {
        case 'א' :
            weekday = 0;
            break;
        case 'ב' :
            weekday = 1;
            break;
        case 'ג' :
            weekday = 2;
            break;
        case 'ד' :
            weekday = 3;
            break;
        case 'ה' :
            weekday = 4;
            break;
        case 'ו' :
            weekday = 5;
            break;
        case 'ז' :
            weekday = 6;
            break;
    }
    //console.log("Hebrew date: " + hebrewDay + ", week day: " + weekday);
    var d = new Date();
    d.setDate(d.getDate() + (weekday + 7 - d.getDay()) % 7);
    return d;
}

function getScheduleCourseDuration(date,stringTime) {
    var hours = stringTime.substr(stringTime.indexOf(":")+1).trim();
    var start = hours.split("-")[0];
    var end = hours.split("-")[1];

    var dateStart = new Date(date);
    dateStart.setHours(start.split(":")[0],start.split(":")[1],0);

    var dateEnd = new Date(date);
    dateEnd.setHours(end.split(":")[0],end.split(":")[1],0);


    return {start:dateStart,end:dateEnd ,duration:Math.floor((Math.abs(dateEnd - dateStart)/1000)/60)}

}
