/* MIT License */
// Coded by Sean MacIsaac
// seanjmacisaac@gmail.com

var dingoMouse = {};
var dingo = {
  isMobile: function () {
    //return ($(window).width() <= 400);
    return (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) ? true : false;
  },
  htmlEvents: function () {
    if (dingo.isMobile()) {
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress','change'];
    } else {
      return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress','change'];
    }
  },
  is: function (k,dingoEvent) {
    return (typeof dingo[k] === 'object' && typeof dingo[k][dingoEvent] === 'function');
  },
  toJs: function (options) {
    var match = options.dingo.match(/([a-zA-Z0-9_-]+)(?:\s+|)(\{([^}]*)\}|)/);
    var options = {el:options.el,event: options.event,dingo: match[1]};

    if (typeof match[3] === 'string' && match[3].length > 0) {
      $.each(match[3].split(';'),function (i,k) {
        var _match = k.match(/([a-zA-Z0-9_-]+):([^}]*)/);
        _match[2]  = _match[2].replace(/^\s+|\s+$/g,'');

        if (_match[2] === 'true') {
          _match[2] = true;
        } else if (_match[2] === 'false') {
          _match[2] = false;
        }

        options[_match[1]] = _match[2];
      });
    }

    return { dingoEvent: match[1], data: options };
  },
  swipeEvent: function (options,dingoEvent) {
    var rvalue = false,
        pageX  = (dingo.isMobile())?options.event.changedTouches[0].pageX:options.event.pageX,
        pageY  = (dingo.isMobile())?options.event.changedTouches[0].pageY:options.event.pageY,
        lr,
        ud;
    if (options.htmlEvent === 'mousedown') {
      dingoMouse.swipeEvent[dingoEvent] = {
        x: pageX,
        y: pageY
      }
      // A Swipe event only triggers during a certain amount of time
      setTimeout(function () {
        dingoMouse.swipeEvent[dingoEvent] = false;
      },300);
    } else if (options.htmlEvent === 'mouseup') {
      if (dingoMouse.swipeEvent[dingoEvent]) {
        rvalue = {
          options : options,
          dingo   : dingoEvent,
          originX : dingoMouse.swipeEvent[dingoEvent].x,
          originY : dingoMouse.swipeEvent[dingoEvent].y
        }
        lr = dingoMouse.swipeEvent[dingoEvent].x-pageX;
        ud = dingoMouse.swipeEvent[dingoEvent].y-pageY;
        if (Math.abs(lr) > Math.abs(ud) && Math.abs(lr) > 44) {
          // Left or Right
          if (lr > 0) {
            rvalue.event = 'swipeleft';
          } else {
            rvalue.event = 'swiperight';
          }
        } else if (Math.abs(ud) > 44) {
          // Up or Down
          if (ud > 0) {
            rvalue.event = 'swipeup';
          } else {
            rvalue.event = 'swipedown';
          }
        } else {
          rvalue = false;
        }
      }
    }
    return rvalue;
  },
  dragEvent: function (options,dingoEvent) {
    var rvalue = false,
        pageX  = (dingo.isMobile())?options.event.changedTouches[0].pageX:options.event.pageX,
        pageY  = (dingo.isMobile())?options.event.changedTouches[0].pageY:options.event.pageY;

    if (options.htmlEvent === 'mousedown') {
      dingoMouse.dragEvent[dingoEvent] = {
        originX: pageX,
        originY: pageY,
        dragstart: false
      }
    } else if (options.htmlEvent === 'mousemove' && dingoMouse.dragEvent[dingoEvent]) {
      if (Math.abs(dingoMouse.dragEvent[dingoEvent].originX-pageX) > 10 || Math.abs(dingoMouse.dragEvent[dingoEvent].originY-pageY) > 10) {
        rvalue = {
          originX : dingoMouse.dragEvent[dingoEvent].x,
          originY : dingoMouse.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent
        }
        if (dingoMouse.dragEvent[dingoEvent].dragstart) {
          rvalue.event = 'drag';
        } else {
          rvalue.event = 'dragstart';
          dingoMouse.dragEvent[dingoEvent].dragstart = true;
        }
      } else {
        rvalue = false;
      }
    } else if (options.htmlEvent === 'mouseup') {
      if (dingoMouse.dragEvent[dingoEvent].dragstart) {
        rvalue = {
          originX : dingoMouse.dragEvent[dingoEvent].x,
          originY : dingoMouse.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent,
          event   : 'dragend'
        }
        dingoMouse.dragEvent[dingoEvent] = false;
      }
    }
    return rvalue;
  },
  exe: function (options) {
    var dingos = options.el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[\s\S]*?\}|)/g);
    var chain  = [];
    var swipe;
    var drag;
    var dingoEvent;

    $.each(dingos,function (i,k) {
      chain.push(dingo.toJs({dingo: k,el: options.el,event: options.event}));
    });

    $.each(chain,function (i,k) {
      dingoEvent = k.dingoEvent;
      swipe      = dingo.swipeEvent(options,dingoEvent);
      drag       = dingo.dragEvent(options,dingoEvent);

      if (dingo.is(options.htmlEvent,dingoEvent)) {
        dingo[options.htmlEvent][dingoEvent](k.data);
      }
      if (swipe && dingo.is(swipe.event,dingoEvent)) {
        dingo[swipe.event][dingoEvent](k.data);
      }
      if (drag && dingo.is(drag.event,dingoEvent)) {
        dingo[drag.event][dingoEvent](k.data);
      }
    });
  },
  init: function (el) {
    dingoMouse.swipeEvent = {};
    dingoMouse.dragEvent = {};
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