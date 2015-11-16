$(function () {
  //@todo:convert this into a module that can check /home/user endpoint, if false then show a login (/commons/login.js module)
  //   it will then render and invoke the route to render the sub
  var gUserType = this.gUserType || 'corporate';

  
  var MasterModule = function MasterModule(arg){
    lbs.cache['/workspace/welcome/mastermodule.js']='LOADED';
    this.container="#wrapperSelector";

  }
//  MasterModule.prototype.container='#wrapperSelector';
  MasterModule.prototype.render = function render(arg){
    arg = arg || {};
    var d = arg.defer || jQuery.Deferred();
    var getWorkSpaceMasterHtml = $.get("/workspace/welcome/master.html", function (d) {
      workSpaceMasterHtml = d;
    });
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
    $.when(getWorkSpaceMasterHtml, getWorkSpaceHomeHtml, getWorkSpaceNavigationHtml).then(function () {
      //even though this is a root element it doesn't want to render in the body
      //  so have to check if $("#wrapperSelector") exist, if not create a div with that id in the body
      if (!$("#wrapperSelector").length) {
        document.body.appendChild((function () {
          var div = document.createElement('div');
          div.id = 'wrapperSelector';
          $(div).addClass('wrapper');
          $(div).addClass('container');
          return div;
        }()));
      }
      if ($("#wrapperSelector").hasClass('home_wrapper')) {
        $("#wrapperSelector").removeClass('home_wrapper');
        $("#wrapperSelector").addClass('wrapper');

      }
      $(".wrapper").html(workSpaceMasterHtml).css("display", "none").fadeIn(500);

      $(".topMobileNavigations").html(workSpacenavigationHtml);
      $(".leftNavigations").html(workSpacenavigationHtml);
      $(".rightContainer").html(workSpaceHomeHtml);

      slideEffectsHandler();

      sidebar();
      table_effects();

      //show corresponding page when clicking on the submenu item on the side navigation

      //@todo: maybe this stuff is better off in a menu module
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
      updateWorkSpaceRightContainerOnClick(".not_home_logo", "/workspace/welcome");

      updateWorkSpaceRightContainerOnClick(".allBookings", "/workspace/services/allbookings");
      updateWorkSpaceRightContainerOnClick(".businessRecords", "/workspace/services/businessrecords");
      updateWorkSpaceRightContainerOnClick(".myServicePoints", "/workspace/services/myservicepoints");
      updateWorkSpaceRightContainerOnClick(".myServices", "/workspace/services/myservices");




      //rendering is done, resolve the promise
      console.log('master is resolving');
      d.resolve();
    }).fail(function(e){
      console.log('!!!!!!!!!!!!!!!!failed:',e);
    });
    return d.promise();
  };
  lbs.workspace.mastermodule=new MasterModule();
});
/*end of document ready*/


