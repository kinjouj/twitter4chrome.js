
angular.module('twitterApp', [])
  .directive('ngBackground', function() {
    return function(scope, element, attrs) {
      attrs.$observe('ngBackground', function(value) {
        element.css({ 'background-image': 'url(' + value + ')' });
        element.removeAttr('ng-background');
      });
    };
  })
  .directive('ngTweetText', function() {
    return function(scope, element, attrs) {
      var tweet = scope.tweet;
      var entities = tweet.entities;
      var text = tweet.text;
      var inlineMedia = [];

      if ('hashtags' in entities) {
        entities.hashtags.forEach(function(hashtag) {
          var tag = hashtag.text;
          text = text.replace(
            '#' + tag,
            '<a href="https://twitter.com/search/#' + encodeURIComponent(tag) + '" target="_blank">#' + tag + '</a>'
          );
        });
      }

      if ('media' in entities) {
        entities.media.forEach(function(media) {
          text = text.replace(
            media.url,
            '<a href="' + media.media_url_https + '" target="_blank">' + media.url + '</a>'
          );

          inlineMedia.push(media.media_url_https);
        });
      }

      var p = document.createElement('p');
      p.innerHTML = text;
      element.append(p);

      inlineMedia.forEach(function(media) {
        var mediaImg = document.createElement('img');
        mediaImg.src = media;
        mediaImg.setAttribute('class', 'inline-image');

        element.append(mediaImg);
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
