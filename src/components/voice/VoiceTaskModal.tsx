import { useEffect, useRef, useState } from "react";
import { Mic, X, CheckCircle, AlertCircle } from "lucide-react";
import { usePermissions } from "../../context/PermissionContext";

interface Props {
    open: boolean;
    onClose: () => void;
    onSendText: (text: string) => Promise<any>;
}

type Status = "listening" | "processing" | "success" | "error";

const SILENCE_DELAY = 1800;

const VoiceTaskModal = ({ open, onClose, onSendText }: Props) => {
    const { hasPermission } = usePermissions();
    const canAddTask = hasPermission("task", "add");

    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);

    const [status, setStatus] = useState<Status>("listening");
    const [liveText, setLiveText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [message, setMessage] = useState("");

    // 🔐 Hard block if no permission
    if (!canAddTask) return null;

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

        let finalTranscript = "";
        let isStopped = false;

        const startRecognition = () => {
            if (isStopped) return;

            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = "en-IN";
            recognition.continuous = false;   // ← restart per utterance, avoids drift
            recognition.interimResults = true;
            recognition.maxAlternatives = 3;  // ← pick best alternative below

            recognition.onstart = () => {
                if (finalTranscript === "") {
                    setStatus("listening");
                    setLiveText("");
                    setFinalText("");
                    setMessage("");
                }
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];

                    if (result.isFinal) {
                        // Pick the alternative with the highest confidence
                        let best = result[0];
                        for (let a = 1; a < result.length; a++) {
                            if (result[a].confidence > best.confidence) {
                                best = result[a];
                            }
                        }
                        finalTranscript += best.transcript + " ";
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                setLiveText(finalTranscript + interimTranscript);

                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(async () => {
                    isStopped = true;
                    recognition.stop();

                    const text = finalTranscript.trim();
                    if (!text) return;

                    setFinalText(text);
                    setStatus("processing");
                    if (!canAddTask) return;

                    try {
                        await onSendText(text);
                        setStatus("success");
                        setMessage("Task created successfully 🎉");
                        setTimeout(() => onClose(), 2500);
                    } catch {
                        setStatus("error");
                        setMessage("Something went wrong ");
                    }
                }, SILENCE_DELAY);
            };

            recognition.onerror = (event: any) => {
                // "no-speech" is not a real error — just restart
                if (event.error === "no-speech") {
                    startRecognition(); 
                    return;
                }
                setStatus("error");
                setMessage("Voice recognition error");
            };

            // Auto-restart on end (until silence timer fires)
            recognition.onend = () => {
                if (!isStopped) startRecognition();
            };

            recognition.start();
        };

        startRecognition();

        return () => {
            isStopped = true;
            recognitionRef.current?.stop();
            clearTimeout(silenceTimerRef.current);
            recognitionRef.current = null;
        };
    }, [open, canAddTask]);

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

                {/* TEXT DISPLAY */}
                {(liveText || finalText) && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded text-sm text-center">
                        {status === "listening" ? liveText : finalText}
                    </div>
                )}

                {message && (
                    <p className="mt-3 text-center text-sm text-slate-500">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VoiceTaskModal;