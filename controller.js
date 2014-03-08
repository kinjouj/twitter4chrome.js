var TwitterController = (function() {

  function TwitterController($scope, $timeout) {
    chrome.runtime.getBackgroundPage(function(bg) {
      var twitter = bg.twitter;
      twitter.home_timeline(function(tweets) {
        $timeout(function() { $scope.tweets = tweets; }, 0);
      });
    });
  };

  return TwitterController;

})();
