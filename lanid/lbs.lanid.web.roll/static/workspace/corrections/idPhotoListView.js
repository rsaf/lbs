var initPage = function() {

	var IDPhotosHtml;   // Main template HTML


	// Load the HTML template
	$.get("/workspace/corrections/idPhotoListView.html", function(d){
		IDPhotosHtml= d;
	});

	$(document).ajaxStop(function () {

		$(".container_bottom").html( IDPhotosHtml);
		$(".container_bottom").removeClass('idPhotoGalery');

		table_effects();
		idphotoGalerySlider();

	})

}();/*end of init*/



