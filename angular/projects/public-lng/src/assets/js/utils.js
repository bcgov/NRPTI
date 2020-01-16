// Switch Header styling when scrolled to anchor
function scroll_style() {
  const window_top = $(window).scrollTop();
  const div_top = $('#anchor-point');

  if (div_top.length) {
    const anchorPoint = div_top.offset().top;

    if (window_top > anchorPoint - 350) {
      $('#header').addClass('app-header--solid');
    } else {
      $('#header').removeClass('app-header--solid');
    }
  }

  if (window_top > 100) {
    $('.scroll-top-btn').addClass('visible');
  } else {
    $('.scroll-top-btn').removeClass('visible');
  }
}

$(function() {
  $(window).scroll(scroll_style);
  scroll_style();
});

// Collapse Menu when navigating to route
$(document).on('click', '.navbar-collapse.show', function(e) {
  $(this).collapse('hide');
});

// Collapse main navigation drop menus on click
$(function() {
  $('.dropdown-item').click(function() {
    $('#mainNav').collapse('hide');
  });
});
