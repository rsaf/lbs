// Initialise page
var initPage = function () {

    console.log('registration.js loading---')
    var getRegistrationPageHtml = $.get("/home/userRegistration.html", function (d) {

        templateHtml = d;//save template

        $("#home_main_containter_selector").removeClass('home_main_containter');//add a new class to the main_contaiter
        $("#home_main_containter_selector").addClass('notHomeMainContainer');

    });

    $.when(getRegistrationPageHtml).then(function () {
        $(".notHomeMainContainer").html(templateHtml);
        v_aligner();
        registrationPageScript();
        randomString();
    });

}();

//swap to the blue background , the arrow on the selected user type and take the user to the worskspace corresponding to his type
function registrationPageScript() {
    passWordStrengh();//run password strenth indicator

    $("#conformPassword").keyup(checkPasswordMatch);
    //checkPasswordMatch();//run password match
    //default settings: blue backgroud on the personal user , if we are not on servicePoint registration page
    if (!$("#regBoxBody").hasClass('servicepoint')) {
        $("#regBoxHeaderLeft").find('.mainFrame').addClass('regBoxHeaderSelectedUserTypePern');
        $("#regBoxHeaderLeft").siblings().find('.mainFrame').removeClass('regBoxHeaderSelectedUserTypeCorp');
        $("#regBoxHeaderLeft").find('.arrowFrame').css("display", "block");
        $("#regBoxHeaderLeft").siblings().find('.arrowFrame').css("display", "none");
        $("#regBox #userType").val("personal");
        //alert("setting registration pagedefault");
    }

    //end of default settings: blue backgroud on the personal user
    $("#regBoxHeaderLeft").click(function (e) {//swap to the blue background and the arrow on the personal user

        //$(this).find('.mainFrame').addClass('regBoxHeaderSelectedUserTypePern');
        //$(this).siblings().find('.mainFrame').removeClass('regBoxHeaderSelectedUserTypeCorp');
        //$(this).find('.arrowFrame').css("display", "block");
        //$(this).siblings().find('.arrowFrame').css("display", "none");
        //$("#regBox #userType").val("personal");

    });

    $("#regBoxHeaderRight").click(function (e) {//swap to the blue background and the arrow on the corporate user

        //$(this).find('.mainFrame').addClass('regBoxHeaderSelectedUserTypeCorp');
        //$(this).siblings().find('.mainFrame').removeClass('regBoxHeaderSelectedUserTypePern');
        //$(this).find('.arrowFrame').css("display", "block");
        //$(this).siblings().find('.arrowFrame').css("display", "none");
        //$("#regBox #userType").val("corporate");


    });


    //submit registration info

    $("#regBoxBody #submit").click(function (e) {


        //var postRegistrationData = $.post('/home/registration.json',
        //    {
        //        "loginName": $('#loginName').val(),
        //        "password": $('#password').val(),
        //        "userType": $('#userType').val()
        //    }, function (paramReturndata) {
        //        if (paramReturndata.pl.status) {
        //            gUserType = paramReturndata.pl.type;
        //            $.bbq.pushState('#/workspace/welcome');
        //
        //
        //        }
        //        else {
        //            alert("Invalid user information !!");
        //        }
        //
        //    }, "json");

        e.preventDefault();
    });

}

//end of swap to the blue background , the arrow on the selected user type and take the user to the worskspace corresponding to his type
