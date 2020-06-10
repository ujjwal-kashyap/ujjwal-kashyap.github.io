'use strict';
chrome.runtime.sendMessage({action: "capture"}, function(response) {
  console.log(response.text);
});
