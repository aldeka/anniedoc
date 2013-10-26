$(document).ready(function(){
    console.log('loaded');

    var annieTemplate = "<div class='row'><div class='line col-md-6 col-md-offset-3'></div><div class='col-md-3 annie'></div></div>";

    /* Make a div for the annotation interface to live for each line*/
    $.each($('#hamlet').children(), function(i, val) {
        if ($(val).is('blockquote')) {
            // Remove extraneous linebreaks
            $(val).children('br').remove();
            // Wrap the remaining a and i elements
            $.each($(val).children(), function(j, line) {
                $(line).wrap(annieTemplate);
                // each .line's ID now has the act.scene.line data
                $(line).parent().attr('id', $(line).attr('name'));
            });
        } else {
            $(val).wrap("<div class='row'><div class='col-md-6 col-md-offset-3'></div></div>");
        }
    });

    $(".annie").loadTemplate($("#annie-template"));

    /* Shift over */
    $('.text').on('click', '.annie', function(){
        $(this).parent().children('.line').toggleClass('col-md-offset-3');
        $(this).toggleClass('col-md-3').toggleClass('col-md-6');
        $(this).toggleClass('opened');
    });
});