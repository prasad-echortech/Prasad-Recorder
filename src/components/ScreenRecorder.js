// import React, { useState, useRef } from 'react';

// function ScreenRecorder() {
//   const [recording, setRecording] = useState(false);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const videoRef = useRef(null);

//   // Function to start recording
//   const startRecording = async () => {
//     try {
//       // Request screen capture stream from the browser
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true, // Optional: capture system audio if available
//       });

//       // Optional: Preview the live stream in a video element
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }

//       // Clear previous recordings
//       recordedChunksRef.current = [];

//       // Set up MediaRecorder with desired options
//       const options = { mimeType: "video/webm; codecs=vp9" };
//       const mediaRecorder = new MediaRecorder(stream, options);
//       mediaRecorderRef.current = mediaRecorder;

//       // When data is available, save it to our recorded chunks array
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           recordedChunksRef.current.push(event.data);
//         }
//       };

//       // When recording stops, create a Blob and generate a URL to display or download the video
//       mediaRecorder.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//         const url = URL.createObjectURL(blob);
//         setVideoUrl(url);
//         // Stop all tracks of the stream to free up resources
//         stream.getTracks().forEach(track => track.stop());
//       };

//       // Start recording
//       mediaRecorder.start();
//       setRecording(true);
//     } catch (err) {
//       console.error("Error: " + err);
//     }
//   };

//   // Function to stop recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Screen Recorder</h1>
//       <div>
//         {!recording && (
//           <button onClick={startRecording}>Start Recording</button>
//         )}
//         {recording && (
//           <button onClick={stopRecording}>Stop Recording</button>
//         )}
//       </div>
//       <div>
//         <h3>Live Preview</h3>
//         <video ref={videoRef} style={{ width: '400px' }} autoPlay muted></video>
//       </div>
//       {videoUrl && (
//         <div>
//           <h2>Recorded Video</h2>
//           <video src={videoUrl} controls style={{ width: '400px' }}></video>
//           <br />
//           <a href={videoUrl} download="recorded_video.webm">
//             Download Video
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ScreenRecorder;


import React, { useState, useRef } from 'react';

function ScreenRecorder() {
  // States to manage recording, pause, video URL, and elapsed time
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs to keep track of the MediaRecorder, video element, and timer
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Function to start recording
  const startRecording = async () => {
    try {
      // Request screen (and audio) capture from the browser
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Optionally, show the live stream in the video element for preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Clear previous recordings
      recordedChunksRef.current = [];

      // Set up MediaRecorder options (using a common mime type)
      const options = { mimeType: "video/webm; codecs=vp9" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // When data is available, save it into an array
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // When recording stops, create a Blob and generate a downloadable URL
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        // Stop all tracks to free system resources
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording and set up the timer
      mediaRecorder.start();
      setRecording(true);
      setElapsedTime(0);
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Error starting recording: ", err);
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerIntervalRef.current);
      setIsPaused(false);
    }
  };

  // Function to pause or resume recording
  const pauseOrResumeRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      } else if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Meeting Screen Recorder</h1>
      <div style={{ marginBottom: '20px' }}>
        {!recording && (
          <button onClick={startRecording} style={{ padding: '10px', marginRight: '10px' }}>
            Start Recording
          </button>
        )}
        {recording && (
          <>
            <button onClick={stopRecording} style={{ padding: '10px', marginRight: '10px' }}>
              Stop Recording
            </button>
            <button onClick={pauseOrResumeRecording} style={{ padding: '10px', marginRight: '10px' }}>
              {isPaused ? "Resume Recording" : "Pause Recording"}
            </button>
            <span>Recording Time: {elapsedTime} sec</span>
          </>
        )}
      </div>
      <div>
        <h3>Live Preview</h3>
        <video ref={videoRef} style={{ width: '600px', border: '1px solid #ccc' }} autoPlay muted></video>
      </div>
      {videoUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Recorded Video</h2>
          <video src={videoUrl} controls style={{ width: '600px', border: '1px solid #ccc' }}></video>
          <br />
          <a href={videoUrl} download="recorded_meeting.webm" style={{ marginTop: '10px', display: 'inline-block' }}>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}

export default ScreenRecorder;
