

var initPage = function() {






	// Load the HTML template

	var getIDphotoContainerHtml = $.get("/workspace/processing/processSucessful.html", function (d) {
		IDphotoContainerHtml = d;
	});

	var getIDphotoHtml = $.get("/workspace/processing/processSucessfulBottom.html", function (d) {

		IDphotoHtml = d;
	});




	$.when(getIDphotoContainerHtml, getIDphotoHtml).then(function () {


		$("#right_container").html( IDphotoContainerHtml);
		$(".container_bottom").html( IDphotoHtml);

		table_effects();
		idphotoGalerySlider();
		updateWorkSpaceRightContainerOnClick(".listMode", "/workspace/photos/idPhotoListView");
		updateWorkSpaceRightContainerOnClick(".albumMode", "/workspace/processing/processSucessfulBottom");
	})

}();/*end of init*/



