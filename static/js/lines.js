$(document).ready(function(){
    // console.log('loaded');
    /*
     *
     * Lots of DOM setup, first...
     *
     */
    /* Make a div for the annotation interface to live for each line */
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
                    // console.log(id);
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

    var calculateAnniePositions = function() {
        /*
         * Add annotations to docmap bar!
         */
        $.each($('.show-annotations-button'), function(i, val){
            console.log('running');
            var annieCount = $(val).children('strong').text();
            if (parseInt(annieCount,10) == 1) {
                annieCount = annieCount + ' annotation';
            } else if (parseInt(annieCount,10) > 1) {
                annieCount = annieCount + ' annotations';
            }
            var annieLine = $(val).closest('.row').find('.para').attr('id');
            var annieLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#docmap').height() / $('#hamlet').height();
            $('#docmap-item-template').tmpl({
                type: 'annie',
                id: annieLine,
                text: annieCount,
                position: Math.floor(annieLocation) - 7
                }).appendTo($('#docmap'));
        });
    };

    /* request annotation data from Flask */
    $.getJSON('/api/annotation',
        function(annieData) {
            // console.log(annieData);
            for (var i = 0; i < annieData.keys.length; i++) {
                var val = annieData.keys[i];
                var container = $('#' + val.replace(/\./g,'-')).parent().find('.annotations-container');
                $('#annotations-template').tmpl(annieData[val]).appendTo($(container));
            }

            calculateAnniePositions();
        }
    );

    var calculateDocPosition = function() {
        var topOfWindow = $(window).scrollTop();
        var percentComplete = (topOfWindow - $('#hamlet').offset().top) / $('#hamlet').height();
        if (percentComplete > 1) {
            percentComplete = 1;
        }
        var rawPosition = percentComplete * $('#docmap').height();
        if (rawPosition < 0) {
            rawPosition = 0;
        }

        $('#status').css('top', rawPosition.toString() + 'px');
    };

    var calculateDocMap = function() {
        // clear current docmap objects 
        $('#docmap a').remove();

        /* Mark up act and scene headers
         * and add them to docmap
         */
        $.each($('h2'), function(i, val){
            var newAct = 'act-' + (i+1).toString();
            $(val).closest('.row').addClass('act').attr('id', newAct);
            var actLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#docmap').height() / $('#hamlet').height();
            $('#docmap-item-template').tmpl({
                type: 'act',
                id: newAct,
                text: $.trim($(val).text()),
                position: Math.floor(actLocation) - 3
                }).appendTo($('#docmap'));
        });
        var currentAct = 0;
        var currentScene = 1;
        $.each($('h3'), function(i, val) {
            var row = $(val).closest('.row');
            var actNum = $($(row).prevAll('.act').first()[0]).attr('id').slice(4);
            if (parseInt(actNum,10) > currentAct) {
                currentAct = parseInt(actNum,10);
                currentScene = 1;
            } else {
                currentScene += 1;
            }
            var newScene = actNum + '-' + currentScene.toString();
            $(val).addClass('scene').attr('id', newScene);
            var sceneLocation = ($(val).offset().top - $('#hamlet').offset().top) * $('#docmap').height() / $('#hamlet').height();
            $('#docmap-item-template').tmpl({
                type: 'scene',
                id: newScene,
                text: $.trim($(val).text()),
                position: Math.floor(sceneLocation) - 3
                }).appendTo($('#docmap'));
        });

        calculateAnniePositions();
        calculateDocPosition();
    };

    calculateDocMap();

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
        calculateDocMap();
    };

    $('.text').on('click', '.annie-toggle', toggleSpans);

    /* Showing annotations does the same thing as the add new button 
       plus adding another class */
    $('.text').on('click', '.show-annotations-button', function(e){
        var annie = $(this).closest('.annie');
        toggleSpans(e, annie);
    });

    $('.text').on('submit', '.add-annotation form', function(e){
        e.preventDefault();
        data = {
            _csrf_token : $(this).find('[name="_csrf_token"]').val(),
            author: $(this).find('[name="author"]').val(),
            text: $(this).find('[name="annotation-text"]').val(),
            line: $(this).closest('.row').find('.line').attr('id').replace(/-/g,'.')
        };
        $.post('/api/annotation', data, function(stuff) {
            // .annotations-container
            var container = $('#' + stuff.line.replace(/\./g,'-')).parent().find('.annotations-container');
            if (typeof $(container).find('.show-annotations') != 'undefined' && $(container).find('.show-annotations').length > 0) {
                // add one to existing container setup
                $('#single-annotation-template').tmpl(stuff).appendTo(container.find('.show-annotations'));
                var count = $(container).find('.show-annotations-button').find('strong');
                $(count).text(parseInt(count.text(),10) + 1);

            } else {
                // line is being annotated for the first time
                var moreStuff = {
                    count: 1,
                    annotations: [stuff]
                };
                $('#annotations-template').tmpl(moreStuff).appendTo($(container));
                calculateDocMap();
            }
            // clear the input form
            $('input[type="text"]').val('');
            $('textarea').val('');
        }, "json");
    });

    $(document).on('scroll', function(e) {
        calculateDocPosition();
    });

    $(window).on('resize', function(e) {
        calculateDocMap();
     });

});