(function ($) {
    "use strict";
    /* --------------------------------------------
     Page height classes creator 
     --------------------------------------------- */

    function page_height_classes_creator() {
        var minheight = $(window).height();
        var headerhight = $('.navbar').outerHeight(true);
        var hightoutput = minheight - headerhight;
        var half_height = minheight / 2;
        var thirdhaflhight = (hightoutput / 4) * 3.4;
        var thirdhaflcutedhight = (hightoutput / 4) * 0.56;
        var $min_half_height = $(".min_half_height");
        var $thirdhalf_height = $(".thirdhalf_height, .thirdhalf_height .item, .thirdhalf_height  .carousel-item");
        var $halfheight_screen = $(".halfheight_screen, .halfheight_screen  .item, .halfheight_screen  .carousel-item , .halfheight_screen  .horizontal-item");
        var $full_height = $(".full-screen .carousel-item, .full-screen .horizontal-item, .full-screen .item, .full_height");
        var $full_height_minus_header = $(".full-screen-minus-header .carousel-item, .full-screen-minus-header .horizontal-item, .full-screen-minus-header .item");
        var $full_height_minus_header_border = $(".full-screen-minus-header-border .carousel-item, .full-screen-minus-header-border .horizontal-item, .full-screen-minus-header-border .item");

        $min_half_height.css({
            'min-height': minheight / 2,
        });

        $thirdhalf_height.css({
            'height': thirdhaflhight
        });

        $halfheight_screen.css({
            'height': half_height
        });

        $full_height.css({
            'min-height': minheight,
            'height': minheight
        });

        $full_height_minus_header.css({
            'min-height': hightoutput,
            'height': hightoutput
        });

        $full_height_minus_header_border.css({
            'min-height': hightoutput - 42,
            'height': hightoutput - 42
        });
    }

    /* --------------------------------------------
     Nav Menu
     --------------------------------------------- */
    function et_nav_menu() {
        // Make multi level bootstrap menu
        $('.navbar  a.dropdown-toggle').on('click', function (e) {
            var $el = $(this);
            var $parent = $el.offsetParent(".dropdown-menu");
            if (!$el.offsetParent(".dropdown-menu").hasClass('mega_menu')) {
                $el.parent("li").toggleClass('show');
                if (!$parent.parent().hasClass('navbar-nav')) {
                    if (!$el.parent().hasClass('mega_menu_holder') && !$("nav").hasClass("sidebar-nav")) {
                        $el.next().css({
                            "top": $el[0].offsetTop,
                            "left": $parent.outerWidth() - 4
                        });
                    }
                }
            }
            $('.nav li.show').not($(this).parents("li")).removeClass("show");
            return false;
        });
        // Add current class to active menu's item 
        var links = $('.navbar a');
        $.each(links, function (key, va) {
            if (va.href === document.URL) {
                $(this).parents('li').addClass('current');
            }
        });

        // toggle classes on click menu btn
        jQuery(".hamburger-menu-btn").on('click', function (e) {
            //For hamburger-menu-btn
            jQuery(this).toggleClass("is-active");
            //For fullscreen-menu-holder
            var elm_fullscreen_menu_holder = $('.fullscreen-menu-holder');
            jQuery(elm_fullscreen_menu_holder).toggleClass("is-active");
            //For sidebar-nav
            var elm_sidebar_nav = $('.sidebar-nav');
            jQuery(elm_sidebar_nav).toggleClass("is-active");
        });

        // Sidebar Menu
        $.sidebarMenu = function (menu) {
            var animationSpeed = 300,
                subMenuSelector = '.sidebar-submenu';

            $(menu).on('click', 'li a', function (e) {
                var $this = $(this);
                var checkElement = $this.next();

                if (checkElement.is(subMenuSelector) && checkElement.is(':visible')) {
                    checkElement.slideUp(animationSpeed, function () {
                        checkElement.removeClass('menu-open');
                    });
                    checkElement.parent("li").removeClass("active");
                }

                //If the menu is not visible
                else if ((checkElement.is(subMenuSelector)) && (!checkElement.is(':visible'))) {
                    //Get the parent menu
                    var parent = $this.parents('ul').first();
                    //Close all open menus within the parent
                    var ul = parent.find('ul:visible').slideUp(animationSpeed);
                    //Remove the menu-open class from the parent
                    ul.removeClass('menu-open');
                    //Get the parent li
                    var parent_li = $this.parent("li");

                    //Open the target menu and add the menu-open class
                    checkElement.slideDown(animationSpeed, function () {
                        //Add the class active to the parent li
                        checkElement.addClass('menu-open');
                        parent.find('li.active').removeClass('active');
                        parent_li.addClass('active');
                    });
                }
                //if this isn't a link, prevent the page from being redirected
                if (checkElement.is(subMenuSelector)) {
                    e.preventDefault();
                }
            });
        }
        $.sidebarMenu($('.sidebar-menu'))
    }
    /* --------------------------------------------
     Sticky header
     --------------------------------------------- */

    function sticky_header() {
        var $navbar = $("nav.navbar");
        var $body = $('body');
        var $fixed_top = $('.fixed-top');
        var $center_header = $('.center_header');
        var $top_header = $('.top_header');
        if (!$navbar.hasClass("sideheader")) {
            if ($navbar.hasClass("fixed-top")) {
                var stickyNavTop = $fixed_top.offset().top;
                if ($navbar.hasClass($center_header)) {

                } else if ($navbar.hasClass($center_header)) {
                    var menu = document.querySelector($fixed_top);
                    var menuPosition = menu.getBoundingClientRect();
                    var placeholder = document.createElement('div');
                    placeholder.style.width = menuPosition.width + 'px';
                    placeholder.style.height = menuPosition.height + 'px';
                    menu.parentNode.insertBefore(placeholder, menu);

                } else {
                    var menu = document.querySelector($fixed_top);
                    var menuPosition = menu.getBoundingClientRect();
                    var bodymarginforheader = menuPosition.height + 'px';
                    $body.css("margin-top", bodymarginforheader);
                }

                var stickyNav = function () {
                    var scrollTop = $(window).scrollTop();

                    if ($navbar.hasClass($center_header)) {

                        var fromtop = 0;
                        if ($top_header.length) {
                            var fromtop = $top_header.outerHeight();
                        }
                        $fixed_top.css({
                            top: fromtop + 'px'
                        });

                        if (scrollTop > stickyNavTop + 700) {

                            $fixed_top.css({
                                top: '0px'
                            });
                            $fixed_top.addClass('sticky_header_runing');
                        } else {
                            $fixed_top.removeClass('sticky_header_runing');

                        }
                    } else {

                        if (scrollTop > stickyNavTop) {
                            $fixed_top.addClass('sticky_header_runing');
                        } else {
                            $fixed_top.removeClass('sticky_header_runing');
                        }
                    }

                };

                stickyNav();
                $(window).scroll(function () {
                    stickyNav();
                });
            }
        }
    }

    /* --------------------------------------------
     owl carousel calling function
     --------------------------------------------- */
    function owl_main_carousel() {
        if ($('#main-carousel').length) {
            var owl = $("#main-carousel");
            owl.owlCarousel({
                nav: false, // Show next and prev buttons 
                smartSpeed: 1100,
                dotsSpeed: 1000,
                dragEndSpeed: 1000,
                singleItem: true,
                pagination: false,
                items: 1,
                autoplay: false,
                autoplayTimeout: 5000,
                autoplayHoverPause: true,
                loop: true,
                afterAction: function (el) {
                    //remove class active
                    this
                        .$owlItems
                        .removeClass('active')

                    //add class active
                    this
                        .$owlItems //owl internal $ object containing items
                        .eq(this.currentItem + 1)
                        .addClass('active')
                }
            });
        }
    }


    function owl_main_carousel_two() {
        if ($('#main-carousel_two').length) {
            var owl = $("#main-carousel_two");
            if (owl.length) {
                owl.owlCarousel({
                    nav: false, // Show next and prev buttons
                    smartSpeed: 1000,
                    dotsSpeed: 1000,
                    dragEndSpeed: 1000,
                    singleItem: true,
                    items: 1,
                });
            }
        }
    }

    function owl_second_carousel() {
        if ($('#second_carousel').length) {
            var owl = $("#second_carousel");
            if (owl.length) {
                owl.owlCarousel({
                    nav: false, // Show next and prev buttons
                    smartSpeed: 1000,
                    dotsSpeed: 1000,
                    items: 1,
                });
            }
        }
    }

    function owl_loop_carousel() {
        var owl = $('#loop_carousel');
        if (owl.length) {
            owl.owlCarousel({
                items: 5,
                margin: 50,
                autoplay: true,
                loop: true,
                itemsDesktop: [1000, 5],
                itemsDesktopSmall: [900, 3],
                itemsTablet: [600, 2],
                nav: false,
                dots: false,
                itemsMobile: false

            });

        }
    }


    function imgAsB_fix() {
        if (document.documentMode || /Edge/.test(navigator.userAgent)) {
            $bg_image = $('.bg-image');
            $bg_image.each(function () {
                var $container = $(this),
                    imgUrl = $container.find('img').prop('src');
                if (imgUrl) {
                    $container
                        .css('backgroundImage', 'url(' + imgUrl + ')')
                        .addClass('compat-object-fit')
                        .children('img').hide();
                }
            });
        }
    }

    /* --------------------------------------------
       Isotope  calling function
    --------------------------------------------- */

    function Isotope_masonry_layout() {
        var $masonry_layout = $('.masonry_layout');
        if ($masonry_layout.length) {
            // init Isotope
            var $grid = $masonry_layout.isotope({
                percentPosition: true,
                hiddenStyle: {
                    opacity: 0,
                    transform: 'scale(0.001)'
                },
                visibleStyle: {
                    opacity: 1,
                    transform: 'scale(1)'
                },
                transitionDuration: '0.6s',
                masonry: {}
            });
            // Isotope filter
            var $work_filter = $('.work_filter');
            var $work_filter_span = $('.work_filter li span');
            $work_filter_span.on('click', function () {
                var $this = $(this);
                var filterValue = $this.attr('data-filter');
                $work_filter.find('.filter_active').removeClass('filter_active');
                $this.addClass('filter_active');
                $grid.isotope({
                    filter: filterValue
                });
            });

            
            // layout Isotope after each image loads
            $grid.imagesLoaded().progress(function () {
                $grid.isotope('layout');
            });
        }
    }

    /* --------------------------------------------
     Number Counter 
     --------------------------------------------- */

    function countToNumber() {
        var $timer = $('.timer');
        if ($timer.length) {
            $timer.countTo();
        }
    }

    // /* --------------------------------------------
    //   Countdown
    // --------------------------------------------- */
    // function et_countdown() {
    //     var $getting_started = $('#getting-started');
    //     if ($getting_started.length) {
    //         var $date = new Date(new Date().valueOf() + 30 * 24 * 60 * 60 * 1000);
    //         $getting_started.countdown("08/09/2019 7:30:00", function (event) {
    //             $(this).html(event.strftime('<span class="countdown_value"> %d <span class="countdown_lable"> Days </span> </span> <span class="countdown_value"> %H <span class="countdown_lable"> Hours </span></span> <span class="countdown_value"> %M <span class="countdown_lable"> Minutes </span></span> <span class="countdown_value"> %S <span class="countdown_lable"> Seconds </span></span>'));
    //         })
    //         .on('finish.countdown', function(event){
    //             location.href = '/bid/profile'
    //         });
    //     }
    // }

    /* --------------------------------------------
      Magnific Popup
    --------------------------------------------- */
    function popup_gallery_int() {
        var $popup_gallery = $('.popup_gallery');
        if ($popup_gallery.length) {
            $popup_gallery.magnificPopup({
                delegate: 'img',
                type: 'image',
                mainClass: 'mfp-with-zoom mfp-img-mobile',
                fixedContentPos: false,
                gallery: {
                    enabled: true
                },
                zoom: {
                    enabled: true,
                    duration: 300, // don't foget to change the duration also in CSS
                },
                callbacks: {
                    elementParse: function (qw) {
                        qw.src = qw.el.attr('src');
                    }
                }
            });
        }
        // For video popup (PLAY VIDEO TRIGGER)
        var $video_play_trigger = $('.play-trigger, #play-trigger');
        if ($video_play_trigger.length) {
            $video_play_trigger.magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-with-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        };

    }


    /* --------------------------------------------
      Instagram feed
    --------------------------------------------- */
    function Instafeed_int() {
        var $instagramfeed = $('#instagramfeed');
        if ($instagramfeed.length) {
            var feed = new Instafeed({
                get: 'user',
                userId: '15920822',
                accessToken: '2079611912.3a81a9f.09ac20a0430f470f8b6a2e652716e1db',
                target: 'instagramfeed',
                limit: 6,
                resolution: 'low_resolution',
                template: '<li class="col-2"><a href="{{link}}"><img src="{{image}}" /></a></li>'
            });
            feed.run();
        }
    }

    /* --------------------------------------------
      Element Animate effect
    --------------------------------------------- */

    function et_animate_item() {
        AOS.init({
            offset: 100,
            duration: 600,
            easing: 'linear',
            once: true,
        });
    }

    /* ---------------------------------------------
     Scripts initialization
     --------------------------------------------- */

    $(window).on('load', function () {
        "use strict"; // Start of use strict
        Isotope_masonry_layout();
    });

    $(document).ready(function () {
        "use strict"; // Start of use strict  

        $(".fit").fitVids();
        owl_main_carousel();
        owl_main_carousel_two();
        owl_second_carousel();
        owl_loop_carousel();
        imgAsB_fix();
        popup_gallery_int();
        countToNumber();
        // et_countdown();
        et_nav_menu();
        et_animate_item();
        Instafeed_int();
        sticky_header();
    });

    /* ---------------------------------------------
     On resize calling function
     --------------------------------------------- */
    $(window).on('resize', function () {
        "use strict"; // Start of use strict
        page_height_classes_creator();

    }).trigger('resize');

    /* ---------------------------------------------
    Dynamic Page Replacing or loading - AJAX
    --------------------------------------------- */
    // if ($.fn.smoothState) {
    //     $(function () {
    //         'use strict';
    //         var $body = $('body');
    //         var $main_content = $('#main-content');

    //         function addBlacklistClass() {
    //             $('a').each(function () {
    //                 if (this.href.indexOf('/wp-admin/') !== -1 ||
    //                     this.href.indexOf('/wp-login.php') !== -1) {
    //                     $(this).addClass('wp-link');
    //                 }
    //             });
    //         }
    //         addBlacklistClass();

    //         var options = {
    //             anchors: 'a',
    //             blacklist: '.no-smoothState, .send_btn, .ajax_add_to_cart, .add_to_cart_button, .woocommerce a, .woocommerce .input[type="submit"], .woocommerce .cart .button, .woocommerce .cart input.button, .woocommerce input[type="submit"], .wp-link,form, form button',
    //             prefetch: true,
    //             cacheLength: 2,
    //             scroll: true,

    //             onStart: {
    //                 duration: 250, // Duration of our animation
    //                 render: function ($container) {
    //                     // Add your CSS animation reversing class
    //                     $container.addClass('is-exiting');
    //                     // Restart your animation
    //                     smoothState.restartCSSAnimations();
    //                 }
    //             },
    //             onReady: {
    //                 duration: 0,
    //                 render: function ($container, $newContent) {
    //                     // Remove your CSS animation reversing class
    //                     $container.removeClass('is-exiting');
    //                     // Inject the new content
    //                     $container.html($newContent);

    //                     var url = smoothState.href // <-- get the current url
    //                     var doc = smoothState.cache[url].doc // <-- full html response
    //                     var $html = $.htmlDoc(doc)

    //                     var body_Id = $html.find('body').attr('id');
    //                     var body_Classes = $html.find('body').attr('class');
    //                     var body_CSS = $html.find('body').attr('style');

    //                     // Update body ID, classes and style
    //                     $body.removeClass().addClass(body_Classes);
    //                     $body.attr('id', body_Id);
    //                     $body.attr('style', body_CSS);
    //                 }
    //             },
    //             onAfter: function ($container, $newContent) {
    //                 // Trigger document.ready and window.load
    //                 $(".fit").fitVids();
    //                 owl_main_carousel();
    //                 owl_main_carousel_two();
    //                 owl_second_carousel();
    //                 owl_loop_carousel();
    //                 imgAsB_fix();
    //                 Isotope_masonry_layout();
    //                 popup_gallery_int();
    //                 countToNumber();
    //                 // et_countdown();
    //                 et_nav_menu();
    //                 et_animate_item();
    //                 if ($("#instagramfeed").length) {
    //                     Instafeed_int();
    //                 }
    //                 page_height_classes_creator();
    //                 sticky_header();

    //             }

    //         },

    //             smoothState = $main_content.smoothState(options).data('smoothState');
    //     });
    // }

})(jQuery)