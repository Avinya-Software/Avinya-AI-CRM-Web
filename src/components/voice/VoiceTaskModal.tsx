import { useEffect, useRef, useState } from "react";
import { Mic, X, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    onSendText: (text: string) => Promise<any>;
}

type Status = "listening" | "processing" | "success" | "error";

const SILENCE_DELAY = 1800; // ms (1.8 sec)

const VoiceTaskModal = ({ open, onClose, onSendText }: Props) => {
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);

    const [status, setStatus] = useState<Status>("listening");
    const [liveText, setLiveText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!open) return;

        const SpeechRecognition =
            (window as any).webkitSpeechRecognition ||
            (window as any).SpeechRecognition;

        if (!SpeechRecognition) {
            setStatus("error");
            setMessage("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = "en-IN";
        recognition.continuous = true;        // 🔥 IMPORTANT
        recognition.interimResults = true;    // 🔥 IMPORTANT

        recognition.onstart = () => {
            setStatus("listening");
            setLiveText("");
            setFinalText("");
            setMessage("");
        };

        recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            setLiveText(transcript);

            // 🔁 Reset silence timer on every word
            clearTimeout(silenceTimerRef.current);

            silenceTimerRef.current = setTimeout(async () => {
                recognition.stop(); // 🛑 user done speaking

                setFinalText(transcript);
                setStatus("processing");

                try {
                    const response = await onSendText(transcript);

                    setStatus("success");
                    setMessage("Task created successfully 🎉");

                    setTimeout(() => onClose(), 3500);
                } catch {
                    setStatus("error");
                    setMessage("Kuch galat ho gaya 😕");
                }
            }, SILENCE_DELAY);
        };

        recognition.onerror = () => {
            setStatus("error");
            setMessage("Voice recognition error");
        };

        recognition.start();

        return () => {
            recognition.stop();
            clearTimeout(silenceTimerRef.current);
            recognitionRef.current = null;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">

                {/* Close */}
                <button
                    onClick={() => {
                        recognitionRef.current?.stop();
                        clearTimeout(silenceTimerRef.current);
                        onClose();
                    }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X />
                </button>

                {/* ICON */}
                <div className="flex justify-center">
                    {status === "listening" && (
                        <div className="w-20 h-20 rounded-full bg-red-100 animate-pulse flex items-center justify-center">
                            <Mic size={36} className="text-red-600" />
                        </div>
                    )}

                    {status === "processing" && (
                        <div className="w-20 h-20 rounded-full bg-blue-100 animate-spin flex items-center justify-center">
                            🤖
                        </div>
                    )}

                    {status === "success" && (
                        <CheckCircle size={64} className="text-green-600" />
                    )}

                    {status === "error" && (
                        <AlertCircle size={64} className="text-red-500" />
                    )}
                </div>

                {/* STATUS */}
                <h2 className="mt-4 text-center text-xl font-semibold">
                    {status === "listening" && "Speak now… pause when you’re done"}
                    {status === "processing" && "Processing…"}
                    {status === "success" && "Done!"}
                    {status === "error" && "Error"}
                </h2>

                {/* LIVE TEXT */}
                {(liveText || finalText) && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded text-sm text-center">
                        {status === "listening" ? liveText : finalText}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceTaskModal;
