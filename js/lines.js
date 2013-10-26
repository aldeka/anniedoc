$(document).ready(function(){
    // console.log('loaded');
    // load the text of Hamlet
    $("#hamlet").loadTemplate("hamlet.html", {}, {success: function() {
        /* Make a div for the annotation interface to live for each line*/
        $.each($('#hamlet').children(), function(i, val) {
            if ($(val).is('blockquote')) {
                // Remove extraneous linebreaks
                $(val).children('br').remove();
                // Wrap the remaining a and i elements
                $.each($(val).children(), function(j, line) {
                    $(line).wrap("<div class='row'><div class='line col-md-6 col-md-offset-3'></div><div class='col-md-3 annie'></div></div>");
                    // each .line's ID now has the act.scene.line data
                    $(line).parent().attr('id', $(line).attr('name'));
                });
            } else {
                $(val).wrap("<div class='row'><div class='col-md-6 col-md-offset-3'></div></div>");
            }
        });

        $(".annie").loadTemplate($("#annie-template"));

        /* Shift over */
        $('.text').on('click', '.annie-toggle', function(){
            var annie = $(this).closest('.annie');
            $(annie).parent().children('.line').toggleClass('col-md-6').toggleClass('col-md-3');
            $(annie).toggleClass('col-md-3').toggleClass('col-md-6');
            $(annie).toggleClass('opened');
        });
    }});
});