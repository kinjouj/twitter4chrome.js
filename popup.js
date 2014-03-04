(function() {
  chrome.runtime.getBackgroundPage(function(page) {
    var twitter = page.twitter;
    twitter.home_timeline(function(tweets) {
      var container = document.querySelector('#container');
      var fragment = document.createDocumentFragment();

      /*
      <div class="card">
        <div class="card-image" data-background="{background_image_url}">
        </div>
        <div class="card-body">
          <p>{text}</p>
        </div>
      </div>
      */

      tweets.forEach(function(tweet) {
        if ('retweeted_status' in tweet)
          tweet = tweet.retweeted_status;

        var profileBackgroundImageUrl = tweet.user.profile_background_image_url_https;
        var profileImageUrl = tweet.user.profile_image_url_https;

        var img = document.createElement('img');
        img.setAttribute('src', profileImageUrl);

        var imgDiv = document.createElement('div');
        imgDiv.setAttribute('class', 'card-image');
        imgDiv.setAttribute('data-background', profileBackgroundImageUrl);
        imgDiv.appendChild(img);

        var p = document.createElement('p');
        p.innerText = tweet.text;

        var bodyDiv = document.createElement('div');
        bodyDiv.setAttribute('class', 'card-body');
        bodyDiv.appendChild(p);

        var div = document.createElement('div');
        div.setAttribute('class', 'card');
        div.appendChild(imgDiv);
        div.appendChild(bodyDiv);

        div.addEventListener('click', function() {
          window.open('https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str);
        });

        fragment.appendChild(div);
      });

      container.appendChild(fragment);

      $('.card-image').dataBackground();
    });
  });
})();
