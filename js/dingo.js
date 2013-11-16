// Dingo Version 1.1.2
// MIT License
// Coded by Sean MacIsaac
// seanjmacisaac@gmail.com

var dingoStore = {};
var dingo = {
  isMobile: function () {
    //return ($(window).width() <= 400);
    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) {
      return true;
    } else {
      return false;
    }
  },
  htmlEvents: function () {
    if (dingo.isMobile()) {
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress','change','focus','blur'];
    } else {
      return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress','change','focus','blur'];
    }
  },
  is: function (k,dingoEvent) {
    return (typeof dingo[k] === 'object' && typeof dingo[k][dingoEvent] === 'function');
  },
  get: function (el,event) {
    event      = event||'';
    var dingos = el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[^}]*?\}|)/g);
    var chain  = [];

    $.each(dingos,function (i,k) {
      chain.push(dingo.toJs({dingo: k,el: el,event: event}));
    });
    return chain;
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
  getMouse: function (event) {
    var x = 0,
        y = 0;
    function init() {
      if (typeof event.originalEvent.changedTouches !== 'undefined') {
        x = event.originalEvent.changedTouches[0].pageX||0;
        y = event.originalEvent.changedTouches[0].pageY||0;
      } return {
        pageX: x,
        pageY: y
      }
    }
    if (dingo.isMobile()) {
      return init();
    } else {
      return event;
    }
  },
  uniMouse: function (event) {
    return {
      mousedown  : 'down',
      touchstart : 'down',
      mouseup    : 'up',
      touchend   : 'up',
      mousemove  : 'move',
      touchmove  : 'move'
    }[event];
  },
  swipeEvent: function (options,dingoEvent) {
    var rvalue = false,
        pageX  = dingo.getMouse(options.event).pageX,
        pageY  = dingo.getMouse(options.event).pageY,
        lr,
        ud;
    if (dingo.uniMouse(options.htmlEvent) === 'down') {
      dingoStore.swipeEvent[dingoEvent] = {
        x: pageX,
        y: pageY
      }
      // A Swipe event only triggers during a certain amount of time
      setTimeout(function () {
        dingoStore.swipeEvent[dingoEvent] = false;
      },300);
    } else if (dingo.uniMouse(options.htmlEvent) === 'up') {
      if (dingoStore.swipeEvent[dingoEvent]) {
        rvalue = {
          options : options,
          dingo   : dingoEvent,
          originX : dingoStore.swipeEvent[dingoEvent].x,
          originY : dingoStore.swipeEvent[dingoEvent].y
        }
        lr = dingoStore.swipeEvent[dingoEvent].x-pageX;
        ud = dingoStore.swipeEvent[dingoEvent].y-pageY;
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
        pageX  = dingo.getMouse(options.event).pageX,
        pageY  = dingo.getMouse(options.event).pageY;

    if (dingo.uniMouse(options.htmlEvent) === 'down') {
      dingoStore.dragEvent[dingoEvent] = {
        originX: pageX,
        originY: pageY,
        dragstart: false
      }
    } else if (dingo.uniMouse(options.htmlEvent) === 'move' && dingoStore.dragEvent[dingoEvent]) {
      if (Math.abs(dingoStore.dragEvent[dingoEvent].originX-pageX) > 10 || Math.abs(dingoStore.dragEvent[dingoEvent].originY-pageY) > 10) {
        rvalue = {
          originX : dingoStore.dragEvent[dingoEvent].x,
          originY : dingoStore.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent
        }
        if (dingoStore.dragEvent[dingoEvent].dragstart) {
          rvalue.event = 'drag';
        } else {
          rvalue.event = 'dragstart';
          dingoStore.dragEvent[dingoEvent].dragstart = true;
        }
      } else {
        rvalue = false;
      }
    } else if (dingo.uniMouse(options.htmlEvent) === 'up') {
      if (dingoStore.dragEvent[dingoEvent].dragstart) {
        rvalue = {
          originX : dingoStore.dragEvent[dingoEvent].x,
          originY : dingoStore.dragEvent[dingoEvent].y,
          pageX   : pageX,
          pageY   : pageY,
          options : options,
          dingo   : dingoEvent,
          event   : 'dragend'
        }
        dingoStore.dragEvent[dingoEvent] = false;
      }
    }
    return rvalue;
  },
  exe: function (options) {
    var chain   = dingo.get(options.el,options.event);
    var tagname = options.el[0].tagName.toLowerCase();

    function mouseEvents(data,dingoEvent) {
      var swipe = dingo.swipeEvent(options,dingoEvent);
      var drag  = dingo.dragEvent(options,dingoEvent);

      if (swipe && dingo.is(swipe.event,dingoEvent)) {
        dingo[swipe.event][dingoEvent](data);
      }
      if (drag && dingo.is(drag.event,dingoEvent)) {
        dingo[drag.event][dingoEvent](data);
      }
      if (dingo.is(options.htmlEvent,dingoEvent)) {
        dingo[options.htmlEvent][dingoEvent](data);
      }
    }

    $.each(chain,function (i,k) {
      mouseEvents(k.data,k.dingoEvent);
    });
  },
  init: function (el) {
    dingoStore.swipeEvent = {};
    dingoStore.dragEvent = {};
    dingo.on($('[data-dingo]'));
  },
  on: function (el) {
    $.each(dingo.htmlEvents(),function (i,htmlEvent) {
      el.on(htmlEvent,function (event) {
        dingo.exe({htmlEvent:htmlEvent,el:$(this),event: event});
      });
    });
  }
};