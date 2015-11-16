
//
//$(function () {
//
//
//    //load the page Hmml template and eventual Json data
//
//    // var personalMasterHtml, personalHomeHtml;   // Main template HTML
//    var userProfileJson;
//
//    // Initialise page
//
//
//    var initPage = function () {
//
//        var getWorkSpaceMasterHtml = $.get("/workspace/welcome/master.html", function (d) {
//            workSpaceMasterHtml = d;
//        });
//
//        var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/"+gUserType+"LeftNav.html", function (d) {
//            workSpacenavigationHtml = d;
//        });
//
//        var getWorkSpaceHomeHtml = $.get("/workspace/welcome/"+gUserType+"Home.html", function (d) {
//            workSpaceHomeHtml = d;
//        });
//
//
//
//
///*
//        if (gUserType == 'personal') {
//            var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/personalLeftNav.html", function (d) {
//                workSpacenavigationHtml = d;
//            });
//
//            var getWorkSpaceHomeHtml = $.get("/workspace/welcome/personalHome.html", function (d) {
//                workSpaceHomeHtml = d;
//            });
//
//        }
//        else if (gUserType == 'corporate') {
//            var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/corporateLeftNav.html", function (d) {
//                workSpacenavigationHtml = d;
//
//            });
//
//
//            var getWorkSpaceHomeHtml = $.get("/workspace/welcome/corporateHome.html", function (d) {
//                //  alert("getting home html");
//                workSpaceHomeHtml = d;
//
//            });
//
//        }
//        */
//
//
//
//
//
//        $.when(getWorkSpaceMasterHtml, getWorkSpaceHomeHtml, getWorkSpaceNavigationHtml).then(function () {
//
//            if($("#wrapperSelector").hasClass('home_wrapper')){
//                $("#wrapperSelector").removeClass('home_wrapper');
//                $("#wrapperSelector").addClass('wrapper');
//
//            }
//
//             $(".wrapper").html(workSpaceMasterHtml).css("display", "none").fadeIn(500);
//
//             $(".topMobileNavigations").html(workSpacenavigationHtml);
//             $(".leftNavigations").html(workSpacenavigationHtml);
//             $(".rightContainer").html(workSpaceHomeHtml);
//
//            slideEffectsHandler();
//            $('[data-toggle="tooltip"]').tooltip();
//            
//            sidebar();
//            table_effects();
//
//            //show corresponding page when clicking on the submenu item on the side navigation
//
//
//            updateWorkSpaceRightContainerOnClick(".notifications", "/workspace/notifications");
//            updateWorkSpaceRightContainerOnClick(".allNotificationsID", "/workspace/notifications/all");
//            updateWorkSpaceRightContainerOnClick(".accountNotificationsID", "/workspace/notifications/unread");
//            updateWorkSpaceRightContainerOnClick(".serviceNotificationsID", "/workspace/notifications/read");
//
//            updateWorkSpaceRightContainerOnClick(".activitiesList", "/workspace/activities/activitieslist");
//            updateWorkSpaceRightContainerOnClick(".namesList", "/workspace/activities/nameslist");
//            updateWorkSpaceRightContainerOnClick(".activitiesForms", "/workspace/activities/activitiesforms");
//            updateWorkSpaceRightContainerOnClick(".publicForms", "/workspace/activities/publicforms");
//            updateWorkSpaceRightContainerOnClick(".servicesList", "/workspace/activities/serviceslist");
//
//            updateWorkSpaceRightContainerOnClick(".allResponses", "/workspace/responses/all");
//            updateWorkSpaceRightContainerOnClick(".conventionalResponses", "/workspace/responses/conventional");
//            updateWorkSpaceRightContainerOnClick(".favoriteResponses", "/workspace/responses/favorite");
//            updateWorkSpaceRightContainerOnClick(".agentResponses", "/workspace/responses/agent");
//            updateWorkSpaceRightContainerOnClick(".delegatedResponses", "/workspace/responses/delegated");
//            updateWorkSpaceRightContainerOnClick(".agentSettings", "/workspace/responses/agentsettings");
//
//            updateWorkSpaceRightContainerOnClick(".finTransactionRecordID", "/workspace/finance/history");
//            updateWorkSpaceRightContainerOnClick(".finInformationID", "/workspace/finance/status");
//
//            updateWorkSpaceRightContainerOnClick(".allUsers", "/workspace/users/all");
//            updateWorkSpaceRightContainerOnClick(".featureACL", "/workspace/users/acl");
//            updateWorkSpaceRightContainerOnClick(".securityGroup", "/workspace/users/groups");
//
//
//
//            updateWorkSpaceRightContainerOnClick(".IDPhotos", "/workspace/photos/idphotos");
//            updateWorkSpaceRightContainerOnClick(".processingPhotos", "/workspace/photos/processing");
//            updateWorkSpaceRightContainerOnClick(".otherPhotos", "/workspace/photos/otherphotos");
//
//           // updateWorkSpaceRightContainerOnClick(".corporateProfile", "/workspace/profile/corporateFullProfile");
//
//
//            updateWorkSpaceRightContainerOnClick(".corporateProfile", "/workspace/profile/corporateprofile");
//            updateWorkSpaceRightContainerOnClick(".corporateDetail", "/workspace/profile/corporatedetail");
//            updateWorkSpaceRightContainerOnClick(".personalProfile", "/workspace/profile/personalprofile");
//            updateWorkSpaceRightContainerOnClick(".securityManagement", "/workspace/profile/securitymanagement");
//
//
//            updateWorkSpaceRightContainerOnClick(".opsLogID", "/workspace/operationslog/all");
//            updateWorkSpaceRightContainerOnClick(".opsLogBusiness", "/workspace/operationslog/business");
//            updateWorkSpaceRightContainerOnClick(".opsLogAccess", "/workspace/operationslog/access");
//
//            updateWorkSpaceRightContainerOnClick(".allRequests", "/workspace/requests/all");
//            updateWorkSpaceRightContainerOnClick(".approvedRequests", "/workspace/requests/approved");
//            updateWorkSpaceRightContainerOnClick(".rejectedRequests", "/workspace/requests/rejected");
//            updateWorkSpaceRightContainerOnClick(".unProcessRequests", "/workspace/requests/unprocess");
//
//
//            updateWorkSpaceRightContainerOnClick(".allLogsContainer .table_more li", "/workspace/operationslog/detailsPopUp");
//            updateWorkSpaceRightContainerOnClick(".not_home_logo","/workspace/welcome");
//
//
//            updateWorkSpaceRightContainerOnClick(".allBookings", "/workspace/services/allbookings");
//            updateWorkSpaceRightContainerOnClick(".businessRecords", "/workspace/services/businessrecords");
//            updateWorkSpaceRightContainerOnClick(".myServicePoints", "/workspace/services/myservicepoints");
//            updateWorkSpaceRightContainerOnClick(".myServices", "/workspace/services/myservices");
//            
//            updateWorkSpaceRightContainerOnClick(".unInspected", "/workspace/inspection/unInspectedFolders");
//             updateWorkSpaceRightContainerOnClick(".qualified", "/workspace/inspection/qualified");
//             updateWorkSpaceRightContainerOnClick(".unQualified", "/workspace/inspection/unQualified");
//             updateWorkSpaceRightContainerOnClick(".unProcessed", "/workspace/processing/unProcessed");
//             updateWorkSpaceRightContainerOnClick(".processSucessful", "/workspace/processing/processSucessful");
//             updateWorkSpaceRightContainerOnClick(".processFailed", "/workspace/processing/processFailed");
//
//
//            updateWorkSpaceRightContainerOnClick(".idPhotosStandard", "/workspace/standards/idPhotoStandard");
//            updateWorkSpaceRightContainerOnClick(".idPhotosUsage", "/workspace/standards/idPhotosUsage");
//
//            updateWorkSpaceRightContainerOnClick(".systemInterfaces", "/workspace/interfaces/systemInterfaces");
//            updateWorkSpaceRightContainerOnClick(".thirdPartyInterfaces", "/workspace/interfaces/thirdPartyInterfaces");
//
//
//
//        });
//
//
//    }();
//    /*end of init*/
//    //end of load the page Html template and eventual Json data
//    // end of show corresponding page when clicking on the submenu item on the side navigation
//});
///*end of document ready*/
//

