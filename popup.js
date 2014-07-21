angular.module('twitterApp', ['ngRoute', 'ngSanitize'])
  .service('twitter', function($q) {
    var deferred = $q.defer();

    chrome.runtime.getBackgroundPage(function(bg) {
      deferred.resolve(bg.twitter);
    });

    return deferred.promise;
  })
  .config(function($compileProvider, $routeProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

    $routeProvider
      .when('/home', {
        controller: 'HomeCtrl',
        templateUrl: 'tweet_template.html'
      })
      .when('/my', {
        controller: 'AccountCtrl',
        templateUrl: 'tweet_template.html'
      })
      .when('/mentions', {
        controller: 'MentionsCtrl',
        templateUrl: 'tweet_template.html'
      })
      .when('/favorites', {
        controller: 'FavoritesCtrl',
        templateUrl: 'tweet_template.html'
      })
      .when('/list/:list_id', {
        controller: 'ListCtrl',
        templateUrl: 'tweet_template.html'
      })
      .otherwise({ redirectTo: '/home' });
  })
  .directive('ngScrollEnd', function($timeout) {
    return function(scope, element, attrs) {
      var $window = angular.element(window);
      var content = angular.element('#tweets');
      var loading = false;

      $window.unbind('scroll');
      $window.bind('scroll', function() {
        if (loading) {
          return;
        }

        var scrollHeight = content.offset().top + content.height();
        var scrollPos = $window.height() + $window.scrollTop();

        if (scrollHeight - scrollPos < 100) {
          var done = function() {
            loading = false;
          };

          scope.$eval(attrs.ngScrollEnd, { "done": done });

          $timeout(function() {
            if (loading) {
              loading = false;
            }
          }, 10000);
        }
      });
    };
  })
  .directive('ngBackground', function() {
    return function(scope, element, attrs) {
      attrs.$observe('ngBackground', function() {
        var bgUrl = scope.tweet.user.profile_banner_url;

        if (angular.isString(bgUrl)) {
          bgUrl += '/web';
        } else {
          bgUrl = 'https://abs.twimg.com/a/1397489556/img/t1/grey_header_web.jpg';
        }

        element.css({ 'background-image': 'url(' + bgUrl + ')' });
        element.removeAttr('ng-background');
      });
    };
  })
  .directive('ngTweet', function($interpolate) {
    return {
      scope: true,
      controller: function($scope) {
        if ('retweeted_status' in $scope.tweet) {
          $scope.tweet = $scope.tweet.retweeted_status;
        }
      },
      link: function(scope, element, attrs) {
        var tweet = scope.tweet;
        var entities = tweet.entities;
        var text = tweet.text;

        if ('hashtags' in entities) {
          entities.hashtags.forEach(function(hashtag) {
            var exp = $interpolate('<a href="https://twitter.com/search?q=%23{{tag}}" target="_blank">#{{tag}}</a>');
            var expParam = { "tag": hashtag.text };

            text = text.replace('#' + hashtag.text, exp(expParam));
          });
        }

        if ('media' in entities) {
          entities.media.forEach(function(media) {
            var exp = $interpolate('<a href="{{url}}" target="_blank">{{text}}</a>');
            var expParam = { "url": media.media_url_https, "text": media.url };

            text = text.replace(media.url, exp(expParam));
          });
        }

        if ('urls' in entities) {
          entities.urls.forEach(function(url) {
            var exp = $interpolate('<a href="{{url}}" target="_blank">{{url}}</a>');
            var expParam = { "url": url.expanded_url };
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
      }
    };
  })
  .directive('ngTweetInlineImage', function() {
    return {
      scope: true,
      link: function(scope, element, attrs) {
        var tweet = scope.tweet;
        var medias = tweet.entities.media;

        if (!angular.isArray(medias)) {
          return;
        }

        medias.forEach(function(media) {
          var imageElement = angular.element('<img>');
          imageElement.attr('src', media.media_url_https);
          imageElement.addClass('inline-image');

          var anchorElement = angular.element('<a>');
          anchorElement.attr('href', media.media_url_https);
          anchorElement.attr('target', '_blank');
          anchorElement.append(imageElement);
          anchorElement.insertAfter(element);
        });

        element.removeAttr('ng-tweet-inline-image');
      }
    };
  })
  .directive('ngTweetDate', function() {
    return function(scope, element, attrs) {
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
  .controller('NavCtrl', function($scope, twitter) {
    twitter.then(function(client) {
      client.lists(function(lists) {
        $scope.lists = lists;
      });
    });
  })
  .controller('BaseController', function($scope, twitter) {
    $scope.send_retweet = function(tweet) {
      if (!tweet.retweeted && confirm('retweet?')) {
        twitter.then(function(client) {
          client.retweet(tweet.id_str, angular.noop);
        });
      }
    };

    $scope.send_favorite = function(tweet) {
      if (!tweet.favorited && confirm('favorite?')) {
        twitter.then(function(client) {
          client.create_favorites(tweet.id_str, angular.noop);
        });
      }
    };
  })
  .controller('AccountCtrl', function($controller, $scope, twitter) {
    twitter.then(function(client) {
      client.user_timeline(function(tweets) {
        var max_id = tweets[tweets.length - 1].id_str;

        $scope.scrollEnd = function(done) {
          try {
            client.user_timeline({ max_id: max_id }, function(tweets) {
              $scope.$apply(function() {
                max_id = tweets[tweets.length - 1].id_str;
                $scope.tweets = $scope.tweets.concat(tweets.splice(1));
                done();
              });
            });
          } catch (e) {
            done();
          }
        }

        $scope.$apply(function() {
          $scope.tweets = tweets;
        });
      });
    });
  })
  .controller('HomeCtrl', function($controller, $scope, twitter) {
    $controller('BaseController', { '$scope': $scope });

    twitter.then(function(client) {
      client.home_timeline(function(tweets) {
        if (tweets.length <= 0) {
          return;
        }

        var max_id = tweets[tweets.length - 1].id_str;

        $scope.scrollEnd = function(done) {
          try {
            client.home_timeline({ max_id: max_id }, function(tweets) {
              $scope.$apply(function() {
                max_id = tweets[tweets.length - 1].id_str;
                $scope.tweets = $scope.tweets.concat(tweets.splice(1));
                done();
              });
            });
          } catch (e) {
            done();
          };
        };

        $scope.$apply(function() {
          $scope.tweets = tweets;
        });
      });
    });
  })
  .controller('MentionsCtrl', function($controller, $scope, twitter) {
    $controller('BaseController', { '$scope': $scope });

    twitter.then(function(client) {
      client.mentions(function(tweets) {
        $scope.$apply(function() {
          $scope.tweets = tweets;
        });
      });
    });
  })
  .controller('FavoritesCtrl', function($controller, $scope, twitter) {
    $controller('BaseController', { '$scope': $scope });

    twitter.then(function(client) {
      client.favorites(function(tweets) {
        $scope.$apply(function() {
          $scope.tweets = tweets;
        });
      });
    });
  })
  .controller('ListCtrl', function($controller, $scope, $routeParams, twitter) {
    $controller('BaseController', { '$scope': $scope });

    twitter.then(function(client) {
      var id = $routeParams.list_id;
      client.list({ list_id: id }, function(tweets) {
        $scope.$apply(function() {
          $scope.tweets = tweets;
        });
      });
    });
  });
