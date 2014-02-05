// Dingo Version 1.3.5
// MIT License
// Coded by Sean MacIsaac and created for/existing because of
// these wonderful companies: Cosarie, InventoryLab & WizzSolutions
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
      return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress','change','focus','blur','scroll'];
    } else {
      return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress','change','focus','blur','scroll'];
    }
  },
  is: function (k,dingoEvent) {
    var out = false;
    $.each(k.split(','),function (i,event) {
      if (typeof dingo[event] === 'object' && typeof dingo[event][dingoEvent] === 'function') {
        out = true;
      }
    });
    return out;
  },
  get: function (el,event) {
    var dingos = el.attr('data-dingo').match(/[a-zA-Z0-9_-]+(\s+|)(\{[^}]*?\}|)/g);
    var chain  = [];
    var js;

    $.each(dingos,function (i,k) {
      js       = dingo.toJs(el.attr('data-dingo'));
      js.el    = el;
      js.event = event;
      chain.push(js);
    });
    return chain;
  },
  toJs: function (string) {
    var match   = string.match(/([a-zA-Z0-9_-]+)(?:\s+|)(\{([^}]*)\}|)/);
    var options = {
      dingo : match[1]
    };

    if (typeof match[3] === 'string' && match[3].length > 0) {
      $.each(match[3].split(';'),function (i,k) {
        if (k.length > 0) {
          var _match = k.match(/([a-zA-Z0-9_-]+):([^}]*)/);
          _match[2]  = _match[2].replace(/^\s+|\s+$/g,'');

          if (_match[2] === 'true') {
            _match[2] = true;
          } else if (_match[2] === 'false') {
            _match[2] = false;
          }

          options[_match[1]] = _match[2];
        }
      });
    }

    return options;
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
    /*
      Track the single element-A on mousedown
      while mouse is down, if mouse moves initiate drag for element-A
      mouse up, release
    */
    var pageX = dingo.getMouse(options.event).pageX;
    var pageY = dingo.getMouse(options.event).pageY;

    function mouseEvent(string) {
      return (dingo.uniMouse(options.htmlEvent) === string);
    }

    function transferOptions() {
      options.el = dingoStore.dragEvent.el;
      for (var k in dingoStore.dragEvent.options) {
        if (!k.match(/^(htmlEvent|el|event)$/)) {
          options[k] = dingoStore.dragEvent.options[k];
        }
      }
      return options;
    }

    function trigger(event) {
      if (dingo.is(event,dingoStore.dragEvent.dingoEvent)) {
        dingo[event][dingoStore.dragEvent.dingoEvent](transferOptions());
      }
    }

    function set() {
      if (dingo.is('drag,dragstart,dragend',dingoEvent)) {
        dingoStore.dragEvent = {
          dingoEvent : dingoEvent,
          el         : options.el,
          pageX      : pageX,
          pageY      : pageY,
          options    : options,
          mousedown  : true
        }
        trigger('dragstart');
      }
    }

    function clear() {
      trigger('dragend');
      dingoStore.dragEvent = {};
    }

    function drag() {
      if (Math.abs(dingoStore.dragEvent.pageX - pageX) > 10 || Math.abs(dingoStore.dragEvent.pageY - pageY) > 10) {
        trigger('drag');
      }
    }

    if (mouseEvent('down')) {
      set();
    } else if (mouseEvent('up')) {
      clear();
    }
    if (mouseEvent('move') && dingoStore.dragEvent.mousedown) {
      drag();
    }
  },
  exe: function (options) {

    function events(data) {
      var swipe = dingo.swipeEvent(options,data.dingo);

      if (swipe && dingo.is(swipe.event,data.dingo)) {
        dingo[swipe.event][data.dingo](data);
      }
      if (dingo.is(options.htmlEvent,data.dingo)) {
        dingo[options.htmlEvent][data.dingo](data);
      }

      dingo.dragEvent(options,data.dingo);
    }

    function exe() {
      var chain   = dingo.get(options.el,options.event);
      var tagname = options.el[0].tagName.toLowerCase();

      $.each(chain,function (i,data) {
        events(data);
      });
    };
    if (typeof options.el.attr('data-dingo') === 'string') {
      exe();
    }
  },
  init: function (el) {
    dingoStore.swipeEvent = {};
    dingoStore.dragEvent = {};
    dingo.on($('[data-dingo]'));
  },
  bind: function (el) {
    dingo.on(el);
    dingo.on(el.find('[data-dingo]'));
  },
  on: function (el) {
    $(window).on('scroll',function (event) {
      if (dingo.is('scroll','window')) {
        dingo.scroll['window']({event: event,dingo: 'window',el: $(this)});
      }
    });
    $.each(dingo.htmlEvents(),function (i,htmlEvent) {
      el.off(htmlEvent);
      el.on(htmlEvent,function (event) {
        dingo.exe({htmlEvent:htmlEvent,el:$(this),event: event});
      });
    });
  }
};