$(function () {


    //load the page Hmml template and eventual Json data

    // var personalMasterHtml, personalHomeHtml;   // Main template HTML
    var userProfileJson;

    // Initialise page


    var initPage = function () {

        var getWorkSpaceMasterHtml = $.get("/workspace/welcome/master.html", function (d) {
            workSpaceMasterHtml = d;
        });

        var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/"+gUserType+"LeftNav.html", function (d) {
            workSpacenavigationHtml = d;
        });

        var getWorkSpaceHomeHtml = $.get("/workspace/welcome/"+gUserType+"Home.html", function (d) {
            workSpaceHomeHtml = d;
        });




/*
        if (gUserType == 'personal') {
            var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/personalLeftNav.html", function (d) {
                workSpacenavigationHtml = d;
            });

            var getWorkSpaceHomeHtml = $.get("/workspace/welcome/personalHome.html", function (d) {
                workSpaceHomeHtml = d;
            });

        }
        else if (gUserType == 'corporate') {
            var getWorkSpaceNavigationHtml = $.get("/workspace/welcome/corporateLeftNav.html", function (d) {
                workSpacenavigationHtml = d;

            });


            var getWorkSpaceHomeHtml = $.get("/workspace/welcome/corporateHome.html", function (d) {
                //  alert("getting home html");
                workSpaceHomeHtml = d;

            });

        }
        */





        $.when(getWorkSpaceMasterHtml, getWorkSpaceHomeHtml, getWorkSpaceNavigationHtml).then(function () {

            if($("#wrapperSelector").hasClass('home_wrapper')){
                $("#wrapperSelector").removeClass('home_wrapper');
                $("#wrapperSelector").addClass('wrapper');

            }

             $(".wrapper").html(workSpaceMasterHtml).css("display", "none").fadeIn(500);

             $(".topMobileNavigations").html(workSpacenavigationHtml);
             $(".leftNavigations").html(workSpacenavigationHtml);
             $(".rightContainer").html(workSpaceHomeHtml);

            slideEffectsHandler();
            $('[data-toggle="tooltip"]').tooltip();
            
            sidebar();
            table_effects();

            //show corresponding page when clicking on the submenu item on the side navigation


            updateWorkSpaceRightContainerOnClick(".notifications", "/workspace/notifications");
            updateWorkSpaceRightContainerOnClick(".allNotificationsID", "/workspace/notifications/all");
            updateWorkSpaceRightContainerOnClick(".accountNotificationsID", "/workspace/notifications/unread");
            updateWorkSpaceRightContainerOnClick(".serviceNotificationsID", "/workspace/notifications/read");

            updateWorkSpaceRightContainerOnClick(".activitiesList", "/workspace/activities/activitieslist");
            updateWorkSpaceRightContainerOnClick(".namesList", "/workspace/activities/nameslist");
            updateWorkSpaceRightContainerOnClick(".activitiesForms", "/workspace/activities/activitiesforms");
            updateWorkSpaceRightContainerOnClick(".publicForms", "/workspace/activities/publicforms");
            updateWorkSpaceRightContainerOnClick(".servicesList", "/workspace/activities/serviceslist");

            updateWorkSpaceRightContainerOnClick(".allResponses", "/workspace/responses/all");
            updateWorkSpaceRightContainerOnClick(".conventionalResponses", "/workspace/responses/conventional");
            updateWorkSpaceRightContainerOnClick(".favoriteResponses", "/workspace/responses/favorite");
            updateWorkSpaceRightContainerOnClick(".agentResponses", "/workspace/responses/agent");
            updateWorkSpaceRightContainerOnClick(".delegatedResponses", "/workspace/responses/delegated");
            updateWorkSpaceRightContainerOnClick(".agentSettings", "/workspace/responses/agentsettings");

            updateWorkSpaceRightContainerOnClick(".finTransactionRecordID", "/workspace/finance/history");
            updateWorkSpaceRightContainerOnClick(".finInformationID", "/workspace/finance/status");

            updateWorkSpaceRightContainerOnClick(".allUsers", "/workspace/users/all");
            updateWorkSpaceRightContainerOnClick(".featureACL", "/workspace/users/acl");
            updateWorkSpaceRightContainerOnClick(".securityGroup", "/workspace/users/groups");



            updateWorkSpaceRightContainerOnClick(".IDPhotos", "/workspace/photos/idphotos");
            updateWorkSpaceRightContainerOnClick(".processingPhotos", "/workspace/photos/processing");
            updateWorkSpaceRightContainerOnClick(".otherPhotos", "/workspace/photos/otherphotos");

           // updateWorkSpaceRightContainerOnClick(".corporateProfile", "/workspace/profile/corporateFullProfile");


            updateWorkSpaceRightContainerOnClick(".corporateProfile", "/workspace/profile/corporateprofile");
            updateWorkSpaceRightContainerOnClick(".corporateDetail", "/workspace/profile/corporatedetail");
            updateWorkSpaceRightContainerOnClick(".personalProfile", "/workspace/profile/personalprofile");
            updateWorkSpaceRightContainerOnClick(".securityManagement", "/workspace/profile/securitymanagement");


            updateWorkSpaceRightContainerOnClick(".opsLogID", "/workspace/operationslog/all");
            updateWorkSpaceRightContainerOnClick(".opsLogBusiness", "/workspace/operationslog/business");
            updateWorkSpaceRightContainerOnClick(".opsLogAccess", "/workspace/operationslog/access");

            updateWorkSpaceRightContainerOnClick(".allRequests", "/workspace/requests/all");
            updateWorkSpaceRightContainerOnClick(".approvedRequests", "/workspace/requests/approved");
            updateWorkSpaceRightContainerOnClick(".rejectedRequests", "/workspace/requests/rejected");
            updateWorkSpaceRightContainerOnClick(".unProcessRequests", "/workspace/requests/unprocess");


            updateWorkSpaceRightContainerOnClick(".allLogsContainer .table_more li", "/workspace/operationslog/detailsPopUp");
            updateWorkSpaceRightContainerOnClick(".not_home_logo","/workspace/welcome");


            updateWorkSpaceRightContainerOnClick(".allBookings", "/workspace/services/allbookings");
            updateWorkSpaceRightContainerOnClick(".businessRecords", "/workspace/services/businessrecords");
            updateWorkSpaceRightContainerOnClick(".myServicePoints", "/workspace/services/myservicepoints");
            updateWorkSpaceRightContainerOnClick(".myServices", "/workspace/services/myservices");
            
            updateWorkSpaceRightContainerOnClick(".unInspected", "/workspace/inspection/unInspectedFolders");
             updateWorkSpaceRightContainerOnClick(".qualified", "/workspace/inspection/qualified");
             updateWorkSpaceRightContainerOnClick(".unQualified", "/workspace/inspection/unQualified");
             updateWorkSpaceRightContainerOnClick(".unProcessed", "/workspace/processing/unProcessed");
             updateWorkSpaceRightContainerOnClick(".processSucessful", "/workspace/processing/processSucessful");
             updateWorkSpaceRightContainerOnClick(".processFailed", "/workspace/processing/processFailed");


            updateWorkSpaceRightContainerOnClick(".idPhotosStandard", "/workspace/standards/idPhotoStandard");
            updateWorkSpaceRightContainerOnClick(".idPhotosUsage", "/workspace/standards/idPhotosUsage");

            updateWorkSpaceRightContainerOnClick(".systemInterfaces", "/workspace/interfaces/systemInterfaces");
            updateWorkSpaceRightContainerOnClick(".thirdPartyInterfaces", "/workspace/interfaces/thirdPartyInterfaces");



        });


    }();
    /*end of init*/
    //end of load the page Html template and eventual Json data
    // end of show corresponding page when clicking on the submenu item on the side navigation
});
/*end of document ready*/

