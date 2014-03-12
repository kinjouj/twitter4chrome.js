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

  var oauth = new OAuthClient();

  var Twitter = function() {};

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

                for (var key in tokens)
                  localStorage.setItem(key, tokens[key]);

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

  Twitter.prototype.home_timeline = function(options, cb) {
    if (_.isFunction(options) && (_.isNull(cb) || _.isUndefined(cb))) {
      cb = options;
      options = null;
    }

    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/statuses/home_timeline.json",
      options,
      cb
    );
  };

  Twitter.prototype.mentions = function(options, cb) {
    if (_.isFunction(options) && (_.isNull(cb) || _.isUndefined(cb))) {
      cb = options;
      options = null;
    }

    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/statuses/mentions_timeline.json",
      options,
      cb
    );
  };

  Twitter.prototype.favorites = function(options, cb) {
    if (_.isFunction(options) && (_.isNull(cb) || _.isUndefined(cb))) {
      cb = options;
      options = null;
    }

    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/favorites/list.json",
      options,
      cb
    );
  };

  Twitter.prototype.lists = function(options, cb) {
    if (_.isFunction(options) && (_.isNull(cb) || _.isUndefined(cb))) {
      cb = options;
      options = null;
    }

    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/lists/list.json",
      options,
      cb
    );
  };

  Twitter.prototype.list = function(options, cb) {
    if (_.isFunction(options) && (_.isNull(cb) || _.isUndefined(cb))) {
      cb = options;
      options = null;
    }

    oauth.getResponse(
      "GET",
      "https://api.twitter.com/1.1/lists/statuses.json",
      options,
      cb
    );
  };

  Twitter.prototype.create_favorites = function(id, cb) {
    oauth.getResponse(
      "POST",
      "https://api.twitter.com/1.1/favorites/create.json",
      { "id": id },
      cb
    );
  };

  Twitter.prototype.retweet = function(id, cb) {
    oauth.getResponse(
      "POST",
      "https://api.twitter.com/1.1/statuses/retweet/" + id + ".json",
      cb
    );
  };

  return Twitter;

})();
