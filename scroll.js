/**
 * Returns visible portion(px) and height(px) of element
 * @type {HTMLElement} elm HTML DOM element
 * @return object - {portion, height}
 */
function visibleElement(elm) {
  var scrollTop = $(window).scrollTop();
  var scrollBot = scrollTop + $(window).height();
  var elTop = elm.offset().top;
  var elHeight = elm.outerHeight();
  var elBottom = elTop + elHeight;
  var visibleTop = elTop < scrollTop ? scrollTop : elTop;
  var visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
  var element = {portion: visibleBottom - visibleTop, height: elHeight};

  if (element.portion <= 0) {
    return null;
  }
  return element;
}

$(function () {
  
  // Highlight menu item on page load
  var target = location.hash;
  var disablePushState = false;

  if (target === "") {
    $(".sidebar-menu .active .scroll-highlight > li:first").addClass('active');
  } else {
    $('a[href="' + target + '"]').closest("li").addClass('active');
    disablePushState = true;
  }

  // Control off loading history
  $(window).on("popstate", function (e) {

    var offset = 0;
    e.preventDefault();
    if (history.state !== null) {
      offset = history.state.scrollTop;
    } else {
      if (location.hash !== "") {
        offset = $(location.hash).offset().top;
      }
    }
    disablePushState = true;

    //smooth scrolling on history load
    $.when($('html, body').animate({
      scrollTop: offset
    }, 800)).then(function () {
      disablePushState = false;
    });
  });

  // Highlight menu item on scrolling
  $(window).on('scroll', (function () {

    var firstElement = {id: "", portion: 0, percentage: 0};
    var navLinks = $(".sidebar-menu .active .scroll-highlight > li");

    $('.anchor-move').each(function () {
      var id = $(this).attr('id');
      var elm = visibleElement($(this).parent("div"));

      if (elm !== null) {
        var percentage = elm.portion / elm.height;

        if (percentage === 1) {
          firstElement = {id: id, portion: elm.portion, percentage: percentage};
        } else if (elm.portion > firstElement.portion && firstElement.percentage !== 1) {
          firstElement = {id: id, portion: elm.portion, percentage: percentage};
        }
      }
    });

    navLinks.removeClass('active');
    $('.sidebar-menu .active .scroll-highlight > li > a[href="#' + firstElement.id + '"]').closest("li").addClass('active');

    if (disablePushState == false) {
      // update url hash on scrolling
      if ((('#' + firstElement.id) !== window.location.hash)) {
        if (window.history.pushState) {
          var state = {
            scrollTop: $(window).scrollTop = $("#" + firstElement.id).offset().top
          };
          window.history.pushState(state, null, window.location.search + '#' + firstElement.id);
        } else {
          window.location.hash = firstElement.id;
        }
      }
    }
  }));

  // smooth scrolling to anchor
  $('.sidebar-menu .active .scroll-highlight > li > a').on('click', function () {

    if (this.hash !== "") {

      var hash = this.hash;
      disablePushState = true;

      $.when($('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function () {
        window.location.hash = hash;
      })).then(function () {
        disablePushState = false;
      });

      $(this).parents("li").find('.active').removeClass('active');
      $(this).closest("li").addClass('active');
    }
  });
});
