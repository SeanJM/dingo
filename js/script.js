var dingoMouse = {};
var dingo = {
  isMobile: function () {
    return ($(window).width() <= 400);
    return (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) ? true : false;
  },
  htmlEvents: function () {
    if (dingo.isMobile()) {
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress'];
    } else {
      return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress'];
    }
  },
  is: function (k,dingoEvent) {
    return (typeof dingo[k] === 'object' && typeof dingo[k][dingoEvent] === 'function');
  },
  toJs: function (options) {
    var match = options.dingo.match(/([a-zA-Z0-9_-]+)(?:\s+|)(\{([\s\S]*?)\}|)/);
    var options = {el:options.el,event: options.event,dingo: match[1]};

    if (typeof match[3] === 'string') {
      $.each(match[3].split(';'),function (i,k) {
        var _match = k.match(/([a-zA-Z0-9_-]+):([\s\S]*?)$/);
        options[_match[1]] = _match[2];
      });
    }

    return { dingoEvent: match[1], data: options };
  },
  swipe: function (options,dingo) {
    var rvalue;
    var lr;
    var ud;
    if (options.htmlEvent === 'mousedown') {
      dingoMouse[dingo] = {
        x: options.event.pageX,
        y: options.event.pageY
      }
      rvalue = false;
    } else if (options.htmlEvent === 'mouseup') {
      lr     = dingoMouse[dingo].x-options.event.pageX;
      ud     = dingoMouse[dingo].y-options.event.pageY;
      rvalue = {
        originX: dingoMouse[dingo].x,
        originY: dingoMouse[dingo].y,
        options: options,
        dingo: dingo
      }
      if (Math.abs(lr) > Math.abs(ud) && Math.abs(lr) > 44) {
        // Left or Right
        if (lr > 0) {
          rvalue.direction = 'swipeleft';
        } else {
          rvalue.direction = 'swiperight';
        }
      } else if (Math.abs(ud) > 44) {
        // Up and Down
        if (ud > 0) {
          rvalue.direction = 'swipeup';
        } else {
          rvalue.direction = 'swipedown';
        }
      } else {
        rvalue = false;
      }
    }
    return rvalue;
  },
  exe: function (options) {
    var dingos = options.el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[\s\S]*?\}|)/g);
    var chain  = [];
    var swipe;
    var dingoEvent;

    $.each(dingos,function (i,k) {
      chain.push(dingo.toJs({dingo: k,el: options.el,event: options.event}));
    });

    $.each(chain,function (i,k) {
      dingoEvent = k.dingoEvent;
      swipe      = dingo.swipe(options,dingoEvent);

      if (dingo.is(options.htmlEvent,dingoEvent)) {
        dingo[options.htmlEvent][dingoEvent](k.data);
      }
      if (swipe && dingo.is(swipe.direction,dingoEvent)) {
        dingo[swipe.direction][dingoEvent](k.data);
      }
    });

  },
  init: function (el) {
    dingo.on($('[data-dingo]'));
  },
  on: function (el) {
    $.each(dingo.htmlEvents(),function (i,htmlEvent) {
      el.on(htmlEvent,function (event) {
        dingo.exe({htmlEvent:htmlEvent,el:$(this),event: event});
      });
    });
  }
}

$(function () {
  dingo.init();
});