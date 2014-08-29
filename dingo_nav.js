/* Version 1.0.1 */

dingo.nav = function () {
  var container = $('#app-container');

  function clickDelay() {
    $('body').addClass('click-delay');
    setTimeout(function () {
      $('body').removeClass('click-delay');
    },400);
  }

  function closeNav() {
    animate(container).end(function () {
      container.removeClass('-nav-open');
    });
  }

  function openNav() {
    animate(container).start();
    container.addClass('-nav-open');
  }

  function toggleNav() {
    if (container.hasClass('_animated-in')) {
      closeNav(container);
    } else {
      openNav(container);
    }
    clickDelay();
  }

  // Prevents the nav from popping up if the user
  // scrolls and the 'touchend' event occurs on the
  // nav and that was not their intention.

  dingo.set('touchstart','nav-control',function (options) {
    dingo.touchend['nav-control'] = function (options) {
      toggleNav();
      dingo.touchend['nav-control'] = false;
    }
  });

  dingo.set('mouseup','nav-control',function (options) {
    toggleNav();
  });

  dingo.set('touchend','a','nav',function (options) {
    options.event.preventDefault();
    window.location = options.el.attr('href');
  });

  dingo.set('touchend','body','nav',function (options) {
    function exe() {
      var target = $(options.event.target);
      if (!target.closest('.nav-control').size() && target.closest('.main').size() || target.closest('.nav').size()) {
        if (container.hasClass('-nav-open')) {
          // This is for mobile safari, if too many things are
          // happening at the same time, the links fail to function
          closeNav();
        }
        if ($(options.event.target).closest('.nav').size()) {
          clickDelay();
        }
      }
    }
    exe();
  });

  dingo.set('touchend','body','clickDelay',function (options) {
    if (options.el.hasClass('click-delay')) {
      options.event.preventDefault();
    }
  });
}
