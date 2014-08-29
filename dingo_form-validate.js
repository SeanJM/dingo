//@ sourceURL=formValidate.js

/*
  Form Validate Version 1.3.0
  MIT License
  by Sean MacIsaac
*/

var formValidate    = {};
formValidate.events = {};
formValidate.custom = {};

formValidate.init = function (form) {
  function camelCase(string) {
    string = string||'';
    string = string.replace(/\(|\)/,'').split(/-|\s/);
    var out = [];
    for (var i = 0;i<string.length;i++) {
      if (i<1) {
        out.push(string[i].toLowerCase());
      } else {
        out.push(string[i][0].toUpperCase() + string[i].substr(1,string[i].length).toLowerCase());
      }
    }
    return out.join('');
  }

  function nullBool(value) {
    if (value) {
      return true;
    } else {
      return false;
    }
  }

  function getGroup(el) {
    return {
      container: el.closest('.form-validate-group'),
      label: $('[for="' + el.attr('id') + '"]'),
      prompt: el.closest('.form-validate-group').find('.form-validate-prompt')
    }
  }

  function getName(el) {
    if (typeof el.attr('id') === 'undefined') {
      return el.attr('name');
    } else {
      return el.attr('id');
    }
  }

  function getType(el) {
    var attr = camelCase(getName(el)).toLowerCase();
    var tag  = (el.attr('type') === 'checkbox') ? 'checkbox' : el[0].tagName.toLowerCase();
    function type() {
      var _type = 'text';
      if (attr.match(/zip(code|)/)) {
        _type = 'zipCode';
      } else if (attr.match(/zippostal/)) {
        _type = 'zipPostal';
      } else if (attr.match(/(confirm|)(new|old|current|)password/)) {
        _type = 'password'
      } else if (attr.match(/email/)) {
        _type = 'email';
      } else if (attr.match(/(confirm|)([a-zA-Z0-9_-]+|)(phone)(number|)/)) {
        _type = 'phone';
      } else if (attr.match(/creditcard/)) {
        _type = 'creditCard';
      } else if (attr.match(/number/)) {
        _type = 'number';
      } else if (attr.match(/captcha/)) {
        _type = 'captcha';
      } else if (attr.match(/date/)) {
        _type = 'date';
      }
      return _type;
    }
    if (tag === 'input' || tag === 'textarea') {
      return type();
    } else {
      return tag;
    }
  } // Get Type

  function isValid(el) {
    var string = el.val()||'';
    var custom = dingo.get(el).find('form-validate').custom;
    var exe = {
      text: function () {
        return (string.length > 0);
      },
      password: function () {
        return (string.length >= 6 && nullBool(string.match(/^[\!\@\#\$\%\^\&\*\(\)a-zA-Z0-9_-]+$/)));
      },
      creditCard: function () {
        var cn = string.match(/[0-9]/g);
        function exe() {
          cn = cn.join('');
          if (cn.match(/^4[0-9]{12}(?:[0-9]{3})?$/)) { // Visa
            return true;
          } else if (cn.match(/^5[1-5][0-9]{14}$/)) { // MasterCard
            return true;
          } else if (cn.match(/^3[47][0-9]{13}$/)) { // American Express
            return true;
          } else if (cn.match(/^6(?:011|5[0-9]{2})[0-9]{12}$/)) { // Discover
            return true;
          } else {
            return false;
          }
        }
        if (cn) {
          return exe();
        } else {
          return false;
        }
      },
      zipCode: function () {
        return (nullBool(string.match(/^[0-9]{5}$/)));
      },
      zipPostal: function () {
        return (nullBool(string.match(/^([0-9]{5}|[a-zA-Z][0-9][a-zA-Z](\s|)[0-9][a-zA-Z][0-9])$/)));
      },
      email: function () {
        return (nullBool(string.match(/[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.([a-z]{2}|[a-z]{3})/)));
      },
      select: function () {
        return (el[0].selectedIndex > 0);
      },
      checkbox: function () {
        return el[0].checked;
      },
      phone: function () {
        var m = string.match(/[0-9]/g);
        if (m !== null) {
          return (nullBool(m.join('').match(/^([0-9]{10})$/)));
        } else {
          return false;
        }
      },
      number: function () {
        return nullBool(string.match(/^[0-9\.\,]+$/));
      },
      captcha: function () {
        var group = getGroup(el);
        return ($.trim(el.val().toLowerCase()) === group.container[0].captcha.a);
      },
      date: function () {
        return nullBool(string.match(/^[0-9]{4}\/(0[0-9]|1[1-2]|[1-9])\/([0-3][0-9]|0[0-9]|[0-9])$/));
      }
    }
    if (typeof formValidate.custom[custom] === 'function') {
      return formValidate.custom[custom](string);
    } else {
      return exe[getType(el)]();
    }
  }; // isValid

  return {
    confirm: function (el) {
      var _condition,
          _dependency,
          _mirror,
          _normal;

      function condition(el) {
        var bool = dingo.get(el).find('form-validate').condition||false;
        if (bool && el.val().length > 0) {
          return el;
        } else {
          return false;
        }
      }

      function dependency(el) {
        // Needs to use recursion to climb the dependency tree to determine whether or not
        // the element is dependent on anything
        var dep = dingo.get(el).find('form-validate').dependency;
        var depEl = $('#' + dep);
        if (typeof dep === 'string' && depEl.size()) {
          return depEl;
        } else {
          return false;
        }
      }

      function mirror(el) {
        var mirror = $('#' + dingo.get(el).find('form-validate').mirror);
        if (mirror.size()) {
          return [el,mirror];
        } else {
          return false;
        }
      }

      function normal(el) {
        var check = dingo.get(el).find('form-validate');
        var out = true;
        var attr = ['condition','dependency','mirror'];
        $.each(attr,function (i,k) {
          if (typeof check[k] === 'string' || check[k]) {
            out = false;
          }
        });
        return out;
      }

      function validate(el) {
        function exe(el,bool) {
          var group = getGroup(el);
          if (bool) {
            el.removeClass('_invalid');
            el.addClass('_valid');
            group.label.removeClass('_invalid').addClass('_valid');
            animate(group.prompt).end();
            group.prompt.removeClass('_active');
          } else {
            el.addClass('_invalid');
            group.label.addClass('_invalid').removeClass('_valid');
          }
        }
        return {
          condition: function () {
            exe(el,isValid(el));
          },
          dependency: function (match) {
            if (normal(match) || condition(match)) {
              exe(el,isValid(el));
            }
          },
          mirror: function (array) {
            var valid = (isValid(array[0]) && isValid(array[1]));
            if (array[0].val() === array[1].val()) {
              exe(array[0],valid);
              exe(array[1],valid);
            } else {
              exe(array[0],false);
              exe(array[1],false);
            }
          },
          normal: function () {
            exe(el,isValid(el));
          }
        }
      }

      _condition  = condition(el);
      _dependency = dependency(el);
      _mirror     = mirror(el);

      if (_condition) {
        validate(el).condition();
      } else if (_dependency) {
        validate(el).dependency(_dependency);
      } else if (_mirror) {
        validate(el).mirror(_mirror);
      } else if (normal(el)) {
        validate(el).normal();
      }
    },
    clear: function () {
      form.find('input,textarea').each(function () {
        if ($(this)[0].tagName.toLowerCase() === 'input') {
          if ($(this).attr('type').match(/^(checkbox|radio)$/) !== null) {
            $(this)[0].checked = false;
          } else {
            $(this).val('');
          }
        } else {
          $(this).val('');
        }
      });
    },
    get: function () {
      return form.find('[data-dingo*="form-validate"]').not('[data-dingo*="form-validate-submit"]');
    },
    init: function (base, confirm) {
      if (el.size() > 0) {
        parameters.bool = bool;
        formValidate.init(el).fufilled();
        return formValidate.init(el);
      } else {
        return false;
      }
    },
    is: function () {
      return (form.find('.form-validate').size() < 1);
    },
    check: function () {
      var el;
      formValidate.init(form).get().each(function () {
        formValidate.init(form).confirm($(this));
      });
      return form.find('._invalid');
    },
    submit: function (event) {
      var out = true;
      var requiredField = formValidate.init(form).check();
      if (requiredField.size() > 0) {
        requiredField.each(function () {
          var group = getGroup($(this));
          group.prompt.addClass('_active');
          group.prompt.css('top',group.container.outerHeight() + 'px');
          if (typeof animate === 'function') {
            animate(group.prompt).start();
          }
        })
        if (requiredField.eq(0).closest('[class*="modal"]').size() < 1) {
          if (typeof animate === 'function') {
            if (!dingo.isMobile()) {
              animate(requiredField.eq(0)).scroll();
            }
          }
          requiredField.eq(0).focus();
        }
        out = false;
      }
      return out;
    },
    setCaptcha: function () {
      var group;

      function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function setCaptcha(group) {
        var answers = [{
          q: 'What is 2+1?',
          a: '3'
        },{
          q: 'What is 2+5?',
          a: '7'
        },{
          q: 'Is the sun hot or cold?',
          a: 'hot'
        }];
        group[0].captcha = answers[getRandomInt(0,answers.length-1)];
        group.find('label').html(group.find('label').html().replace(/{{captcha}}/,group[0].captcha.q));
      }
      group = form.find('label[for*="captcha"]:eq(0)').closest('.form-validate-group');
      if (group.size()) {
        setCaptcha(group);
      }
    }
  }
}

formValidate.events.submit = function (options) {
  var container = options.el.closest('.form-validate-container');
  var submit    = formValidate.init(container).submit();
  if (!submit) {
    options.event.preventDefault();
  }
}

dingo.set('click','form-validate',function (options) {
  if (options.el.attr('type') === 'checkbox') {
    formValidate.init(options.el.closest('.form-validate-container')).confirm(options.el);
  }
});

dingo.set('change','form-validate',function (options) {
  if (options.el[0].tagName === 'SELECT') {
    formValidate.init(options.el.closest('.form-validate-container')).confirm(options.el);
  }
});

dingo.set('keyup','form-validate',function (options) {
  formValidate.init(options.el.closest('.form-validate-container')).confirm(options.el);
});

dingo.set('click,touchstart','form-validate-submit',formValidate.events.submit);

$(function () {
  setTimeout(function () {
    $('.form-validate-container').each(function () {
      formValidate.init($(this)).check();
    });
  },300);
  $('.form-validate-container').each(function () {
    formValidate.init($(this)).setCaptcha();
  });
});
