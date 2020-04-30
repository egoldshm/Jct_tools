//======================================================
//	JCT - Moodle++ | Hide Courses
//------------------------------------------------------
//	Original Author: Yossef Itzchak Kuszer
//	E-Mail: yossefkuszer@gmail.com
//	Date:   17/07/2016
//======================================================

var coursesList;
var coursesList2;

function hideCourses(data, data2, hiddeModdelHelp){

	console.log("JCT Tools->" + "hideCourses");

	//check if this web page is the main page
	if($("#frontpage-course-list").length == 0)
		return;
	
	
	if($(".hide_button").length>0)
		console.log("jct moodle ++");

	coursesList = Object.keys(data);
	coursesList2 = Object.keys(data2);


	console.log(coursesList);
	console.log(coursesList2);


	addButtons(hiddeModdelHelp, coursesList.length > 0, coursesList2.length > 0);

	//check if open the page "current" or "all courses"
	// if the user does not have any course that he wants to hide,
	// the page, "all courses" will be open, else the page "current"

	//if there is no hide course, the page with the option to chose to hide/unhide will be open
	if(coursesList.length == 0)
		openAllCourses();
	else
		openMyCourses();


	var hash = location.hash;
	if(hash == "#all")
	{
		openAllCourses();
	}
	else if(hash == "#my")
	{
		openMyCourses();
	}
	else if(hash == "#tar")
	{
		openTargilimCourses();
	}
	
	//when the button is click , open the page "all courses"
	$("#allCourses").click(function() {
		openAllCourses();
	});



	//when the button is click , open the page "current courses"
	$("#currentCourses").click(function() {
		openMyCourses();
	});

	$("#targilimCourses").click(function() {
		openTargilimCourses();
	});

};


//add the two buttons in the page, that will let to transist between the page with all selected courses, and the page with the option to hide/unhide courses
function addButtons(hiddeModdelHelp, has_my_course, has_targilim_courses) {

	var buttons = '<div>'
	if(has_my_course)
		buttons += '<button style="width:32%;height:50px;font-family:Heebo" id="currentCourses" disabled>קורסים שלי</button>'

	if(has_targilim_courses)
		buttons += '<button id="targilimCourses" style="width:32%;height:50px;font-family:Heebo" >בדיקת תרגילים</button>'
	
	buttons += '<button id="allCourses" style="width:32%;height:50px;font-family:Heebo" >כל הקורסים</button>'
	
	
	buttons += '</div>';

	//remove the title "My Courses" and add a custom one
	$("#frontpage-course-list").children("h2").hide();
	$("#frontpage-course-list").prepend(buttons);
	
	
	//Check if moodle jct++ is installed
	if($(".hide_button").length>0)
	{
		$(".hide_button").remove();
		$(".unhide_button").remove();
		$("#show_current").remove();
		$("#show_all").remove();
		var confict = "<div style='background:red;color: white; text-align: center;font-size: 20px;font-weight: bolder;'><p>אזהרה: Jct moodle++ מותקן.<br/>תוסף זה יכול להוביל לקונפליקט ולכן חלק השבתנו.<p>";
		$("#frontpage-course-list").prepend(confict);

	}	
	
	if(hiddeModdelHelp)
		return;
	var text = "<h4>ניתן להגדיר הקורסים שלי <a href='chrome-extension://"+chrome.runtime.id+"/options.html' target='_blank'> בהגדרות</a></h4>"
	$("#frontpage-course-list").prepend(text);

}




//open the page with all the couses, and show the hide/unhide button
function openAllCourses() {

	//block and unblock the button, so the only button the user can chose is the button to change the page
	$("#frontpage-course-list").find("#currentCourses").removeAttr("disabled");
	$("#frontpage-course-list").find("#targilimCourses").removeAttr("disabled");

	$("#frontpage-course-list").find("#allCourses").attr("disabled",true);
	$(".coursebox").show(); //show all courses
}

//open the page only with the courses the user chose to show
function openMyCourses() {

	//block and unblock the button, so the only button the user can chose is the button to change the page
	$("#frontpage-course-list").find("#allCourses").removeAttr("disabled");
	$("#frontpage-course-list").find("#targilimCourses").removeAttr("disabled");

	$("#frontpage-course-list").find("#currentCourses").attr("disabled",true);

	$(".coursebox").hide();
	//remove all the courses the user chose (the options to be hide are save in the local storage)
	for (var i = 0; i < coursesList.length; i++) {
		if(coursesList[i])
			var testDate = "";
			$("[data-courseid="+coursesList[i]+"]").show();
	}
}


//open the page only with the courses the user chose to show
function openTargilimCourses() {
	//block and unblock the button, so the only button the user can chose is the button to change the page
	$("#frontpage-course-list").find("#allCourses").removeAttr("disabled");
	$("#frontpage-course-list").find("#currentCourses").removeAttr("disabled");

	$("#frontpage-course-list").find("#targilimCourses").attr("disabled",true);

	$(".coursebox").hide();
	//remove all the courses the user chose (the options to be hide are save in the local storage)
	for (var i = 0; i < coursesList2.length; i++) {
		if(coursesList2[i])
			var testDate = "";
			$("[data-courseid="+coursesList2[i]+"]").show();
	}
}

