function scrollTransition(options) {
  var keys = {
    'item-img':{
      '0':{
        width: 65,
        height: 65
      },
      '100':{
        width: 30,
        height: 30
      }
    },
    'status-line':{
      '0':{
        top: 165,
        'padding-top':10
      },
      '100':{
        top: 105,
        'padding-top':7
      }
    },
    'status-line_title':{
      '0':{
        'line-height':20,
        'font-size':15
      },
      '100':{
        'line-height':15,
        'font-size':13
      }
    },
    'status-line_value':{
      '0':{
        'line-height':20
      },
      '100':{
        'line-height':15
      }
    },
    'scope-bar':{
      '0':{
        top: 226
      },
      '100':{
        top: 150
      }
    },
    'item-info_container':{
      '0':{
        'padding-left': 80,
      },
      '100':{
        'padding-left': 45,
      }
    },
    'el':{
      '0':{
        'padding-top':270
      },
      '100':{
        'padding-top':270
      }
    }
  }
  function get(selector,prop) {
    var s, scrollTop, p, diff, cur;
    
    scrollMax = 64;
    scrollTop = options.el.scrollTop();
    
    if (scrollTop > scrollMax) {
      p = 100;
    } else {
      p = parseInt(scrollTop/scrollMax*100);
    }

    diff = keys[selector]['0'][prop]-keys[selector]['100'][prop];
    cur = keys[selector]['0'][prop]-(p/100*diff);
    return cur
  }
  options.el.css('padding-top',get('el','padding-top'));
  $('#scope-bar').css('top',get('scope-bar','top'));
  $('#status-line').css('top',get('status-line','top'));
  $('#status-line').css('padding-top',get('status-line','padding-top'));
  $('#item-img').css('width',get('item-img','width'));
  $('#item-img').css('height',get('item-img','height'));
  $('#item-info_container').css('padding-left',get('item-info_container','padding-left'));
  $('.status-line_title').css('line-height',get('status-line_title','line-height') + 'px');
  $('.status-line_title').css('font-size',get('status-line_title','font-size') + 'px');
  $('.status-line_value').css('line-height',get('status-line_value','line-height') + 'px');
}