

  var initPage = function() {






	  // Load the HTML template

	  var getIDphotoContainerHtml = $.get("/workspace/photos/processing.html", function (d) {
		  IDphotoContainerHtml = d;
	  });

	  var getIDphotoHtml = $.get("/workspace/photos/processingBottom.html", function (d) {

		  IDphotoHtml = d;
	  });




	  $.when(getIDphotoContainerHtml, getIDphotoHtml).then(function () {


		  $("#right_container").html( IDphotoContainerHtml);
		  $(".container_bottom").html( IDphotoHtml);

				   table_effects();
					   idphotoGalerySlider();
	  			updateWorkSpaceRightContainerOnClick(".listMode", "/workspace/photos/idPhotoListView");
	  			updateWorkSpaceRightContainerOnClick(".albumMode", "/workspace/photos/processingBottom");
					 })
					
			 }();/*end of init*/



