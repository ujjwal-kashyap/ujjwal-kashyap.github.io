chrome.runtime.onMessage.addListener(async request => {

  function handleSuccess(stream) {
    var videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using video device: ' + videoTracks[0].label);
    stream.oninactive = function() {
      console.log('Stream inactive');
    };
    window.stream = stream; // make variable available to browser console
    //video.srcObject = stream;

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

  // Put variables in global scope to make them available to the browser console.
  var constraints = window.constraints = {
    audio: false,
    video: true
  };

  navigator.mediaDevices.getDisplayMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);



  class File { /* write to disk */
    constructor(id = 'file:' + Math.random()) {
      this.id = id;
      this.opened = false;
    }
    async space(size) {
      const {quota, usage} = await navigator.storage.estimate();
      if (quota - usage < size) {
        throw Error(`FATAL: requested filesize is "${size}", but granted filesize is "${quota - usage}"`);
      }
    }
    async open() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.id, 1);
        request.onupgradeneeded = () => {
          // TODO - Remove this line when Firefox supports indexedDB.databases()
          if (('databases' in indexedDB) === false) {
            localStorage.setItem('file:' + this.id, true);
          }
          // storage for chunks
          request.result.createObjectStore('chunks', {
            keyPath: 'offset'
          });
          request.result.createObjectStore('meta', {
            autoIncrement: true
          });
        };
        request.onerror = e => reject(Error('File.open, ' + e.target.error));
        request.onsuccess = () => {
          this.db = request.result;
          this.opened = true;
          resolve();
        };
      });
    }
    meta(...objs) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('meta', 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onerror = e => reject(Error('File.meta, ' + e.target.error));
        for (const obj of objs) {
          transaction.objectStore('meta').add(obj);
        }
      });
    }
    properties() {
      // get data and convert to blob
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('meta', 'readonly');
        const store = transaction.objectStore('meta');
        const meta = store.getAll();
        meta.onsuccess = function() {
          resolve(meta.result);
        };
        meta.onerror = e => reject(Error('File.properties, ' + e.target.error));
      });
    }
    chunks(...objs) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction('chunks', 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onerror = e => reject(Error('File.chunks, ' + e.target.error));
        for (const obj of objs) {
          transaction.objectStore('chunks').add(obj);
        }
      });
    }
    async ranges() {
      let downloaded = 0;
      const objects = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction('chunks', 'readonly');
        const chunks = [];
        transaction.objectStore('chunks').openCursor().onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            chunks.push(cursor.value);
            cursor.continue();
          }
        };
        transaction.onerror = e => reject(Error('File.objects, ' + e.target.error));
        transaction.oncomplete = () => resolve(chunks);
      });

      const rRanges = objects.map(a => [a.offset, a.offset + a.buffer.byteLength]);
      rRanges.sort((a, b) => a[0] - b[0]);
      const ranges = [];
      if (rRanges.length === 0) {
        return {ranges, downloaded};
      }
      let start = rRanges[0][0];
      let end = rRanges[0][0];
      rRanges.forEach((range, i) => {
        downloaded += range[1] - range[0];
        if (end === range[0]) {
          end = range[1];
        }
        else {
          ranges.push([start, end - 1]);

          start = rRanges[i][0];
          end = rRanges[i + 1] ? rRanges[i + 1][0] : NaN;
        }
      });
      ranges.push([start, rRanges.pop()[1] - 1]);

      return {ranges, downloaded};
    }
    stream() {
      const chunks = [];
      let resolve;
      const transaction = this.db.transaction('chunks', 'readonly');
      const request = transaction.objectStore('chunks').openCursor();
      request.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          chunks.push(cursor.value.buffer);
          cursor.continue();
        }
        if (resolve) {
          resolve();
        }
      };
      transaction.onerror = e => {
        throw Error('File.stream, ' + e.target.error);
      };
      return new ReadableStream({
        pull(controller) {
          if (chunks.length) {
            controller.enqueue(chunks.shift());
          }
          else if (request.readyState === 'done') {
            controller.close();
          }
          else {
            return new Promise(r => resolve = r).then(() => {
              const chunk = chunks.shift();
              if (chunk) {
                controller.enqueue(chunk);
              }
              else {
                controller.close();
              }
            });
          }
        }
      }, {});
    }
    async download(filename = 'unknown', mime, started = () => {}) {
      const stream = this.stream();
      const response = new Response(stream, {
        headers: {
          'Content-Type': mime
        }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        chrome.downloads.download({
          url,
          filename
        }, id => {
          chrome.downloads.search({
            id
          }, ([d]) => started(d));
          function observe(d) {
            if (d.id === id && d.state) {
              if (d.state.current === 'complete' || d.state.current === 'interrupted') {
                chrome.downloads.onChanged.removeListener(observe);
                URL.revokeObjectURL(url);
                if (d.state.current === 'complete') {
                  chrome.downloads.search({id}, ([d]) => {
                    if (d) {
                      resolve(d);
                    }
                    else {
                      reject(Error('I am not able to find the downloaded file!'));
                    }
                  });
                }
                else {
                  reject(Error('The downloading job got interrupted'));
                }
              }
            }
          }
          chrome.downloads.onChanged.addListener(observe);
        });
      });
    }
    remove() {
      if (this.db) {
        this.db.close();
      }
      if (('databases' in indexedDB) === false) {
        localStorage.removeItem('file:' + this.id);
      }
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(this.id);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = e => reject(Error(e.target.error));
      });
    }
  }

});
