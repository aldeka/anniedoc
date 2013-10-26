$(document).ready(function(){
    // console.log('loaded');
    /*
     *
     * Lots of one-time DOM setup, first...
     *
     */
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

        /* Mark up act and scene headers
         * and add them to progress bar
         */

        $.each($('h2'), function(i, val){
            var newAct = 'act-' + (i+1).toString();
            $(val).closest('.row').addClass('act').attr('id', newAct);
            var actLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#progress-bar').height() / $('#hamlet').height();
            $('#progress-item-template').tmpl({
                type: 'act',
                id: newAct,
                text: $(val).text(),
                position: Math.floor(actLocation)
                }).appendTo($('#progress-bar'));
        });

        var currentAct = 0;
        var currentScene = 1;

        $.each($('h3'), function(i, val) {
            var row = $(val).closest('.row');
            var actNum = $($(row).prevAll('.act').first()[0]).attr('id').slice(4);
            if (parseInt(actNum) > currentAct) {
                currentAct = parseInt(actNum);
                currentScene = 1;
            } else {
                currentScene += 1;
            }
            var newScene = actNum + '-' + currentScene.toString();
            $(val).addClass('scene').attr('id', newScene);
            var sceneLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#progress-bar').height() / $('#hamlet').height();
            $('#progress-item-template').tmpl({
                type: 'scene',
                id: newScene,
                text: $(val).text(),
                position: Math.floor(sceneLocation)
                }).appendTo($('#progress-bar'));
        });

        /*
         * Add annotations to progress bar!
         */
        var progressBarThreshold = 1;
        if ($('.show-annotations-button').length > 25) {
            progressBarThreshold += Math.floor($('.show-annotations-button').length / 25)
        }
        $.each($('.show-annotations-button'), function(i, val){
            var annieCount = $(val).children('strong').text();
            if (parseInt(annieCount) >= progressBarThreshold){
                if (parseInt(annieCount) == 1) {
                    annieCount = annieCount + ' annotation';
                } else {
                    annieCount = annieCount + ' annotations';
                }
                var annieLine = $(val).closest('.row').find('.line').attr('id');
                var annieLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#progress-bar').height() / $('#hamlet').height();
                $('#progress-item-template').tmpl({
                    type: 'annie',
                    id: annieLine,
                    text: annieCount,
                    position: Math.floor(annieLocation)
                    }).appendTo($('#progress-bar'));
            }
        });

        /* 
         *
         * Actual event driven stuff!
         *
         */

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
            if ($(annie).hasClass('show-all') && !($(annie).hasClass('opened'))) {
                $(annie).toggleClass('show-all');
            }
        };

        $('.text').on('click', '.annie-toggle', toggleSpans);

        /* Showing annotations does the same thing as the add new button 
           plus adding another class */
        $('.text').on('click', '.show-annotations-button', function(e){
            var annie = $(this).closest('.annie');
            toggleSpans(e, annie);
            $(annie).toggleClass('show-all');
            if ($(annie).hasClass('show-all') && !($(annie).hasClass('opened'))) {
                $(annie).toggleClass('show-all');
            }
        });

        $(document).on('scroll', function(e) {
            var bottomOfWindow = $(window).height() + $(window).scrollTop();
            var percentComplete = (bottomOfWindow - $('#hamlet').offset().top) / $('#hamlet').height();

            if (percentComplete > 1) {
                percentComplete = 1;
            }

            $('#status').css('top', (percentComplete * $('#progress-bar').height()).toString() + 'px');
        });
    }});
});