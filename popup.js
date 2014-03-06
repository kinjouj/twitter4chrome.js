(function() {
  "use strict";

  chrome.runtime.getBackgroundPage(function(page) {
    var nbar = new Nanobar();

    var twitter = page.twitter;
    twitter.home_timeline({ "count": 50 }, function(tweets) {
      var container = document.querySelector('#container');
      var fragment = document.createDocumentFragment();

      /*
      <div class="card">
        <div class="card-header" data-background="{background_image_url}">
        </div>
        <div class="card-body">
          <p>{text}</p>
        </div>
        <div class="card-footer">
          <div class="card-footer-left">
          </div>
          <div class="card-footer-right">
          </div>
          <div style="clear:both" />
        </div>
      </div>
      */

      var nbarPercentage = 100 / tweets.length;
      var nbarCount = 0;

      tweets.forEach(function(tweet) {
        if ('retweeted_status' in tweet) tweet = tweet.retweeted_status;

        console.log(tweet);

        var user = tweet.user;
        var profileBackgroundImageUrl = user.profile_background_image_url_https;
        var profileImageUrl = user.profile_image_url_https;

        var img = document.createElement('img');
        img.setAttribute('src', profileImageUrl);
        img.addEventListener("click", function() {
          window.open('https://twitter.com/' + user.screen_name);
        });

        var headerDiv = document.createElement('div');
        headerDiv.setAttribute('class', 'card-header');
        headerDiv.setAttribute(
          'data-background',
          profileBackgroundImageUrl
        );
        headerDiv.appendChild(img);

        var text = tweet.text;
        var createdAt = new Date(tweet.created_at);
        var entities = tweet.entities;

        if ("hashtags" in entities) {
          entities.hashtags.forEach(function(hashtag) {
            text = text.replace(
              '#' + hashtag.text,
              '<a href="https://twitter.com/search/' + encodeURIComponent('#' + hashtag.text) + '" target="_blank">#' + hashtag.text + '</a>'
            );
          });
        }

        var medias = [];

        if ("media" in entities) {
          entities.media.forEach(function(media) {
            text = text.replace(
              media.url,
              '<a href="' + media.media_url_https + '" target="_blank">' + media.url + '</a>'
            );

            medias.push(media.media_url_https);
          });
        }

        if ("urls" in entities) {
          entities.urls.forEach(function(url) {
            text = text.replace(
              url.url,
              '<a href="' + url.expanded_url + '" target="_blank">' + url.expanded_url + '</a>'
            );
          });
        }

        if ("user_mentions" in entities) {
          entities.user_mentions.forEach(function(mention) {
            text = text.replace(
              '@' + mention.screen_name,
              '<a href="https://twitter.com/' + mention.screen_name + '" target="_blank">@' + mention.screen_name + '</a>'
            );
          });
        }

        var p = document.createElement('p');
        p.innerHTML = text;

        var bodyDiv = document.createElement('div');
        bodyDiv.setAttribute('class', 'card-body');
        bodyDiv.appendChild(p);

        if (medias.length > 0) {
          medias.forEach(function(media) {
            var mediaImg = document.createElement('img');
            mediaImg.src = media;
            mediaImg.setAttribute('class', 'inline-image');

            bodyDiv.appendChild(mediaImg);
          });
        }

        var footerListUserAnchor = document.createElement('a');
        footerListUserAnchor.innerText = user.name;
        footerListUserAnchor.setAttribute('target', '_blank');
        footerListUserAnchor.setAttribute(
          'href',
          'https://twitter.com/' + user.screen_name
        );

        var footerListUser = document.createElement('li');
        footerListUser.appendChild(footerListUserAnchor);

        var footerListRTSpan = document.createElement('span');
        footerListRTSpan.setAttribute('class', 'footer-icon icon-retweet');
        footerListRTSpan.innerHTML = '&nbsp;' + tweet.retweet_count;

        var footerListRT = document.createElement('li');
        footerListRT.appendChild(footerListRTSpan);

        var footerListFavSpan = document.createElement('span');
        footerListFavSpan.setAttribute('class', 'footer-icon icon-star');
        footerListFavSpan.innerHTML = '&nbsp;' + tweet.favorite_count;

        var footerListFav = document.createElement('li');
        footerListFav.appendChild(footerListFavSpan);

        var footerListCreatedAtAnchor = document.createElement('a');
        footerListCreatedAtAnchor.innerText = sprintf(
          "%04d/%02d/%02d %02d:%02d:%02d",
          createdAt.getFullYear(),
          createdAt.getMonth() + 1,
          createdAt.getDate(),
          createdAt.getHours(),
          createdAt.getMinutes(),
          createdAt.getSeconds()
        );
        footerListCreatedAtAnchor.setAttribute('target', '_blank');
        footerListCreatedAtAnchor.setAttribute(
          'href',
          'https://twitter.com/' + user.screen_name + '/status/' + tweet.id_str
        );

        var footerListCreatedAt = document.createElement('li');
        footerListCreatedAt.appendChild(footerListCreatedAtAnchor);

        var source = $.parseHTML(tweet.source)[0];
        if (!(source instanceof HTMLElement)) {
          source = document.createElement('a');
          source.setAttribute('href', 'javascript:void()');
          source.innerText = tweet.source;
        }

        source.setAttribute('target', '_blank');

        var footerListSource = document.createElement('li');
        footerListSource.appendChild(source);

        var footerLeftList = document.createElement('ul');
        footerLeftList.appendChild(footerListUser);

        var footerRightList = footerLeftList.cloneNode();
        footerRightList.appendChild(footerListRT);
        footerRightList.appendChild(footerListFav);
        footerRightList.appendChild(footerListCreatedAt);
        footerRightList.appendChild(footerListSource);

        var footerLeft = document.createElement('div');
        footerLeft.setAttribute('class', 'card-footer-left');
        footerLeft.appendChild(footerLeftList);

        var footerRight = document.createElement('div');
        footerRight.setAttribute('class', 'card-footer-right');
        footerRight.appendChild(footerRightList);

        var footerEnd = document.createElement('div');
        footerEnd.setAttribute('style', 'clear:both');

        var footerDiv = document.createElement('div');
        footerDiv.setAttribute('class', 'card-footer');
        footerDiv.appendChild(footerLeft);
        footerDiv.appendChild(footerRight);
        footerDiv.appendChild(footerEnd);

        var div = document.createElement('div');
        div.setAttribute('class', 'card');
        div.appendChild(headerDiv);
        div.appendChild(bodyDiv);
        div.appendChild(footerDiv);

        fragment.appendChild(div);

        nbarCount += nbarPercentage;
        nbar.go(nbarCount);
      });

      container.appendChild(fragment);

      $('.card-header').dataBackground();
    });
  });
})();
