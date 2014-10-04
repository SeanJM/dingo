//@ sourceURL=formGuard.js

/*
  FormGuard version 1.5
  
  Prevents certain types of characters from being entered into a field
  Dependencies: dingo.js

  Usage: data-dingo="formGuard{type: [number|float]}"
*/

dingo.formGuard = {
  validate: {},
  process: {}
};

dingo.formGuard.init = function (options) {
  var process  = dingo.formGuard.process[options.type];
  var validate = dingo.formGuard.validate[options.type];
  
  options.formGuard = {
    keyChar : String.fromCharCode(options.event.which),
    key     : options.event.which.toString()
  }

  function keypress() {
    if (!/^(8|0)$/.test(options.formGuard.key)) {
      if (typeof validate === 'function' && !validate(options)) {
        options.event.preventDefault();
      } else if (typeof process === 'function') {
        options.event.preventDefault();
        process(options);
      }
    }
  }

  function keydown() {
    if (/^(8|0|37|38|39|40)$/.test(options.formGuard.key)) {
      if (typeof process === 'function') {
        options.event.preventDefault();
        process(options);
      }
    }
  }

  if (options.event.type === 'keypress') {
    keypress();
  } else {
    keydown();
  }
};

dingo.formGuard.validate.number = function (options) {
  return (options.formGuard.keyChar.match(/[0-9]/) !== null);
}

dingo.formGuard.validate.float = function (options) {
  var match = options.el.val().match(/(\.|\,)/g);
  if (match !== null && match.length > 0) {
    return (options.formGuard.keyChar.match(/[0-9]/) !== null);
  } else {
    return (options.formGuard.keyChar.match(/[\.\,0-9]/) !== null);
  }
}

dingo.formGuard.validate.price = function (options) {
  // Allow arrow keys to be captured
  if (/^(37|38|39|40)$/.test(options.formGuard.key)) {
    return true;
  } else {
    return (/[0-9\.]/.test(options.formGuard.keyChar));
  }
}

dingo.formGuard.process.price = function (options) {
  
  if (/^(0|8)$/.test(options.formGuard.key)) {
    options.formGuard.input = options.el.val().substring(0,options.el.val().length-1);
  } else if (/^(37|38|39|40)$/.test(options.formGuard.key)) {
    options.formGuard.input = options.el.val();
  } else {
    options.formGuard.input = options.el.val() + options.formGuard.keyChar;
  }

  function getStripped() {
    var stripped = options.formGuard.input.replace(/(^0|\.|,)/g,'');
    if (/\./.test(options.formGuard.keyChar)) {
      stripped += '00';
    }
    return stripped.replace(/^0/g,'');
  }

  function toDigitGroup(numberString) {
    numberString = numberString.split('');
    numberString.reverse();
    for (var i = 0;i<numberString.length;i++) {
      if (i > 2 && i%3 === 0) {
        numberString[i] = numberString[i] + ',';
      }
    }
    numberString.reverse();
    return numberString.join('');
  }

  function getValue(digit) {
    var left  = parseInt(digit.split('.')[0],10);
    var right = parseInt(digit.split('.')[1],10);
    var out;

    if (options.formGuard.key === '38') {
      if (keyLog.get('alt')) {
        right = right + 10;
      } else if (keyLog.get('shift')) {
        left = left + 100;
      } else if (keyLog.get('ctrl')) {
        left = left + 10;
      } else {
        left++;
      }
    } else if (options.formGuard.key === '40') {
      if (keyLog.get('alt')) {
        if (right > 10) {
          right = right - 10;
        } else {
          if (left > 1) {
            left--;
          }
          right = 90 + right;
        }
      } else if (keyLog.get('shift') && left > 100) {
        left = left - 100;
      } else if (keyLog.get('ctrl') && left > 10) {
        left = left - 10;
      } else if (left > 0 && keyLog.get('!ctrl','!alt','!shift')) {
        left--;
      } 
    }

    out = toDigitGroup(left.toString()) + '.' + 
          '00'.substring(0,2-right.toString().length) + 
          right.toString();

    return out;
  }

  function toPrice() {
    var stripped = getStripped();
    var digit    = '000'.substring(stripped.length,3) + stripped;
    var left     = digit.substring(0,digit.length-2);
    return getValue(left + '.' + digit.substring(digit.length-2,digit.length));
  }

  options.el.val(toPrice());
}

dingo.set('keypress,keydown','formGuard',dingo.formGuard.init);