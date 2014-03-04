var Twitter = (function() {

  var parseToken = function(tokenString) {
    if (!_.isString(tokenString))
      throw new Error("tokenString isn`t a string");

    var token = {};
    _.each(tokenString.split('&'), function(kvString) {
      var kv = kvString.split('=');
      if (kv.length === 2) token[kv[0]] = kv[1];
    });

    return token;
  };

  var oauth;

  var Twitter = function() {
    oauth = new OAuthClient();
  };

  Twitter.prototype.authorize = function(cb) {
    if (oauth.isAuthenticated()) {
      cb();
    } else {
      oauth.getResponse(
        "GET",
        "https://api.twitter.com/oauth/request_token",
        function(tokenString) {
          var tokens = parseToken(tokenString);
          var token = tokens.oauth_token;
          var tokenSecret = tokens.oauth_token_secret;

          var authorizeUrl = oauth.buildRequestURL(
            "GET",
            "https://api.twitter.com/oauth/authorize",
            {
              "oauth_token": token,
              "accessor": { "tokenSecret": tokenSecret }
            }
          );

          var listener = function(req, sender, res) {
            chrome.runtime.onMessage.removeListener(listener);

            var verifier = req.verifier;
            oauth.getResponse(
              "GET",
              "https://api.twitter.com/oauth/access_token",
              {
                "oauth_token": token,
                "oauth_verifier": verifier,
                "accessor": { "tokenSecret": tokenSecret }
              },
              function(tokenString) {
                var tokens = parseToken(tokenString);

                for (var key in tokens) {
                  localStorage.setItem(key, tokens[key]);
                }

                res(true);
                cb();
              }
            );

            return true;
          };
          chrome.runtime.onMessage.addListener(listener);

          window.open(authorizeUrl);
        }
      );
    }
  };

  Twitter.prototype.home_timeline = function(cb) {
    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/statuses/home_timeline.json",
      cb
    );
  };

  return Twitter;

})();
