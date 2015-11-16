/**
 * Created by rollandsafort on 12/19/14.
 */

/**
 * Created by rollandsafort on 12/19/14.
 */



// Initialise page
var initPage = function() {

    var  activitiesListHtml;   // Main template HTML

    // Load the HTML template
    $.get("/workspace/standards/idPhotosUsage.html", function(d) {
        activitiesListHtml = d;
    });

    $(document).ajaxStop(function() {

        $("#right_container").html(activitiesListHtml);

        table_effects();
        $('.selectpicker').selectpicker();
        // updateWorkSpaceRightContainerOnClick(".createNewActivity", "/publishing/services/publishing");



        //select items on click
        $('.idPhotoUsagePopupBox').find('.optionShowTable').find('tr').find('button').click(function(e){


            if($(this).hasClass('itemSelected')){
                alert('此用途已选！');


            }
            else {



                var getId     =  $(this).parents('tr').find('td:first-child').html();
                var getUsage  =  $(this).parents('tr').find('td:nth-child(2)').html();
                var getButton =   $(this).parents('tr').find('td:nth-child(3)').html();

                $(this).removeClass('lan_white blue_bg ').addClass('itemSelected specialBlue ').text('已选');

                $('.optionSaveTable').find('tbody').append(bluidRow(getId,getUsage, getButton)).find('button')
                    .removeClass('lan_white blue_bg').addClass('itemSelected specialBlue').text('已选');



            }





            e.preventDefault();



        })



        //empty selection table

        $('.idPhotoUsagePopupBox').find('.idPhotoUsagePopupRightBox').find('.clearAllSelections').click(function(e){



            $('.optionSaveTable').find('tbody').empty();
            $('.optionShowTable').find('button')
                .removeClass('itemSelected specialBlue').addClass('lan_white blue_bg').text('选择');
           // $('.optionSaveTable').find('tbody').html('');





            e.preventDefault();

        })
    })

}();/*end of init*/


var bluidRow =  function(cell1, cell2, cell3){

    var  newRow = '<tr><td>'+cell1+'</td><td>'+cell2+'</td><td>'+cell3+'</td></tr>';
    return newRow;

}


//var str = $( "p:first" ).text();  get text inside  DOM element
//var str = $( "p:first" ).html(); get DOM element and text
//var str = $( "p:first" ).contents(); get DOM element and text; the content retrieved can be manipulated as a DOM element
// eg:  $( "#frameDemo" ).contents().find( "a" ).css( "background-color", "#BADA55" );

//$( "p:last" ).html( str );            assign to another element
//