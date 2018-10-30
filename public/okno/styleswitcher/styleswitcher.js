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

var firstSSOpen = false;

$(document).ready(function() {

	$('head').append('<link rel="stylesheet" type="text/css" href="assets/styleswitcher/styleswitcher.css">');
	$('body').append('<div id="style-switcher"></div>');

	$('#style-switcher').load( "assets/styleswitcher/styleswitcher.html", function(){

		var currentLocation = window.location.href;
		currentLocation = currentLocation.split('/');
		currentLocation = currentLocation[currentLocation.length-1];

		var activeStyle = getCookie('style');

		function setStyleCookie() {
			activeStyle = $('#theme').attr("href").substring(24); 
			activeStyle = activeStyle.substring(0,activeStyle.length-4); 
	        setCookie("style", activeStyle, 365);
		}

	    if (activeStyle == "") {
	        setStyleCookie();
	    } else if (currentLocation == "") {
	    	setStyleCookie();
	    } else if (currentLocation.indexOf('index') != -1) {
	    	setStyleCookie();
	    } else {
	    	$('#theme').attr('href','assets/css/themes/theme-'+activeStyle+'.css');
            preLoadStyles();
	    }

		var $themeSwitcher = $('#theme-switcher');

		$themeSwitcher.find('li').each(function() {
	        if($(this).data('scheme')==activeStyle) $(this).addClass('active');
	    });
		
		$themeSwitcher.find('li').on('click', function(){
			var scheme = $(this).data('scheme');
			$('#theme').attr('href','assets/css/themes/theme-'+scheme+'.css');

			setCookie("style", scheme, 365);
			
			$themeSwitcher.find('li.active').removeClass('active');
			$(this).addClass('active');

			return false;
		});

		$('#switcher-toggle').on('click', function(){
			if (!firstSSOpen) preLoadStyles();
			$('#style-switcher').toggleClass('visible');
			firstSSOpen = true;
			return false;
		});

	});
    
	function preLoadStyles() {
		if ($("link[href='https://fonts.googleapis.com/css?family=Open+Sans:400,700,300,600']")) $('head').append("<link href='https://fonts.googleapis.com/css?family=Raleway:400,200,300,100,500,600,700' rel='stylesheet' type='text/css'>");
		else $('head').append("<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700,300,600' rel='stylesheet' type='text/css'>");
	}

});
