window.onload = function() {
  "use strict";

  let cvs = document.querySelector("canvas");
  let ctx = cvs.getContext("2d");
  let vdo = document.querySelector("video");
  let fps = 30;
  let vT = 10000;


  var videoStream = cvs.captureStream(fps);
  var mediaRecorder = new MediaRecorder(videoStream);

  var chunks = [];
  mediaRecorder.ondataavailable = function(e) {
    //console.log({e});
    chunks.push(e.data);
  };

  mediaRecorder.onstop = function(e) {
    var blob = new Blob(chunks, { 'type' : 'video/webm' }); // image/gif    video/mp4
    //console.log(blob);
    //console.log(chunks);
    chunks = [];
    var videoURL = URL.createObjectURL(blob);
    vdo.src = videoURL;
  };

  //vdo.srcObject = videoStream;

  mediaRecorder.start();
  animate(cvs,ctx);
  setTimeout(function (){ mediaRecorder.stop(); }, vT);
}


/*=============================================================================*/
/* Check Canvas Support
/*=============================================================================*/
/*var isCanvasSupported = function(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
};*/

/*=============================================================================*/
/* Setup requestAnimationFrame
/*=============================================================================*/
/*var setupRAF = function(){
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x){
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  };

  if(!window.requestAnimationFrame){
    window.requestAnimationFrame = function(callback, element){
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  };

  if (!window.cancelAnimationFrame){
    window.cancelAnimationFrame = function(id){
      clearTimeout(id);
    };
  };
};*/
