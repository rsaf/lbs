(function(){
  if(window.location.hash.indexOf('#/workspace')===0){
    console.log('in masterjs do nothing, I am obsolete');
    //do nothing, let bbq on haschange will take care of it
    return;
  }
  var masterHtml, gUserType;  // Main template HTML
  // Initialise page
  var initHomePage = function() {
    // Load the HTML template
   $.get("/home/master.html", function(d){
      masterHtml = d;
    }).then(function(){
      $("body").html( masterHtml );
      $.getScript("/home/home.js");
      updateWorkSpaceRightContainerOnClick(".home_logo","/home/master");
      updateWorkSpaceRightContainerOnClick(".search_icon ","/home/detailPages/lanSearch");
    });
  }();
  // end of load the page html template and eventual Json data   and initialize page
    
}());
