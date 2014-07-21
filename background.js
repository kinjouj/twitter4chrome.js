(function() {
  var twitter = new Twitter();
  twitter.authorize(function() {
    window.twitter = twitter;

    var wnd = null;

    chrome.browserAction.onClicked.addListener(function() {
      if (wnd === null) {
        chrome.windows.create(
          {
            url: "popup.html",
            width: 520,
            height: 800,
            type: 'panel'
          },
          function(w) {
            wnd = w;
          }
        );

        chrome.windows.onRemoved.addListener(function(id) {
          wnd = null;
        });
      } else {
      }
    });
    //chrome.browserAction.setPopup({ "popup": "popup.html" });
  });
})();
