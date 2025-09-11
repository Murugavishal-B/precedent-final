import React, { useState, useEffect, useRef } from 'react';

// --- Icon Components (using inline SVG for simplicity) ---
const MicIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
        P
    </div>
);

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
        U
    </div>
);

// --- Main App ---
function App() {
  const [messages, setMessages] = useState([
    { text: "Welcome to Precedent Pro. Paste a legal clause or ask me a question about a legal process.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      }
    }
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await fetch('https://precedent-pro-server.onrender.com/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: userMessage.text }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        
        // The backend sends back a string. We can make this more structured later.
        const botMessage = { text: data.analysis, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);

    } catch (error) {
        console.error("Failed to fetch from backend:", error);
        const errorMessage = { text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.", sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Sorry, your browser doesn't support voice recognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar for Chat History */}
      <aside className="w-64 bg-gray-50 dark:bg-gray-800 p-4 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Precedent Pro</h1>
        <p className="text-sm text-gray-500 mb-6">Your Legal AI Assistant</p>
        <div className="flex-grow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">History</h2>
          {/* Mock History Item */}
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm cursor-pointer">
            Non-Compete Clause Analysis
          </div>
        </div>
        <div className="text-xs text-gray-400">&copy; 2025 Gen AI Hackathon</div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <BotIcon />}
              <div
                className={`max-w-xl p-4 rounded-2xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === 'user' && <UserIcon />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <BotIcon />
              <div className="max-w-xl p-4 rounded-2xl shadow-md bg-white dark:bg-gray-700 rounded-bl-none">
                 <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                 </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="relative max-w-3xl mx-auto">
            <textarea
              className="w-full p-4 pr-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Analyze a clause or ask a question..."
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button onClick={handleMicClick} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} transition-colors`}>
                <MicIcon className="w-6 h-6" />
              </button>
              <button onClick={handleSend} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors" disabled={isLoading || !input.trim()}>
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
