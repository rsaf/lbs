// script for forgot password page welcome page


// Initialise page
var initPage = function () {

    var getRegistrationPageHtml = $.get("/home/forgetPw/forgotPw.html", function (d) {

        templateHtml = d;//save template

        $("#home_main_containter_selector").removeClass('home_main_containter');//add a new class to the main_contaiter
        $("#home_main_containter_selector").addClass('notHomeMainContainer');
        //var className=$("#home_main_containter_selector").attr('class');
        //alert("class in main container : " +  className);

    });

    $.when(getRegistrationPageHtml).then(function () {

        //var renderedPage = Mustache.to_html(	 templateHtml);

        //alert("rendered page : " +renderedPage);
        //alert( $(".home_main_containter").html());
        $(".notHomeMainContainer").html(templateHtml);
        //v_aligner();

        //hilight the first step on the forgot password operation procedur bar by default
        ShiftOperationIndicatorBar(".forgotPwLevel1");
        randomString();
        forgotPwOnSubmit();

        //alert( $(".home_main_containter").html());


    });


}();


//user name or email submit
function forgotPwOnSubmit() {

    //alert("on submit");

    //on submit

    $("#forgotPwSubmit").click(function (e) {

        //alert("submit data");

        // Retrieve the server data and then initialise the page
        var userLoginName = $("#forgotPw_email").val();
        var jsonData = {"userLoginName": userLoginName};
        //alert("user input "+JSON.stringify(jsonData));

        var ConfEmailJson, ConfEmailHtml;


        var getConfEmailJson = $.post("/home/forgotPassword", JSON.parse(JSON.stringify(jsonData)), function (paramReturndata) {
            //
            //  alert("receiving json data: email is :"+ JSON.stringify(paramReturndata));
            ConfEmailJson = JSON.parse(JSON.stringify(paramReturndata));


        }, "json");

        var getConfEmailHtml = $.get("/home/forgetpw/forgotPwConfEmail.html", function (d) {

            ConfEmailHtml = d;

            // alert("receiving json data: template is :"+ ConfEmailHtml);

        });

        $.when(getConfEmailHtml, getConfEmailJson).then(function () {

            //	alert("rendering");

            var renderedPage = Mustache.to_html(ConfEmailHtml, ConfEmailJson);
            //  alert(renderedPage);
            //  alert($("#regBoxBody").html());
            $("#regBoxBody").html(renderedPage);


            ShiftOperationIndicatorBar(".forgotPwLevel2");
            clickOnConfirmationLink();


            //  alert($("#regBoxBody").html());


        });


        e.preventDefault();

    });


}

//end of user nama or email submit


//confirm email on the server

function clickOnConfirmationLink() {

    $("#confirmPawordLink").click(function (e) {

        $.getScript('/home/forgetpw/resetPw.js');

        e.preventDefault();

    });
}


// end of confirm email on the server
 
 
 
 
 
 
 
 
 
 
 
 
 