/* -----------------------------------------------------------------------------

The Okno - Ultimate Multipurpose HTML5 Template

File:           JS Core
Version:        1.1
Last change:    10/06/15 
Author:         Suelo

-------------------------------------------------------------------------------- */

"use strict";

var $html = $('html');
var $body = $('body');

/* Header Function */

var $header = $('#header'),
    $navBar = $('#nav-bar'),
    headerHeight = $header.height(),
    stickyBarrier = $(window).height()-$navBar.height()-2,
    outBarrier = $header.height()*2,
    scrolled = 0;

window.setHeader = function() {
    scrolled = $(window).scrollTop();

    if(scrolled > headerHeight && !$header.hasClass('fixed')) {
        $header.addClass('fixed');
        if(!$header.hasClass('absolute')) { $body.css('padding-top',headerHeight+'px'); }
    } else if(scrolled <= headerHeight && $header.hasClass('fixed')) {
        $header.removeClass('fixed');
        if(!$header.hasClass('absolute')) { $body.css('padding-top',0); }
    }

    if(scrolled > outBarrier && !$header.hasClass('out')) {
        $header.addClass('out');
    } else if(scrolled <= outBarrier && $header.hasClass('out')) {
        $header.removeClass('out');
    }

    if(scrolled > stickyBarrier && !$header.hasClass('sticky')) {
        $header.addClass('sticky');
        $body.addClass('sticky-header');
    } else if(scrolled <= stickyBarrier && $header.hasClass('sticky')) {
        $header.removeClass('sticky');
        $body.removeClass('sticky-header');
    }
}

/* Main Functions */

