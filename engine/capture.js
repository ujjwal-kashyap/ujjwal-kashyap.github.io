'use strict';

var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('video');

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  //video.srcObject = stream;

  //added
  (async () => {


    const file = new File();
    await file.open();
    const mediaRecorder = new MediaRecorder(stream, {
      mime: 'video/webm'
    });
    const capture = () => {
      mediaRecorder.requestData();
      capture.id = setTimeout(capture, 5000);
    };
    capture.offset = 0;
    capture.progress = 0;

    mediaRecorder.addEventListener('error', e => notify(e.message));
    mediaRecorder.addEventListener('dataavailable', e => {
      const download = () => {
        if (capture.progress === 0 && mediaRecorder.state === 'inactive') {

          file.download('capture.webm', 'video/webm').then(() => file.remove()).catch(e => {
            console.warn(e);
          });
        }
      };
      if (e.data.size) {
        capture.progress += 1;
        const reader = new FileReader();
        reader.onload = e => {
          file.chunks({
            offset: capture.offset,
            buffer: new Uint8Array(e.target.result)
          }).then(() => {
            capture.progress -= 1;
            download();
          });
        };
        reader.readAsArrayBuffer(e.data);
        capture.offset += 1;
      }
      else {
        download();
      }
    });
    stream.oninactive = stream.onremovetrack = stream.onended = () => {
      clearTimeout(capture.id);
      mediaRecorder.stop();
    };
    mediaRecorder.start();
    capture();

  })();
  //end
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getDisplayMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

navigator.mediaDevices.getDisplayMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);
