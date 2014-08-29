/* Version 1.0 */

function getCssProperty(el,property) {
  var arr     = ['','ms','webkit','Moz','O'];
  var style   = window.getComputedStyle(el[0]);
  var r;
  function capitalize(str) {
    return str[0].toUpperCase()+str.substr(1,str.length-1);
  }
  if (style !== null) {
    for (var i=0;i < arr.length;i++) {
      if (arr[i].length < 1) {
        r = property;
      } else {
        r = arr[i]+capitalize(property);
      }
      if (typeof style[r] === 'string') {
        return style[r];
      }
    }
  }
  return false;
}
dingo.sticky = function () {
  var store = [];
  $('.-sticky').each(function () {
    store.push($(this));
  });
  function getRelativeParent(el) {
    var loopEl = el;
    var out = $('body');
    var stop = false;
    var p;
    while (loopEl.parent().size() > 0 && stop === false) {
      loopEl = loopEl.parent();
      p      = getCssProperty(loopEl,'position')||'static';
      if (p.match(/relative|absolute/) !== null) {
        out = loopEl;
        stop = true;
      } else if (loopEl[0].tagName === 'BODY') {
        stop = true;
      }
    }
    return out;
  }
  function sticky(el) {
    var rp = getRelativeParent(el);
    var ow = el.outerWidth(true);
    var pos = $(window).scrollTop()-rp.offset().top;
    if (typeof el[0].stickyInit === 'undefined') {
      el[0].stickyInit = {
        top: el.offset().top,
        left: el.offset().left
      }
    }
    if ($(window).scrollTop() >= el[0].stickyInit.top) {
      el.addClass('_is-sticky');
      el.css('position','absolute');
      el.css('top',pos);
      el.css('left','0');
    } else {
      el.removeClass('_is-sticky');
      el.css('position','');
      el.css('top','');
      el.css('left','');
    }
  }
  function exe() {
    $.each(store,function (i,k) {
      sticky(k);
    });
  }
  if (!dingo.isMobile()) {
    dingo.set('scroll','window','sticky',exe);
    exe();
  }
}
