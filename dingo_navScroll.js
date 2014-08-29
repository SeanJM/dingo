/* Version 1.0.1 */

dingo.navScroll = function () {
  var navScroll = {};

  navScroll.clickDelay = function() {
    $('body').addClass('click-delay');
    setTimeout(function () {
      $('body').removeClass('click-delay');
    },400);
  }

  navScroll.sticky = function () {
    var nav = $('#nav');
    var navBottom = nav.outerHeight(true)+nav.offset().top;
    function sticky() {
      if ($(window).scrollTop() > navBottom) {
        $('body').addClass('-nav-sticky');
      } else {
        $('body').removeClass('-nav-sticky');
      }
    }
    dingo.set('scroll','window','navScroll',sticky);
    sticky();
  }

  navScroll.color = function () {
    var navControl = $('#nav-control');
    var body = $('body');
    var colors = [];
    function setColor() {
      var top = $(window).scrollTop();
      var color = '-navColor-init';
      var navColorClass;
      var elTop;
      var elHeight;
      var classTemp = body.attr('class')||'';
      for (var i=0;i<colors.length;i++) {
        elTop    = colors[i].el.offset().top;
        elHeight = colors[i].el.outerHeight();
        if (top >= elTop && top <= elTop+elHeight) {
          color = '-navColor-' + colors[i].color;
        }
      }
      if (classTemp.match(/-navColor-[a-zA-Z]+/) !== null) {
        navColorClass = classTemp.replace(/-navColor-[a-zA-Z]+/,color);
      } else {
        navColorClass = classTemp + ' ' + color;
      }
      body.attr('class',$.trim(navColorClass));
    }
    $('[class*="navColor_"]').each(function () {
      var el = $(this);
      var color = el.attr('class').match(/navColor_([a-zA-Z]+)/)[1];
      colors.push({
        el: el,
        color: color
      });
    });
    dingo.set('touchmove','body','navScroll',setColor);
    dingo.set('scroll','window','navScroll',setColor);
    setColor();
  }
  
  if (dingo.isMobile()) {
    navScroll.color();
  } else {
    navScroll.sticky();
  }
}