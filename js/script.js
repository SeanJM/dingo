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
  swipeEvent: function (options,dingoEvent) {
    var rvalue = false,
        lr,
        ud;
    if (options.htmlEvent === 'mousedown') {
      dingoMouse.swipeEvent[dingoEvent] = {
        x: options.event.pageX,
        y: options.event.pageY
      }
      // A Swipe event only triggers during a certain amount of time
      setTimeout(function () {
        dingoMouse.swipeEvent[dingoEvent] = false;
      },300);
    } else if (options.htmlEvent === 'mouseup') {
      if (dingoMouse.swipeEvent[dingoEvent]) {
        lr     = dingoMouse.swipeEvent[dingoEvent].x-options.event.pageX;
        ud     = dingoMouse.swipeEvent[dingoEvent].y-options.event.pageY;
        rvalue = {
          originX: dingoMouse.swipeEvent[dingoEvent].x,
          originY: dingoMouse.swipeEvent[dingoEvent].y,
          options: options,
          dingo: dingoEvent
        }
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
        x,
        y;
    if (options.htmlEvent === 'mousedown') {
      dingoMouse.dragEvent[dingoEvent] = {
        originX: options.event.pageX,
        originY: options.event.pageY,
        dragstart: false
      }
    } else if (options.htmlEvent === 'mousemove' && dingoMouse.dragEvent[dingoEvent]) {
      if (Math.abs(dingoMouse.dragEvent[dingoEvent].originX-options.event.pageX) > 10 || Math.abs(dingoMouse.dragEvent[dingoEvent].originY-options.event.pageY) > 10) {
        rvalue = {
          originX: dingoMouse.dragEvent[dingoEvent].x,
          originY: dingoMouse.dragEvent[dingoEvent].y,
          pageX: options.event.pageX,
          pageY: options.event.pageY,
          options: options,
          dingo: dingoEvent
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
          originX: dingoMouse.dragEvent[dingoEvent].x,
          originY: dingoMouse.dragEvent[dingoEvent].y,
          pageX: x,
          pageY: y,
          options: options,
          dingo: dingoEvent,
          event: 'dragend'
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

dingo.dragend = {
  'swipe-text': function (options) {
    console.log('drag-end');
  }
}

dingo.dragstart = {
  'swipe-text': function (options) {
    console.log('drag-start');
  }
}

dingo.drag = {
  'swipe-text': function (options) {
    console.log('dragging');
  }
}

dingo.swipeleft = {
  'swipe-text': function (options) {
    console.log('swipeleft');
  }
}

$(function () {
  dingo.init();
});