
angular.module('twitterApp', [])
  .directive('ngBackground', function() {
    return function(scope, element, attrs) {
      attrs.$observe('ngBackground', function(value) {
        element.css({ 'background-image': 'url(' + value + ')' });
        element.removeAttr('ng-background');
      });
    };
  })
  .directive('ngDate', function() {
    return function(scope, element, attrs) {
      attrs.$observe('ngDate', function(value) {
        var date = new Date(value);
        element.text(
          sprintf(
            '%04d/%02d/%02d %02d:%02d:%02d',
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          )
        );
        element.removeAttr('ng-date');
      });
    }
  })
  .controller('twitter', TwitterController)
