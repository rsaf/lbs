/**
 * Created by rollandsafort on 12/25/14.
 */





var initPage = function() {






    // Load the HTML template

    var getIDphotoContainerHtml = $.get("/workspace/inspection/uninspected.html", function (d) {
        IDphotoContainerHtml = d;
    });

    var getIDphotoHtml = $.get("/workspace/inspection/unInspectedFoldersBottom.html", function (d) {

        IDphotoHtml = d;
    });




    $.when(getIDphotoContainerHtml, getIDphotoHtml).then(function () {


        $("#right_container").html( IDphotoContainerHtml);
        $(".container_bottom").html( IDphotoHtml);

        table_effects();
        idphotoGalerySlider();
        swapPhotoDisplayModeIcon();
        updateWorkSpaceRightContainerOnClick(".photoFolders .siglephtoframe", "/workspace/inspection/unInspected");
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