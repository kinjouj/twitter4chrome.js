angular.module('twitterApp', ['ngSanitize'])
  .directive('ngBackground', function() {
    return function(scope, element, attrs) {
      attrs.$observe('ngBackground', function(value) {
        element.css({ 'background-image': 'url(' + value + ')' });
        element.removeAttr('ng-background');
      });
    };
  })
  .directive('ngTweet', function($interpolate) {
    return function(scope, element, attrs) {
      var tweet = scope.tweet;

      if ('retweeted_status' in tweet) tweet = tweet.retweeted_status;

      var entities = tweet.entities;
      var text = tweet.text;

      if ('hashtags' in entities) {
        entities.hashtags.forEach(function(hashtag) {
          var exp = $interpolate(
            '<a href="https://twitter.com/search?q=%23{{tag}}" target="_blank">#{{tag}}</a>'
          );
          var expParam = { "tag": hashtag.text };

          text = text.replace('#' + hashtag.text, exp(expParam));
        });
      }

      tweet.inlineMedia = [];

      if ('media' in entities) {
        entities.media.forEach(function(media) {
          var exp = $interpolate(
            '<a href="{{url}}" target="_blank">{{text}}</a>'
          );
          var expParam = { "url": media.media_url_https, "text": media.url };

          text = text.replace(media.url, exp(expParam));
          tweet.inlineMedia.push(media.media_url_https);
        });
      }

      if ('urls' in entities) {
        entities.urls.forEach(function(url) {
          var exp = $interpolate(
            '<a href="{{url}}" target="_blank">{{text}}</a>'
          );
          var expParam = { "url": url.url, "text": url.expanded_url };
          text = text.replace(url.url, exp(expParam));
        });
      }

      if ('user_mentions' in entities) {
        entities.user_mentions.forEach(function(mention) {
          var exp = $interpolate(
            '<a href="https://twitter.com/{{screen_name}}" target="_blank">@{{screen_name}}</a>'
          );
          var expParam = { "screen_name": mention.screen_name };
          text = text.replace('@' + mention.screen_name, exp(expParam));
        });
      }

      var elm;

      try {
        elm = angular.element(tweet.source);
      } catch (e) {
        elm = angular.element('<a>');
        elm.text(tweet.source);
      }

      tweet.text = text;
      scope.tweet = tweet;
    };
  })
  .directive('ngTweetInlineImage', function($timeout) {
    return function(scope, element, attrs) {
      $timeout(function() {
        var tweet = scope.tweet;

        if (!('inlineMedia' in tweet))
          return;

        tweet.inlineMedia.forEach(function(media) {
          var imageElement = angular.element('<img>');
          imageElement.attr('src', media);
          imageElement.addClass('inline-image');

          var anchorElement = angular.element('<a>');
          anchorElement.attr('href', media);
          anchorElement.attr('target', '_blank');
          anchorElement.append(imageElement);

          element.append(anchorElement);
        });

        element.removeAttr('ng-tweet-inline-image');
      }, 0);
    };
  })
  .directive('ngTweetDate', function($timeout) {
    return function(scope, element, attrs) {
      $timeout(function() {
        var tweet = scope.tweet;
        var date = new Date(tweet.created_at);

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
        element.removeAttr('ng-tweet-date');
      }, 0);
    }
  })
  .directive('ngTweetSource', function() {
    return function(scope, element , attr) {
      var tweet = scope.tweet;
      var source = tweet.source;
      var anchorElement = angular.element('<a>');

      var sourceElement = angular.element(source);

      if (sourceElement.length > 0) {
        anchorElement.attr('href', sourceElement.attr('href'));
        anchorElement.attr('target', '_blank');
        anchorElement.text(sourceElement.text());
      } else {
        anchorElement.text(source);
      }

      element.append(anchorElement);
      element.removeAttr('ng-tweet-source');
    };
  })
  .controller('twitter', function($scope, $timeout, $window) {
    chrome.runtime.getBackgroundPage(function(bg) {
      var twitter = bg.twitter;

      twitter.lists(function(lists) {
        $scope.lists = lists;
      });

      $scope.navHome = function() {
        twitter.home_timeline(function(tweets) {
          $timeout(function() {
            $scope.tweets = tweets;
            scroll($window, 0);
          }, 0);
        });
      };

      $scope.navMention = function() {
        twitter.mentions(function(tweets) {
          $timeout(function() {
            $scope.tweets = tweets;
            scroll($window, 0);
          }, 0);
        });
      };

      $scope.navFavorites = function() {
        twitter.favorites(function(tweets) {
          $timeout(function() {
            $scope.tweets = tweets;
            scroll($window, 0);
          }, 0);
        });
      };

      $scope.navList = function(list) {
        twitter.list({ "list_id": list.id_str }, function(tweets) {
          $timeout(function() {
            $scope.tweets = tweets;
            scroll($window, 0);
          }, 0);
        });
      };

      $scope.send_retweet = function(tweet) {
        if (!tweet.retweeted && confirm('retweet?')) {
          twitter.retweet(tweet.id_str, function() {
          });
        }
      };

      $scope.send_favorite = function(tweet) {
        if (!tweet.favorited && confirm('favorite?')) {
          twitter.create_favorites(tweet.id_str, function() {
          });
        }
      };

      $scope.navHome();
    });
  });
