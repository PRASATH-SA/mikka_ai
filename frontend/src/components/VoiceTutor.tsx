import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, MessageSquare, Loader2, Zap, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const VoiceTutor: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, transcript]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.resultIndex][0].transcript;
        setTranscript(result);
        if (event.results[event.resultIndex].isFinal) {
          handleUserMessage(result);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (status === 'listening') setStatus('idle');
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setStatus('idle');
      };
    }
  }, [status]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (message: string) => {
    setHistory(prev => [...prev, { role: 'user', text: message }]);
    setTranscript('');
    setStatus('thinking');

    try {
      const { data } = await axios.post('http://localhost:8000/chat', { message });
      setHistory(prev => [...prev, { role: 'assistant', text: data.response }]);
      speak(data.response);
    } catch (error) {
      const errorMsg = "Connection error. Please check your backend.";
      setHistory(prev => [...prev, { role: 'assistant', text: errorMsg }]);
      speak(errorMsg);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus('listening');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-200 flex items-center justify-center p-4 font-inter">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden relative z-10 flex flex-col shadow-2xl border border-white/5"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Zap className="text-cyan-400" size={20} />
            </div>
            <div>
              <h1 className="font-orbitron font-bold tracking-wider text-xl text-white">MIKKA AI</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/60 font-semibold">AI Neural Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status !== 'idle' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{status}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 h-[400px] overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {history.length === 0 && !transcript && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500"
              >
                <div className="p-4 rounded-full bg-white/5">
                  <MessageSquare size={32} />
                </div>
                <p className="text-sm font-mono italic">Waiting for your input...<br/>Click the microphone to start.</p>
              </motion.div>
            )}

            {history.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-50 text-right' 
                  : 'bg-white/5 border border-white/10 text-slate-300'
                }`}>
                  <p className="font-mono text-[10px] opacity-40 uppercase tracking-tighter mb-1">
                    {msg.role === 'user' ? 'User' : 'MIKKA AI'}
                  </p>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {transcript && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 italic text-sm text-right">
                  “{transcript}”
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Visualizer / Status Area */}
        <div className="px-8 py-8 bg-gradient-to-t from-white/5 to-transparent flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Visualizer Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`absolute w-32 h-32 rounded-full border border-dashed ${status !== 'idle' ? 'border-cyan-500/50' : 'border-white/10'}`}
            />
            
            <button 
              onClick={toggleListening}
              disabled={status === 'thinking' || status === 'speaking'}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                isListening 
                ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:scale-105 active:scale-95'
              } disabled:opacity-50`}
            >
              {status === 'thinking' ? (
                <Loader2 className="animate-spin" size={32} />
              ) : isListening ? (
                <MicOff size={32} />
              ) : (
                <Mic size={32} />
              )}
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-mono font-medium tracking-widest text-slate-400">
              {status === 'listening' ? 'LISTENING TO YOUR VOICE...' : 
               status === 'thinking' ? 'PROCESSING NEURAL RESPONSE...' : 
               status === 'speaking' ? 'SYNTHESIZING AUDIO...' : 
               'READY FOR COMMAND'}
            </p>
            <div className="flex items-center justify-center gap-1 h-4">
              {status === 'listening' && [...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-cyan-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Terminal size={10} /> SYSTEM: ACTIVE</span>
            <span className="flex items-center gap-1 text-cyan-400/50">SECURE_LINK: YES</span>
          </div>
          <span>v1.0.4-BETA</span>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceTutor;
