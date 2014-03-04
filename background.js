(function() {
  var twitter = new Twitter();
  twitter.authorize(function() {
    window.twitter = twitter;
    chrome.browserAction.setPopup({ "popup": "popup.html" });
  });
})();
