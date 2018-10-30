(function($) {
var opt;

$.fn.printThis = function (options) {
    opt = $.extend({}, $.fn.printThis.defaults, options);

    var $element = (this instanceof jQuery) ? this : $(this);


    var strFrameName = ("printThis-" + (new Date()).getTime());
    
        var $iframe = $("<iframe id='" + strFrameName +"' src='about:blank'/>");

        if (!opt.debug) { $iframe.css({ position: "absolute", width: "0px", height: "0px", left: "-600px", top: "-600px" }); }

        $iframe.appendTo("body");
    
        var $doc = $("#" + strFrameName).contents();
    
// allow iframe to fully render before action
setTimeout ( function () {
    
    // import page css
    if (opt.importCSS)
    {
            $("link[rel=stylesheet]").each(function(){
            var href = $(this).attr('href');
            if(href){
                    var media = $(this).attr('media') || 'all';
                    $doc.find("head").append("<link type='text/css' rel='stylesheet' href='" + href + "' media='"+media+"'>");
                }
    });
    }
    
    // add another stylesheet
    if (opt.loadCSS)
    {
    $doc.find("head").append("<link type='text/css' rel='stylesheet' href='" + opt.loadCSS + "'>");
    
    }
    
    //grab outer container
    if (opt.printContainer) { $doc.find("body").append($element.outer()); }
    else { $element.each( function() { $doc.find("body").append($(this).html()); }); }

    //$doc.close();
    // print
    
    setTimeout( function() { 
        ($iframe[0].contentWindow).print(); 
        
    }, 1000);
    
    //removed iframe after 60 seconds
    setTimeout(
    function(){
    $iframe.remove();
    },
    (60 * 1000)
    );
}, 333 );
}


$.fn.printThis.defaults = {
    debug: false, //show the iframe for debugging
    importCSS: true, // import page CSS
    printContainer: true, // grab outer container as well as the contents of the selector
    loadCSS: "" //path to additional css file
};


jQuery.fn.outer = function() {
return $($('<div></div>').html(this.clone())).html();
}
})(jQuery);