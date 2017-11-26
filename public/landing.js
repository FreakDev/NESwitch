$(function() {
    var $window = $(window),
        $header = $('header'),
        $bigpics = $('.big-pics'),
        $slider = $('.slider'),
        maxSliderIndex = $slider.children('.slide').length,
        sliderIndex = maxSliderIndex;

    $slider.addClass('active-' + maxSliderIndex)

    setInterval(function () {
        var nextSliderIndex = sliderIndex + 1;
        if (nextSliderIndex > maxSliderIndex) {
            nextSliderIndex = 1;
        }
        $slider.removeClass('active-' + sliderIndex)
               .addClass('active-' + nextSliderIndex)

        sliderIndex = nextSliderIndex;
    }, 3500);

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