

var initPage = function() {

	// Load the HTML template

	var getIDphotoContainerHtml = $.get("/workspace/corrections/processFailed.html", function (d) {
		IDphotoContainerHtml = d;
	});

	var getIDphotoHtml = $.get("/workspace/corrections/processFailedBottom.html", function (d) {

		IDphotoHtml = d;
	});

	$.when(getIDphotoContainerHtml, getIDphotoHtml).then(function () {

		$("#right_container").html( IDphotoContainerHtml);
		$(".container_bottom").html( IDphotoHtml);

		table_effects();
		idphotoGalerySlider();
		updateWorkSpaceRightContainerOnClick(".listMode", "/workspace/corrections/idPhotoListView");
		updateWorkSpaceRightContainerOnClick(".albumMode", "/workspace/corrections/processFailedBottom");
	})

}();/*end of init*/



