

var initPage = function() {






	// Load the HTML template

	var getIDphotoContainerHtml = $.get("/workspace/inspection/unInspected.html", function (d) {
		IDphotoContainerHtml = d;
	});

	var getIDphotoHtml = $.get("/workspace/inspection/unInspectedBottom.html", function (d) {

		IDphotoHtml = d;
	});




	$.when(getIDphotoContainerHtml, getIDphotoHtml).then(function () {


		$("#right_container").html( IDphotoContainerHtml);
		$(".container_bottom").html( IDphotoHtml);

		table_effects();
		idphotoGalerySlider();
		swapPhotoDisplayModeIcon();
		updateWorkSpaceRightContainerOnClick(".singlePhotoMode", "/workspace/inspection/singlePhotoView");
		updateWorkSpaceRightContainerOnClick(".albumMode", "/workspace/inspection/unInspectedBottom");
	})

}();/*end of init*/



var swapPhotoDisplayModeIcon = function(){

	$('.singlePhotoMode').click(function(e){


			$(this).addClass('singlePhotoModeClicked');
			$('.albumMode').addClass('albumModeUnClicked');

	});



	$('.albumMode').click(function(e){


			$(this).removeClass('albumModeUnClicked');
			$('.singlePhotoMode').removeClass('singlePhotoModeClicked');


	})



}