//$(function(){



  
  var tmpl;   // Main template HTML
  tdata = { };  // JSON data object that feeds the template//tdata = {"runFancyBox": "true" }
  
  // Initialise page
  var initPage = function() {
  
  // Load the HTML template
  $.get("/workspace/finance/status.html", function(d){
        tmpl = d;
        });
  
  $(document).ajaxStop(function () {
                       //var renderedPage = Mustache.to_html( tmpl, tdata );
                       $("#right_container").html( tmpl);
                         $("#wrapperSelector").addClass('fixed_size_wrapper');
					  
					   table_effects();
					   
                       })
  }();
 // });

