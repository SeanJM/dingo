//@ sourceURL=dingo.js

/*
  Dingo Version 1.3.19
  MIT License
  Coded by Sean MacIsaac and created for/existing because of
  these wonderful companies: Cosarie, InventoryLab & WizzSolutions
  seanjmacisaac@gmail.com

  * CHANGELOG *

  1.3.14 :  dingo.event.dingoName can now = 'function|array|object'
            if it is an array, each array member will be executed
            if it is an object, each object key will be executed

  1.3.15 :  Added method 'set' which is to set the value of dingo's functions
            Usage: dingo.set('html event','dingo listener',...,function)
            Eg: dingo.set('click','dingo-click-event',function (options) {});
            Eg: dingo.set('click','dingo-click-event','sub-event',function (options) {});

            Added ability to have multiple dingos/html-events assigned to one function

  1.3.16 :  Added promises

  1.3.17 :  Multiple events per dingo

  1.3.18 :  Added 'trigger';

  1.3.19 :  Merged toJs and the function which passed it a string

*/


var dingoStore = {
  dragEvent: {},
  swipeEvent: {}
};

var dingo = {};

dingo.set = function () {
  var arr = Array.prototype.slice.apply(arguments);
  // Alow doubles:
  // dingo.set('click,touchmove,touchstart','dingo',function);
  function set(check,member,i) {
    var s = member.split(',');
    if (s.length > 1) {
      for (var n=0;n<s.length;n++) {
        set(check,s[n],i);
      }
    } else {
      if (typeof check[member] === 'undefined') {
        check[member] = {};
      }
      if (i<arr.length-2) {
        set(check[member],arr[i+1],i+1);
      } else {
        // Set to function
        check[member] = arr[arr.length-1];
      }
    }
  }
  set (dingo,arr[0],0);
}

dingo.trigger = function (event,target,options) {
  dingo[event][target](options);
}

dingo.isMobile = function () {
  //return ($(window).width() <= 400);
  if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|BlackBerry/)) {
    return true;
  } else {
    return false;
  }
};

dingo.htmlEvents = function () {
  if (dingo.isMobile()) {
    return ['touchend','touchmove','touchstart','touchleave','keyup','keydown','keypress','change','focus','blur','scroll','submit'];
  } else {
    return ['click','mousedown','mouseup','mouseenter','mouseleave','mousemove','keyup','keydown','keypress','change','focus','blur','scroll','submit'];
  }
};

dingo.is = function (k,dingoEvent) {
  var out;
  var target;
  $.each(k.split(','),function (i,event) {
    if (typeof dingo[event] === 'object') {
      target = dingo[event][dingoEvent];
      if (typeof target === 'function') {
        out = 'function';
      } else if (typeof target === 'object' && typeof target.length === 'number') {
        out = 'array';
      } else if (typeof target === 'object') {
        out = 'object';
      }
    }
  });
  return out;
}

dingo.toJs = function (string) {
  var pstring = string;
  var arr     = [];
  var match;
  var reg;
  var obj;
  function init() {
    reg = ['([a-zA-Z0-9_-]+)(?:\\s+|)\\{'];
  }
  function expand() {
    reg.push('[^}]*?');
    reg.push('\}');
    match = pstring.match(new RegExp(reg.join('')));
  }
  function contain(string) {
    var obj = {};
    var res;
    var m;
    reg.splice(1,0,'(');
    reg.splice(reg.length-1,0,')');
    res = string.match(new RegExp(reg.join('')));
    obj.dingo = res[1];
    $.each(res[2].split(';'),function (i,k) {
      obj[k.split(':')[0]] = k.replace(new RegExp(k.split(':')[0] + '(\\s|):'),'');
    });
    return obj;
  }
  function toDingo(arr) {
    var a = [];
    $.each(arr,function (i,k) {
      a.push({dingo: k});
    });
    return a;
  }
  init();
  expand();
  while (match !== null) {
    if (match[0].match(/\{/g).length === match[0].match(/\}/g).length) {
      pstring = $.trim(pstring.replace(match[0],''));
      arr.push(contain(match[0]));
      init();
    }
    expand();
  }
  arr = arr.concat(toDingo(pstring.split(' ')));
  return arr;
}

