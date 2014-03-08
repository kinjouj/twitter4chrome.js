angular.module('twitterApp', [])
  .controller('twitter', TwitterController)

angular.bootstrap(document, ['twitterApp']);

setTimeout(function() { angular.resumeBootstrap(); }, 3000);
