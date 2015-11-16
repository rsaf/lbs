/**
 * Created by rollandsafort on 12/20/14.
 */
/**
 * Created by rollandsafort on 12/20/14.
 */

/**
 * Created by rollandsafort on 12/13/14.
 */




var initPage = function() {

    var IDPhotosHtml;   // Main template HTML


    // Load the HTML template
    $.get("/workspace/inspection/singlePhotoView.html", function (d) {

        IDPhotosHtml = d;
    });

    $(document).ajaxStop(function () {

        $(".container_bottom").addClass('idPhotoGalery');

        $(".container_bottom").html(IDPhotosHtml);


        table_effects();
        idphotoGalerySlider();
    })

}();/*end of init*/


