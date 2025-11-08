import { useState, useEffect, useRef } from 'react';
import { useVoiceRecording } from './hooks/useVoiceRecording';
import { getChatResponse } from './services/gemini';
import { textToSpeech } from './services/elevenlabs';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceRecording();
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const processTranscript = async () => {
      console.log('📝 Transcript changed:', transcript, 'Recording:', isRecording);
      // Only process if we have a new transcript, not recording, and haven't processed this exact transcript
      if (transcript && !isRecording && transcript !== lastProcessedTranscript) {
        console.log('✅ Processing new transcript:', transcript);
        setLastProcessedTranscript(transcript);
        handleUserMessage(transcript);
      }
    };
    processTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isRecording]);

  const handleUserMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessing) return;

    console.log('🎤 User message received:', userMessage);
    setIsProcessing(true);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Get AI response
      console.log('🤖 Requesting AI response...');
      const aiResponse = await getChatResponse(userMessage);
      console.log('✅ AI response received:', aiResponse);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);

      // Convert to speech and play
      console.log('🔊 Converting text to speech...');
      const audioUrl = await textToSpeech(aiResponse);
      console.log('✅ Audio URL generated:', audioUrl);
      
      if (audioRef.current) {
        console.log('🎵 Setting audio source and attempting to play...');
        audioRef.current.src = audioUrl;
        setIsPlayingAudio(true);
        try {
          await audioRef.current.play();
          console.log('✅ Audio playback started successfully!');
        } catch (playError) {
          console.error('❌ Audio play error:', playError);
        }
      } else {
        console.error('❌ Audio ref is null!');
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioEnded = () => {
    console.log('🔇 Audio playback ended');
    setIsPlayingAudio(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleMicMouseDown = () => {
    if (!isProcessing && !isPlayingAudio) {
      startRecording();
    }
  };

  const handleMicMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleMicTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isProcessing && !isPlayingAudio) {
      startRecording();
    }
  };

  const handleMicTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput);
      setTextInput('');
    }
  };

  const testAPIs = async () => {
    console.log('🧪 Testing API connections...');
    console.log('Gemini API Key:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('ElevenLabs API Key:', import.meta.env.VITE_ELEVENLABS_API_KEY ? '✅ Set' : '❌ Missing');
    
    try {
      await handleUserMessage('Hello, can you hear me?');
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  };

  return (
    <div className="app">
      <div className="mars-background"></div>
      <div className="container">
        <header className="header">
          <h1>🔴 MarBot</h1>
          <p>Your AI Guide to the Red Planet</p>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Welcome to MarBot! 🚀</h2>
                <p>Click the microphone and ask me anything about Mars!</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-bubble">
                  {message.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="message assistant">
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="controls">
            <div className="mic-container">
              {isRecording && <div className="recording-indicator"></div>}
              <button
                className={`mic-button ${isRecording ? 'recording' : ''} ${isProcessing || isPlayingAudio ? 'disabled' : ''}`}
                onMouseDown={handleMicMouseDown}
                onMouseUp={handleMicMouseUp}
                onMouseLeave={handleMicMouseUp}
                onTouchStart={handleMicTouchStart}
                onTouchEnd={handleMicTouchEnd}
                disabled={isProcessing || isPlayingAudio}
              >
                🎤
                <span className="pulse-ring"></span>
              </button>
            </div>
            <p className="status">
              {isRecording && '🔴 Recording... (Release to send)'}
              {isProcessing && 'Processing...'}
              {isPlayingAudio && 'Speaking...'}
              {!isRecording && !isProcessing && !isPlayingAudio && 'Hold to speak'}
            </p>
            
            {/* Text input for testing */}
            <form onSubmit={handleTextSubmit} className="text-input-form">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message to test..."
                className="text-input"
                disabled={isProcessing || isPlayingAudio}
              />
              <button type="submit" className="send-button" disabled={isProcessing || isPlayingAudio || !textInput.trim()}>
                Send
              </button>
            </form>
            
            <button onClick={testAPIs} className="test-button">
              🧪 Test APIs
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default App;
