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
                    var id = '';
                    if ($(line).attr('name')) {
                        id = $(line).attr('name').replace(/\./g,'-');
                    }
                    $(line).parent().attr('id', id);
                });
            } else {
                $(val).wrap("<div class='row'><div class='col-md-6 col-md-offset-3'></div></div>");
            }
        });

        /*  Put the basic annotation template, with addition UI, 
            next to each line */
        $('#annie-template').tmpl({}).appendTo('.annie');

        // Fake annotation data
        var annieData = {
            keys: ["1.1.1", "1.1.4"],
            "1.1.1": {
                count: 1,
                annotations: [
                    {
                        author: "Jane Womack",
                        text: "Hamlet is extremely melancholy and discontented with the state of affairs in Denmark and in his own family--indeed, in the world at large. He is extremely disappointed with his mother for marrying his uncle so quickly, and he repudiates Ophelia, a woman he once claimed to love, in the harshest terms. His words often indicate his disgust with and distrust of women in general. At a number of points in the play, he contemplates his own death and even the option of suicide."
                    }
                ]
            },
            "1.1.4": {
                count: 2,
                annotations: [
                    {
                        author: "Bob Bananamonger",
                        text: "Blah blah blah."
                    },
                    {
                        author: "Jane",
                        text: "Here, Shakespeare makes fun of something. As you do."
                    }
                ]
            }
        };

        /* Add existing-annotations template 
           to lines with annotations */
        $.each(annieData.keys, function(i, val){
            var container = $('#' + val.replace(/\./g,'-')).parent().find('.annotations-container');
            $('#annotations-template').tmpl(annieData[val]).appendTo($(container));
        });

        /* When about to add a new annotation, shift sizes of spans */
        var toggleSpans = function(e, a){
            var annie;
            if (arguments.length == 2) {
                annie = a;
            } else {
                annie = $(this).closest('.annie');
            }
            $(annie).parent().children('.line').toggleClass('col-md-6').toggleClass('col-md-3').toggleClass('highlight');
            $(annie).toggleClass('col-md-3').toggleClass('col-md-6');
            $(annie).toggleClass('opened');
        };

        $('.text').on('click', '.annie-toggle', toggleSpans);

        /* Showing annotations does the same thing as the add new button 
           plus adding another class */
        $('.text').on('click', '.show-annotations-button', function(e){
            var annie = $(this).closest('.annie');
            toggleSpans(e, annie);
            $(annie).toggleClass('show-all');
        });
    }});
});