export const useVoiceTask = (onSuccess?: () => void) => {
  const startListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi + Hinglish
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      await fetch("/api/voice-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      onSuccess?.();
    };

    recognition.onerror = (err: any) => {
      console.error("Voice error", err);
    };

    recognition.start();
  };

  return { startListening };
};
