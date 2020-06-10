'use strict';
chrome.runtime.sendMessage('capture',{action: "capture"}, function(response) {
  console.log(response.text);
});