dingo.get = function (el,event) {
  var attr   = el.attr('data-dingo');
  var chain  = [];
  if (typeof attr === 'string') {
    return exe();
  } else {
    return end();
  }
  function end() {
    return {
      chain: chain,
      find: function (string) {
        var out = false;
        $.each(chain,function (i,k) {
          if (k.dingo === string) {
            out = k;
          }
        });
        return out;
      }
    }
  }
  function exe() {
    $.each(dingo.toJs(attr),function (i,k) {
      k.el    = el;
      k.event = event;
      chain.push(k);
    });
    return end();
  }
}

dingo.getMouse = function (event) {
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
}

dingo.getTouches = function (options) {
  return options.event.originalEvent.changedTouches;
}

dingo.uniMouse = function (event) {
  return {
    mousedown  : 'down',
    touchstart : 'down',
    mouseup    : 'up',
    touchend   : 'up',
    mousemove  : 'move',
    touchmove  : 'move'
  }[event];
};

dingo.swipeEvent = function (options,dingoEvent) {
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
};

dingo.dragEvent = function (options,dingoEvent) {
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
    if (dingo.is(event,dingoStore.dragEvent.dingoEvent) === 'function') {
      dingo[event][dingoStore.dragEvent.dingoEvent](transferOptions());
    }
  }

  function set() {
    if (dingo.is('drag,dragstart,dragend',dingoEvent) === 'function') {
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
};

dingo.exe = function (options) {
  function events(data) {
    var swipe   = dingo.swipeEvent(options,data.dingo);
    var arr;
    if (swipe && dingo.is(swipe.event,data.dingo) === 'function') {
      dingo[swipe.event][data.dingo](data);
    }
    if (dingo.is(options.htmlEvent,data.dingo) === 'function') {
      dingo[options.htmlEvent][data.dingo](data);
    } else if (dingo.is(options.htmlEvent,data.dingo) === 'array') {
      arr = dingo[options.htmlEvent][data.dingo];
      for (var i=0;i<arr.length;i++) {
        arr[i](data);
      }
    } else if (dingo.is(options.htmlEvent,data.dingo) === 'object') {
      arr = dingo[options.htmlEvent][data.dingo];
      for (var k in arr) {
        arr[k](data);
      }
    }
    dingo.dragEvent(options,data.dingo);
  }

  function exe() {
    var chain;
    if (typeof options.el[0].window === 'object') {
      events({
        el: options.el,
        dingo: 'window',
        htmlEvent: 'scroll'
      });
    } else {
      chain   = dingo.get(options.el,options.event).chain;
      $.each(chain,function (i,data) {
        events(data);
      });
    }
  };
  if (typeof options.el[0].window === 'object' || typeof options.el.attr('data-dingo') === 'string') {
    exe();
  }
};

dingo.bind = function (el) {
  dingo.on(el);
  dingo.on(el.find('[data-dingo]'));
  return el;
};

dingo.on = function (el) {
  $.each(['scroll','resize'],function (i,k) {
    $(window).off(k);
    $(window).on(k,function (event) {
      dingo.exe({htmlEvent:k,el:$(window),event: event});
    });
  });
  $.each(dingo.htmlEvents(),function (i,htmlEvent) {
    el.off(htmlEvent);
    el.on(htmlEvent,function (event) {
      dingo.exe({htmlEvent:htmlEvent,el:$(this),event: event});
    });
  });
};

dingo.promise = function (value,callback) {
  function exe() {
    if (typeof value === 'undefined' || value === null) {
      setTimeout(exe,10);
    } else {
      callback();
    }
  }
  exe();
}

dingo.init = function (el) {
  dingoStore.swipeEvent = {};
  dingoStore.dragEvent = {};
  dingo.on($('[data-dingo]'));
};