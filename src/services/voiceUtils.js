let audioContext;
let analyser;
let microphone;
let dataArray;
let speaking = false;

export function startSpeakingDetection(stream, onStart, onStop) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;

  microphone = audioContext.createMediaStreamSource(stream);
  microphone.connect(analyser);

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  const checkVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume =
      dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (volume > 20 && !speaking) {
      speaking = true;
      onStart();
    }

    if (volume < 10 && speaking) {
      speaking = false;
      onStop();
    }

    requestAnimationFrame(checkVolume);
  };

  checkVolume();
}

export function stopSpeakingDetection() {
  audioContext?.close();
  speaking = false;
}
