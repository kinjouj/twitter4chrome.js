(function($) {
  $.fn.dataBackground = function() {
    return this.each(function(i, elm) {
      var bg = $(elm).data('background');
      $(elm).css('background-image', 'url("' + bg + '")');
      $(elm).removeAttr('data-background');
    });
  };
})(jQuery);