var Okno = {
    init: function() {

        this.Basic.init();
        this.Component.init(); 
        
    },
    Basic: {
        init: function() {

            this.mobileDetector();
            this.backgrounds();
            this.masonry();
            this.navPrimary();
            this.searchBar();
            this.filter();
            this.map();
            this.scroller();
            this.sidePanel();

        },
        mobileDetector: function () {

            var isMobile = {
                Android: function() {
                    return navigator.userAgent.match(/Android/i);
                },
                BlackBerry: function() {
                    return navigator.userAgent.match(/BlackBerry/i);
                },
                iOS: function() {
                    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function() {
                    return navigator.userAgent.match(/Opera Mini/i);
                },
                Windows: function() {
                    return navigator.userAgent.match(/IEMobile/i);
                },
                any: function() {
                    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
                }
            };

            window.trueMobile = isMobile.any();

        },
        backgrounds: function() {

            // Image
            $('.bg-image').each(function(){
                var src = $(this).children('img').attr('src');
                $(this).css('background-image','url('+src+')').children('img').hide();
            });

            // Parallax 
            $('.bg-parallax').parallax({
                zIndex: 0
            });

            // Slideshow 
            $('.bg-slideshow').owlCarousel({
                singleItem: true,
                autoPlay: 4000,
                pagination: false,
                navigation: false,
                navigationText: false,
                slideSpeed: 1500,
                transitionStyle: 'fade',
                mouseDrag: false,
                touchDrag: false
            });

            // Video 
            var $bgVideo = $('.bg-video');
            if($bgVideo) {
                $bgVideo.YTPlayer();
            }
            if(trueMobile && $bgVideo.hasClass('bg-video')) {
                $bgVideo.prev('.bg-video-placeholder').show();
                $bgVideo.remove()
            }

        },
        animations: function() {

            // Animation - appear 
            $('.animated').appear(function() {
                $(this).each(function(){ 
                        var $target =  $(this);
                        var delay = $(this).data('animation-delay');
                        setTimeout(function() {
                            $target.addClass($target.data('animation')).addClass('visible')
                        }, delay);
                });
            });

        },
        masonry: function() {

            var $grid = $('.masonry','#content');

            $grid.masonry({
                columnWidth: '.masonry-sizer',
                itemSelector: '.masonry-item',
                percentPosition: true
            });

            $grid.imagesLoaded().progress(function() {
                $grid.masonry('layout');
            });

            $grid.on('layoutComplete', Waypoint.refreshAll());

        },
        navPrimary: function() {

            var $nav = $('#nav-primary'),
                $toggleItem = $nav.find('.has-dropdown, .has-megamenu').children('a');

            $('[data-toggle="mobile-menu"]').on('click', function() {
                $body.toggleClass('mobile-nav-open');
                $nav.slideToggle(300);

                return false;
            });

            $toggleItem.on('click', function(){

                if($(window).width() < 992) {
                    $(this).next('ul, .megamenu').slideToggle(300);
                }

                return false;
            });

            window.setNavPrimary = function() {
                if($(window).width() >= 992) {
                    $nav.show();
                    $toggleItem.next('ul, .megamenu').each(function(){
                        $(this).show();
                    })
                }
                if($(window).width() < 992) {
                    $nav.hide();
                    $body.removeClass('mobile-nav-open');
                }
            }

        },
        scroller: function() {

            var $header = $('#header');
            var headerHeight = $('#nav-bar').height();
            var $mobileNav = $('#mobile-nav');
            var $section = $('section','#content');
            var scrollOffset = 0;
            scrollOffset = -headerHeight;
            var $scrollers = $('[data-target="local-scroll"]');

            if($body.hasClass('one-page')) $scrollers = $('#header, [data-target="local-scroll"]');

            $scrollers.find('a').on('click', function(){
                $(this).blur();
            });
            $scrollers.localScroll({
                offset: scrollOffset,
                duration: 800,
                easing: 'easeOutCubic'
            });

            var $menuItem = $('#nav-primary li > a');

            var checkMenuItem = function(id) {
                $menuItem.each(function(){
                    var link = $(this).attr('href');
                    if(id==link) $(this).addClass('active');
                    else $(this).removeClass('active');
                });
            }
            $section.waypoint({
                handler: function(direction) {
                    if(direction=='up') {
                        var id = '#'+this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function() {
                    return -this.element.clientHeight+headerHeight;
                }
            });
            $section.waypoint({
                handler: function(direction) {
                    if(direction=='down') {
                        var id = '#'+this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function() {
                    return headerHeight+1;
                }
            });
            $(window).resize(function(){
                setTimeout(function(){
                    Waypoint.refreshAll()
                },600);
            });
        },
        searchBar: function() {
            var $searchBar = $('#search-bar');

            $('[data-toggle="search-bar"]').on('click', function() {
                $('body').toggleClass('search-bar-open');
                return false;
            });
        },
        filter: function() {

            var $filterBar = $('#filter-bar');

            if($('#filter-bar').length > 0) {

                var offsetTop = $filterBar.offset().top,
                    scrolled;

                window.setFilterBar = function() {
                    scrolled = $(window).scrollTop();

                    if(scrolled > offsetTop) {
                        $filterBar.addClass('fixed');
                    }
                    if(scrolled <= offsetTop) {
                        $filterBar.removeClass('fixed');
                    }
                }
         
                var $selector = $filterBar.find('.selector');

                window.setFilterSelector = function() {
                    var $activeFilter = $filterBar.find('.filter li.active');
                    $selector.css({
                        'width': $activeFilter.width()+'px',
                        'left': $activeFilter.offset().left+'px'
                    });
                }

                setFilterSelector(); 

            }

            var $filter = $('.filter'),
                $filterIsotope = $('.filter-isotope'),
                $list,
                filterValue;

            $filterIsotope.each(function(){
                $list = $($(this).data('filter-list'));
                if($list.hasClass('masonry')) {
                    $list.isotope({
                        itemSelector: '.masonry-item',
                        percentPosition: true,
                        masonry: {
                            columnWidth: '.masonry-sizer'
                        }
                    });
                }
                else $list.isotope();
            });

            $filter.on('click', 'a', function(){

                $list = $($(this).parents('.filter').data('filter-list'));
                filterValue = $(this).attr('data-filter');

                $list.children().filter('.not-matched').removeClass('not-matched')
                if(filterValue!="*") $list.children().filter(filterValue).addClass('not-matched')

                $(this).parents('ul').find('.active').removeClass('active');
                $(this).parent('li').addClass('active');

                setFilterSelector(); 

                return false;
            });

            $filterIsotope.on('click', 'a', function(){

                $list = $($(this).parents('.filter-isotope').data('filter-list'));
                filterValue = $(this).attr('data-filter');

                $list.isotope({
                    filter: filterValue
                });

                $(this).parents('ul').find('.active').removeClass('active');
                $(this).parent('li').addClass('active');

                return false;
            });

        },
        map: function() {

            var $googleMap = $('#google-map');

            if($googleMap.length>0) {
                var yourLatitude = $googleMap.data('latitude');   
                var yourLongitude = $googleMap.data('longitude');  
                var pickedStyle = $googleMap.data('style');     
                var dark = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}];
                var light = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];

                var pickedStyle = $googleMap.data('style');   

                var myOptions = {
                    zoom: 14,
                    center: new google.maps.LatLng(yourLatitude,yourLongitude),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    panControl: false,
                    zoomControl: true,
                    scaleControl: false,
                    streetViewControl: false,
                    scrollwheel: false,
                    styles: eval(pickedStyle)
                };

                var map = new google.maps.Map(document.getElementById('google-map'), myOptions);
                var image = pickedStyle == 'dark' ? 'assets/img/location-pin-light.png' : 'assets/img/location-pin.png';
                var myLatLng = new google.maps.LatLng(yourLatitude,yourLongitude);
                var myLocation = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    icon: image
                });
            }

        },
        sidePanel: function() {
            $('[data-toggle="side-panel"]').on('click', function(){
                $body.toggleClass('side-panel-open');
                return false;
            });

            $('.nav-panel a').on('click', function(){
                if($(this).attr('href').indexOf('.html') == -1) {
                    $body.removeClass('side-panel-open');
                    return false;
                }
            })
        },  
    },
    Component: {
        init: function() {  

            this.carousel(); 
            this.counter();
            this.counterdown();
            this.lightbox();
            this.twitterFeed();
            this.forms();
            this.instagramFeed();
            this.videoBox();
        },
        carousel: function() {

            $('.carousel').each(function(){

                var items, singleItem, autoPlay, transition, drag, stopOnHover, navigation, pagination;

                items = $(this).data('items');
                singleItem = $(this).data('single-item');
                autoPlay =  $(this).data('autoplay');
                transition = !$(this).data('transition') ? false : $(this).data('transition');
                pagination = !$(this).data('pagination') ? false : true;
                navigation = !$(this).data('navigation') ? false : true;
                drag = transition=="fade" ? false : true;
                stopOnHover = transition=="fade" || pagination==false || navigation==false ? false : true;

                $(this).owlCarousel({
                    items: items,
                    itemsDesktop: [1199,Math.ceil(items*0.6)], 
                    itemsDesktopSmall: [991,Math.ceil(items*0.5)],
                    itemsTablet: [768,Math.ceil(items*0.4)],
                    itemsMobile: [479,Math.ceil(items*0.2)],
                    singleItem: singleItem,
                    autoPlay: autoPlay,
                    pagination: pagination,
                    navigation: navigation,
                    navigationText: false,
                    slideSpeed: 800,
                    stopOnHover: stopOnHover,
                    transitionStyle: transition,
                    mouseDrag: drag,
                    touchDrag: drag,
                    addClassActive: true
                });

            });
            
        },
        cookiePopup: function() {

            function setCookie(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays*24*60*60*1000));
                var expires = "expires="+d.toUTCString();
                document.cookie = cname + "=" + cvalue + "; " + expires;
            }

            function getCookie(cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for(var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }

            var cookieStatus = getCookie('cookieStatus');

            if(cookieStatus == '') {
                $body.append('<div id="tmp_container"></div>')
                var $tmp = $('#tmp_container');

                $tmp.load('assets/api/cookies-popup.html', function(){

                    $body.append($tmp.html());
                    $tmp.remove();

                    var $cookiePopup = $('#modalCookies');

                    setTimeout(function(){
                        $cookiePopup.modal('show')
                        $body.addClass('modal-at-bottom');
                    }, 1000);

                    $cookiePopup.on('hide.bs.modal', function (e) {
                        setCookie('cookieStatus',true,365);
                        $body.removeClass('modal-at-bottom');
                    });

                });
            }
        },
        counter: function() {
            $('.counter-value').counterUp({
                delay: 10,
                time: 1000
            });
        },
        counterdown: function() {
            $('.countdown').each(function(){

                var date = $(this).data('date'),
                    labels = eval($(this).data('labels'));

                $(this).countdown(date, function(event) {
                    var format = '<span class="time">%H:%M:%S</span>';
                    if(event.offset.days > 0) {
                    format = '<span class="days">%-d <span>' + labels[1] + '</span></span> ' + format;
                        }
                    if(event.offset.weeks > 0) {
                    format = '<span class="weeks">%-w <span>' + labels[0] + '</span></span> ' + format;
                        }
                    $(this).html(event.strftime(format));
                });

            });
        },
        lightbox: function() {
            lightbox.option({
                'disableScrolling': true
            });
        },
        twitterFeed: function() {
            $('.twitter-feed').each(function() {
                var count = $(this).data("count");
                $(this).twittie({
                    apiPath: 'assets/api/twitter/tweet.php',
                    count: count,
                    template: '{{tweet}} - <span class="date">{{date}}</span>'
                });
            });
        },
        typing: function() {
            $('.typing').appear(function(){
                $(this).each(function(){
                    var text = [$(this).html()];
                    $(this).html('');
                    $(this).typed({
                        strings: text,
                        startDelay: 1000,
                        typeSpeed: 30,
                        contentType: 'html'
                    });
                });
            });
        },
        instagramFeed: function(){
            var $instagramFeed = $('#instagram-feed');

            if($instagramFeed.length > 0) {
                var limit =  $instagramFeed.data('limit'),
                    res = $instagramFeed.data('resolution') ? $instagramFeed.data('resolution') : 'thumbnail';
                var feed = new Instafeed({
                    accessToken: '2969283166.1677ed0.e859dad53f0b4f6cab807252cb20a682',
                    userId: '2969283166',
                    get: 'user',
                    target: 'instagram-feed',
                    template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>',
                    limit: limit,
                    resolution: res
                });
                feed.run();
            }
        },
        forms: function(){

            /* Notification Bar */
            var $notificationBar = $('#notification-bar'),
                $notificationClose = $('#notification-bar').find('.close-it');

            var showNotification = function(type,msg) {
                $notificationBar.html('<div class='+type+'>'+msg+'<a href="#" class="close-it"><i class="ti-close"></i></a></div>');
                setTimeout(function(){
                    $notificationBar.addClass('visible');
                }, 400);
                setTimeout(function(){
                    $notificationBar.removeClass('visible');
                }, 10000);
            };

            $body.delegate('#notification-bar .close-it','click', function(){
                closeNotification();
                return false;
            });

            var closeNotification = function() {
                $notificationBar.removeClass('visible');
            }

            /* Validate Form */
            $('.validate-form').each(function(){
                $(this).validate({
                    validClass: 'valid',
                    errorClass: 'error',
                    onfocusout: function(element,event) {
                        $(element).valid();
                    },
                    errorPlacement: function(error,element) {
                        return true;
                    },
                    rules: {
                        email: {
                            required    : true,
                            email       : true
                        }
                    }
                });
            });

            // Sign Up
            var $signUpForm  = $('.sign-up-form');

            if($signUpForm.length>0) {
            
                $signUpForm.submit(function() {
                    var $btn = $(this).find('.btn-submit'),
                        $form = $(this),
                        response,
                        msgSuccess = $(this).data('message-success'),
                        msgError = $(this).data('message-error');

                    if ($form.valid()){
                        $btn.addClass('loading');
                        $.ajax({
                            type: $form.attr('method'),
                            url:  $form.attr('action'),
                            data: $form.serialize(),
                            cache       : false,
                            dataType    : 'jsonp',
                            jsonp: 'c',
                            contentType: "application/json; charset=utf-8",
                            error       : function(err) { setTimeout(function(){ $btn.addClass('error'); }, 1200); },
                            success     : function(data) {
                                if (data.result != "success") {
                                    response = 'error';
                                    showNotification('error',msgError);
                                } else {
                                    response = 'success';
                                    showNotification('success',msgSuccess);
                                }
                                setTimeout(function(){
                                    $btn.addClass(response);
                                }, 400);
                            },
                            complete: function(data) {
                                setTimeout(function(){
                                    $btn.removeClass('loading error success');
                                }, 10000);
                            }
                        });
                        return false;
                    }
                    return false;
                });

            }

            // Contact Form
            var $contactForm  = $('.contact-form');

            if($contactForm.length>0) {

                var $recaptcha = $contactForm.find('.g-recaptcha'),
                    recaptchaValid;
            
                $contactForm.submit(function() {
                    var $btn = $(this).find('.btn-submit'),
                        $form = $(this),
                        response,
                        msgSuccess = $(this).data('message-success'),
                        msgError = $(this).data('message-error');

                    if($recaptcha.length > 0) {
                        if(grecaptcha.getResponse().length != 0) {
                            recaptchaValid = true;
                            $recaptcha.removeClass('error');
                        } else {
                            recaptchaValid = false;
                            $recaptcha.addClass('error');
                            setTimeout(function(){
                                $recaptcha.removeClass('error');
                            },1000);
                        }
                    } else {
                        recaptchaValid = true;
                    }

                    if ($form.valid() && recaptchaValid){
                        $btn.addClass('loading');
                        $.ajax({
                            type: 'POST',
                            url:  'assets/php/contact-form.php',
                            data: $form.serialize(),
                            error       : function(err) { setTimeout(function(){ $btn.addClass('error'); }, 1200); },
                            success     : function(data) {
                                if (data != "success") {
                                    response = 'error';
                                    showNotification('error',msgError);
                                } else {
                                    response = 'success';
                                    showNotification('success',msgSuccess);
                                }
                                setTimeout(function(){
                                    $btn.addClass(response);
                                }, 400);
                            },
                            complete: function(data) {
                                setTimeout(function(){
                                    $btn.removeClass('loading error success');
                                    if($recaptcha.length > 0) {
                                        grecaptcha.reset();
                                    }
                                }, 10000);
                            }
                        });
                        return false;
                    }
                    return false;
                });

            }

        },
        modal: function() {

            $('.modal[data-timeout]').each(function(){
                var timeout = $(this).data('timeout'),
                    $this = $(this);
                setTimeout(function() {
                    $this.modal('show');
                }, timeout)
            });

        },
        videoBox: function() {
            $('.video-box.placeholder-image .btn-play').on('click', function(){
                var video = '<iframe src="' + $(this).attr('href') + '" autoplay="1"></iframe>';
                var $container =  $(this).parents('.video-box');
                $container.addClass('playing');
                var width = $container.outerWidth();
                var height = $container.outerHeight();

                $(this).siblings('.image').html(video);
                $container.find('iframe').css({
                    'width': width + 'px',
                    'height': height + 'px'
                });
                return false;
            });
        }
    }
};

$(document).ready(function (){
    Okno.init();
});

$(document).keyup(function(e) {
    if (e.keyCode == 27) { 
        $body.removeClass('search-bar-open');
    }
});

$(window).scroll(function(){
    setHeader();
    if($('#filter-bar').length > 0) setFilterBar();

});

$(window).resize(function(){
    setNavPrimary();
    if($('#filter-bar').length > 0) setFilterSelector(); 
})

$(window).load(function(){
    Okno.Component.typing();
    $('#page-loader').fadeOut(500, function(){
        Okno.Basic.animations();
        Okno.Component.modal(); 
        if($html.data('cookies-popup') == true) {
            Okno.Component.cookiePopup(); 
        };
    });
});

