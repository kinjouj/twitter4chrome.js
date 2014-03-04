if (document.referrer.match(/oauth_consumer_key=([^&]+)/)) {
  if (RegExp.$1 === OAUTH_CONSUMER_KEY) {
    var pin = prompt("Enter the PIN displayed by Twitter");

    Twitter.verify(pin, function(isSuccess) {
      if (isSuccess === true) {
        alert("Authorized, woot!");
      }
    });
  }
}
