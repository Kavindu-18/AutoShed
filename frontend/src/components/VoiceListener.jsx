// /components/VoiceListener.jsx
import { useState, useRef } from "react";

export const useVoiceListener = (onCommandParsed) => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      console.log("Voice captured:", transcript);
      parseCommand(transcript);
    };
    recognition.onerror = (e) => {
      console.error(e);
      alert("Voice recognition error!");
    };
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const parseCommand = (text) => {
    try {
      const examinerMatch = text.match(/examiner\s*([a-zA-Z0-9]+)/i);
      const timeMatch = text.match(/at\s*(\d{1,2})(?:[:.]?(\d{0,2}))?\s*(AM|PM)?/i);
      const dateMatch = text.match(/on\s*(.*)/i);

      const examinerId = examinerMatch ? examinerMatch[1] : null;
      let hour = timeMatch ? parseInt(timeMatch[1]) : null;
      let minute = timeMatch && timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch && timeMatch[3];

      if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (ampm && ampm.toLowerCase() === 'am' && hour === 12) hour = 0;

      const spokenDate = dateMatch ? dateMatch[1] : "today";

      onCommandParsed({ examinerId, hour, minute, spokenDate });
    } catch (error) {
      console.error(error);
      alert("Could not understand command!");
    }
  };

  return { startListening, stopListening, listening };
};
