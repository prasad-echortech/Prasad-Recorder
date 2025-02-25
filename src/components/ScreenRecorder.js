// import React, { useState, useRef } from 'react';

// function ScreenRecorder() {
//   // States to manage recording, pause, video URL, and elapsed time
//   const [recording, setRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [elapsedTime, setElapsedTime] = useState(0);

//   // Refs to keep track of the MediaRecorder, video element, and timer
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const videoRef = useRef(null);
//   const timerIntervalRef = useRef(null);

//   // Function to start recording
//   const startRecording = async () => {
//     try {
//       // Request screen (and audio) capture from the browser
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true,
//       });

//       // Optionally, show the live stream in the video element for preview
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }

//       // Clear previous recordings
//       recordedChunksRef.current = [];

//       // Set up MediaRecorder options (using a common mime type)
//       const options = { mimeType: "video/webm; codecs=vp9" };
//       const mediaRecorder = new MediaRecorder(stream, options);
//       mediaRecorderRef.current = mediaRecorder;

//       // When data is available, save it into an array
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           recordedChunksRef.current.push(event.data);
//         }
//       };

//       // When recording stops, create a Blob and generate a downloadable URL
//       mediaRecorder.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//         const url = URL.createObjectURL(blob);
//         setVideoUrl(url);
//         // Stop all tracks to free system resources
//         stream.getTracks().forEach(track => track.stop());
//       };

//       // Start recording and set up the timer
//       mediaRecorder.start();
//       setRecording(true);
//       setElapsedTime(0);
//       const startTime = Date.now();
//       timerIntervalRef.current = setInterval(() => {
//         setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
//       }, 1000);
//     } catch (err) {
//       console.error("Error starting recording: ", err);
//     }
//   };

//   // Function to stop recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       clearInterval(timerIntervalRef.current);
//       setIsPaused(false);
//     }
//   };

//   // Function to pause or resume recording
//   const pauseOrResumeRecording = () => {
//     if (mediaRecorderRef.current) {
//       if (mediaRecorderRef.current.state === "recording") {
//         mediaRecorderRef.current.pause();
//         setIsPaused(true);
//       } else if (mediaRecorderRef.current.state === "paused") {
//         mediaRecorderRef.current.resume();
//         setIsPaused(false);
//       }
//     }
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h1>Meeting Screen Recorder</h1>
//       <div style={{ marginBottom: '20px' }}>
//         {!recording && (
//           <button onClick={startRecording} style={{ padding: '10px', marginRight: '10px' }}>
//             Start Recording
//           </button>
//         )}
//         {recording && (
//           <>
//             <button onClick={stopRecording} style={{ padding: '10px', marginRight: '10px' }}>
//               Stop Recording
//             </button>
//             <button onClick={pauseOrResumeRecording} style={{ padding: '10px', marginRight: '10px' }}>
//               {isPaused ? "Resume Recording" : "Pause Recording"}
//             </button>
//             <span>Recording Time: {elapsedTime} sec</span>
//           </>
//         )}
//       </div>
//       <div>
//         <h3>Live Preview</h3>
//         <video ref={videoRef} style={{ width: '600px', border: '1px solid #ccc' }} autoPlay muted></video>
//       </div>
//       {videoUrl && (
//         <div style={{ marginTop: '20px' }}>
//           <h2>Recorded Video</h2>
//           <video src={videoUrl} controls style={{ width: '600px', border: '1px solid #ccc' }}></video>
//           <br />
//           <a href={videoUrl} download="recorded_meeting.webm" style={{ marginTop: '10px', display: 'inline-block' }}>
//             Download Video
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ScreenRecorder;


// v2

// import React, { useState, useRef } from 'react';
// import { jsPDF } from "jspdf"; // Ensure you've installed jsPDF

// function ScreenRecorder() {
//   // States for recording, pause status, video URL, elapsed time, and conversation transcript.
//   const [recording, setRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [message, setMessage] = useState("");
//   const [transcript, setTranscript] = useState([]); // Array of conversation lines

//   // Refs for media recorder, recorded chunks, video element, and timer
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const videoRef = useRef(null);
//   const timerIntervalRef = useRef(null);

//   // Function to start recording. Also clears old video preview and transcript.
//   const startRecording = async () => {
//     try {
//       // Clear previous video and transcript
//       setVideoUrl(null);
//       setTranscript([]);

//       // Request screen (and audio) capture from the browser
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: true,
//         audio: true,
//       });

//       // Show the live stream in the video element for preview
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }

//       // Clear previous recordings
//       recordedChunksRef.current = [];

