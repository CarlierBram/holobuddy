// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html


/* globals MediaRecorder */

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var recorderVideo = document.querySelector('video#recorder');

var recordButton = document.querySelector('button#record');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
downloadButton.onclick = download;

// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' ||
        location.hostname === 'localhost';
if (!isSecureOrigin) {
    alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
            '\n\nChanging protocol to HTTPS');
    location.protocol = 'HTTPS';
}

var constraints = {
    audio: true,
    video: true
};

function handleSuccess(stream) {
    recordButton.disabled = false;
    window.stream = stream;
    recorderVideo.srcObject = stream;
}

function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
        then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
}


function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function toggleRecording() {
    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        downloadButton.disabled = false;
    }
}

function startRecording() {
    recordedBlobs = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = {mimeType: ''};
            }
        }
    }
    mediaRecorder = new MediaRecorder(window.stream, options);
    recordButton.textContent = 'Stop Recording';
    downloadButton.disabled = true;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
}

function stopRecording() {
    mediaRecorder.stop();
}

function download() {
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    var currentdate = new Date();
    a.download = currentdate.getDate() + "_" + (currentdate.getMonth() + 1) + "_" + currentdate.getFullYear() + "@" + currentdate.getHours() + "h" + currentdate.getMinutes() + '.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}
