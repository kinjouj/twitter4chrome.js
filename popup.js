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
          var expParam = { "tag": encodeURIComponent(hashtag.text) };

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

      tweet.text = text;
      tweet.created_at = new Date(tweet.created_at);
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
          var elm = angular.element('<img>');
          elm.attr('src', media);
          elm.addClass('inline-image');

          element.append(elm);
        });

        element.removeAttr('ng-tweet-inline-image');
      }, 0);
    };
  })
  .directive('ngTweetDate', function($timeout) {
    return function(scope, element, attrs) {
      $timeout(function() {
        var tweet = scope.tweet;
        var date = tweet.created_at;

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
  .controller('twitter', function($scope, $timeout) {
    chrome.runtime.getBackgroundPage(function(bg) {
      var twitter = bg.twitter;
      twitter.home_timeline(function(tweets) {
        $timeout(function() { $scope.tweets = tweets; }, 0);
      });

      $scope.send_retweet = function(id) {
        if (confirm('retweet?')) {
          twitter.retweet(id, function() {
          });
        }
      };

      $scope.send_favorite = function(id) {
        if (confirm('favorite?')) {
          twitter.create_favorites(id, function() {
          });
        }
      };
    });
  });