//       // Set up MediaRecorder options
//       const options = { mimeType: "video/webm; codecs=vp9" };
//       const mediaRecorder = new MediaRecorder(stream, options);
//       mediaRecorderRef.current = mediaRecorder;

//       // Save data chunks as they become available
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           recordedChunksRef.current.push(event.data);
//         }
//       };

//       // When recording stops, generate a Blob and create a downloadable URL
//       mediaRecorder.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//         const url = URL.createObjectURL(blob);
//         setVideoUrl(url);
//         // Stop all tracks to free system resources
//         stream.getTracks().forEach(track => track.stop());
//       };

//       // Start recording and set up the timer
//       mediaRecorder.start();
//       setRecording(true);
//       setIsPaused(false);
//       setElapsedTime(0);
//       const startTime = Date.now();
//       timerIntervalRef.current = setInterval(() => {
//         setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
//       }, 1000);
//     } catch (err) {
//       console.error("Error starting recording: ", err);
//     }
//   };

//   // Function to stop recording
//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       setIsPaused(false);
//       clearInterval(timerIntervalRef.current);
//     }
//   };

//   // Function to pause or resume recording
//   const pauseOrResumeRecording = () => {
//     if (mediaRecorderRef.current) {
//       if (mediaRecorderRef.current.state === "recording") {
//         mediaRecorderRef.current.pause();
//         setIsPaused(true);
//       } else if (mediaRecorderRef.current.state === "paused") {
//         mediaRecorderRef.current.resume();
//         setIsPaused(false);
//       }
//     }
//   };

//   // Add a new conversation message to the transcript
//   const addMessage = () => {
//     if (message.trim() !== "") {
//       setTranscript([...transcript, message.trim()]);
//       setMessage("");
//     }
//   };

//   // Download the transcript as a PDF file using jsPDF
//   const downloadTranscriptPDF = () => {
//     if (transcript.length === 0) return;
//     const doc = new jsPDF();
//     doc.setFontSize(12);
//     let y = 10;
//     transcript.forEach((line) => {
//       doc.text(line, 10, y);
//       y += 10;
//     });
//     doc.save("transcript.pdf");
//   };

