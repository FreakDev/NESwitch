$(function() {
    var $window = $(window),
        $header = $('header'),
        $bigpics = $('.big-pics');

    $window.resize(function () {
        $('.spacer').height($(window).height())
    });

    $window.scroll(function () {
        if ($window.scrollTop() > 1) {
            $header.addClass('open')
        } else {
            $header.removeClass('open')
        }
    });

    function resetPics () {
        $bigpics.removeClass('left-bigger')
                .removeClass('right-bigger');
    }

    function emphasis (side ) {
        resetPics();
        $bigpics.addClass(side + '-bigger');
    }

    $bigpics.children('.col:first-child').hover(function () {
        emphasis('left');
    }, function () {
        resetPics();
    });

    $bigpics.children('.col:last-child').hover(function () {
        emphasis('right');
    }, function () {
        resetPics();
    });


})