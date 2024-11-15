import React, { useState, useEffect } from "react";
import { ReactMic } from "react-mic";

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [savedTexts, setSavedTexts] = useState([]);
  const [blobURL, setBlobURL] = useState("");

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const startRecording = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = capitalizeFirstLetter(transcript);
      setTranscripts((prevTranscripts) => [...prevTranscripts, transcript]);
      sendText(transcript);
    };

    recognition.onspeechend = () => {
      stopRecording();
    };

    recognition.start();
    setRecognition(recognition);
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setRecording(false);
  };

  const sendText = (text) => {
    fetch("http://127.0.0.1:5000/save_text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data.message);
        fetchSavedTexts(); // Refresh the saved texts after saving a new one
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchSavedTexts = () => {
    fetch("http://127.0.0.1:5000/get_saved_text")
      .then((response) => response.json())
      .then((data) => {
        setSavedTexts(data.saved_text);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const onStop = (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
    setBlobURL(URL.createObjectURL(recordedBlob.blob));
    sendAudio(recordedBlob.blob);
  };

  const sendAudio = (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "recording.mp3");

    fetch("http://127.0.0.1:5000/save_audio", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data.message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    fetchSavedTexts();
  }, []);

  return (
    <div>
      <div className="buttons">
        <button onClick={startRecording} disabled={recording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Stop Recording
        </button>
      </div>
      <div className="mic-wrapper">
        <ReactMic
          record={recording}
          className="sound-wave"
          onStop={onStop}
          strokeColor="#FFFFFF"
          backgroundColor="#000000"
          mimeType="audio/mp3"
        />
      </div>
      <div>
        <h2>Transcript</h2>
        {transcripts.map((transcript, index) => (
          <p key={index}>{transcript}</p>
        ))}
        <h2>Saved Text</h2>
        {savedTexts.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
        {blobURL && (
          <div>
            <h2>Audio Recording</h2>
            <audio src={blobURL} controls="controls" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