//   return (
//     <div style={{
//       padding: '20px',
//       fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
//       background: 'linear-gradient(135deg, #4b79a1, #283e51)',
//       minHeight: '100vh',
//       color: '#f0f0f0'
//     }}>
//       <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Meeting Screen Recorder</h1>
//       <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//         {!recording ? (
//           <button onClick={startRecording} style={{
//             padding: '12px 24px',
//             fontSize: '16px',
//             marginRight: '10px',
//             border: 'none',
//             borderRadius: '5px',
//             backgroundColor: '#00bcd4',
//             color: '#fff',
//             cursor: 'pointer'
//           }}>
//             Start Recording
//           </button>
//         ) : (
//           <>
//             <button onClick={stopRecording} style={{
//               padding: '12px 24px',
//               fontSize: '16px',
//               marginRight: '10px',
//               border: 'none',
//               borderRadius: '5px',
//               backgroundColor: '#e91e63',
//               color: '#fff',
//               cursor: 'pointer'
//             }}>
//               Stop Recording
//             </button>
//             <button onClick={pauseOrResumeRecording} style={{
//               padding: '12px 24px',
//               fontSize: '16px',
//               marginRight: '10px',
//               border: 'none',
//               borderRadius: '5px',
//               backgroundColor: '#ff9800',
//               color: '#fff',
//               cursor: 'pointer'
//             }}>
//               {isPaused ? "Resume" : "Pause"}
//             </button>
//             <span style={{ fontSize: '18px', marginLeft: '10px' }}>Recording Time: {elapsedTime} sec</span>
//           </>
//         )}
//       </div>
//       <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//         <h3>Live Preview</h3>
//         <video ref={videoRef} style={{
//           width: '80%',
//           maxWidth: '800px',
//           border: '4px solid #fff',
//           borderRadius: '8px',
//           boxShadow: '0px 4px 12px rgba(0,0,0,0.3)'
//         }} autoPlay muted></video>
//       </div>
//       {videoUrl && (
//         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//           <h2>Recorded Video</h2>
//           <video src={videoUrl} controls style={{
//             width: '80%',
//             maxWidth: '800px',
//             border: '4px solid #fff',
//             borderRadius: '8px',
//             boxShadow: '0px 4px 12px rgba(0,0,0,0.3)'
//           }}></video>
//           <br />
//           <a href={videoUrl} download="recorded_meeting.webm" style={{
//             display: 'inline-block',
//             marginTop: '10px',
//             padding: '12px 24px',
//             backgroundColor: '#4caf50',
//             color: '#fff',
//             textDecoration: 'none',
//             borderRadius: '5px'
//           }}>
//             Download Video
//           </a>
//         </div>
//       )}
//       <div style={{
//         margin: '20px auto',
//         width: '80%',
//         maxWidth: '800px',
//         padding: '20px',
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         borderRadius: '8px'
//       }}>
//         <h2 style={{ textAlign: 'center' }}>Conversation Transcript</h2>
//         <div style={{
//           maxHeight: '200px',
//           overflowY: 'auto',
//           backgroundColor: '#fff',
//           color: '#000',
//           padding: '10px',
//           borderRadius: '4px',
//           marginBottom: '10px'
//         }}>
//           {transcript.length > 0 ? (
//             transcript.map((line, index) => (
//               <p key={index} style={{ margin: '5px 0' }}>{line}</p>
//             ))
//           ) : (
//             <p style={{ color: '#555' }}>No conversation yet...</p>
//           )}
//         </div>
//         <div style={{ display: 'flex', marginBottom: '10px' }}>
//           <input 
//             type="text" 
//             placeholder='Enter message (e.g., "me: hi", "other: hello")'
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             style={{
//               flex: '1',
//               padding: '10px',
//               borderRadius: '4px',
//               border: '1px solid #ccc',
//               marginRight: '10px'
//             }}
//           />
//           <button onClick={addMessage} style={{
//             padding: '10px 20px',
//             border: 'none',
//             borderRadius: '4px',
//             backgroundColor: '#00bcd4',
//             color: '#fff',
//             cursor: 'pointer'
//           }}>
//             Add
//           </button>
//         </div>
//         <div style={{ textAlign: 'center' }}>
//           <button onClick={downloadTranscriptPDF} style={{
//             padding: '10px 20px',
//             border: 'none',
//             borderRadius: '4px',
//             backgroundColor: '#4caf50',
//             color: '#fff',
//             cursor: 'pointer'
//           }}>
//             Download Transcript as PDF
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ScreenRecorder;

import React, { useState, useRef } from 'react';

function ScreenRecorder() {
  // States for recording, pause status, video URL, and elapsed time.
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs for MediaRecorder, recorded chunks, video element, and timer.
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Function to start recording. It clears any previously recorded video.
  const startRecording = async () => {
    try {
      // Clear previous video preview.
      setVideoUrl(null);

      // Request screen (and audio) capture from the browser.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Show live preview.
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Clear previous recordings.
      recordedChunksRef.current = [];

      // Set up MediaRecorder with a common mime type.
      const options = { mimeType: "video/webm; codecs=vp9" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Save data chunks as they become available.
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // When recording stops, create a Blob and generate a downloadable URL.
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        // Stop all tracks to free system resources.
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording and set up a timer.
      mediaRecorder.start();
      setRecording(true);
      setIsPaused(false);
      setElapsedTime(0);
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Error starting recording: ", err);
    }
  };

  // Function to stop recording.
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setIsPaused(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Function to pause or resume recording.
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
    <div style={{
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: 'linear-gradient(135deg, #4b79a1, #283e51)',
      minHeight: '100vh',
      color: '#f0f0f0'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Meeting Screen Recorder</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {!recording ? (
          <button onClick={startRecording} style={{
            padding: '12px 24px',
            fontSize: '16px',
            marginRight: '10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#00bcd4',
            color: '#fff',
            cursor: 'pointer'
          }}>
            Start Recording
          </button>
        ) : (
          <>
            <button onClick={stopRecording} style={{
              padding: '12px 24px',
              fontSize: '16px',
              marginRight: '10px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#e91e63',
              color: '#fff',
              cursor: 'pointer'
            }}>
              Stop Recording
            </button>
            <button onClick={pauseOrResumeRecording} style={{
              padding: '12px 24px',
              fontSize: '16px',
              marginRight: '10px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#ff9800',
              color: '#fff',
              cursor: 'pointer'
            }}>
              {isPaused ? "Resume" : "Pause"}
            </button>
            <span style={{ fontSize: '18px', marginLeft: '10px' }}>
              Recording Time: {elapsedTime} sec
            </span>
          </>
        )}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>Live Preview</h3>
        <video ref={videoRef} style={{
          width: '80%',
          maxWidth: '800px',
          border: '4px solid #fff',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.3)'
        }} autoPlay muted></video>
      </div>
      {videoUrl && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>Recorded Video</h2>
          <video src={videoUrl} controls style={{
            width: '80%',
            maxWidth: '800px',
            border: '4px solid #fff',
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)'
          }}></video>
          <br />
          <a href={videoUrl} download="recorded_meeting.webm" style={{
            display: 'inline-block',
            marginTop: '10px',
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px'
          }}>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}

export default ScreenRecorder;
