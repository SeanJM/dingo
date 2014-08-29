/* Version 1.0 */

dingo.animateScroll = function () {
  var store = [];
  function exe() {
    var bottom = $(window).scrollTop()+$(window).height();
    function getTop(el) {
      // The larger it is the closer it gets to 0.0
      // 0 = anything equal to or larger than the window height
      // EG: 900-30/900
      var elHeight  = el.outerHeight(true);
      var winHeight = $(window).height();
      var ratio     = (elHeight/winHeight);
      var q         = 1-(elHeight/winHeight);
      if (ratio < 0.2) {
        return (el.offset().top+elHeight*q);
      } else {
        return (el.offset().top+elHeight*0.15);
      }
    }
    $.each(store,function (i,k) {
      if (bottom > getTop(k)) {
        animate(k).start();
      } else if (animate(k).animatedIn()) {
        animate(k).end();
      }
    });
  }
  $('[class*="animate-scroll"]').each(function (i,k) {
    store.push($(this));
  });
  if (!dingo.isMobile()) {
    dingo.set('scroll','window','scrollAnimate',exe);
  } else {
    dingo.set('touchmove','body','scrollAnimate',exe);
  }
  exe();
}