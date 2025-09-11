import React, { useState, useEffect, useRef } from 'react';
// --- IMPORTANT: Make sure Firebase is installed! ---
// In your terminal, run: npm install firebase
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    onSnapshot, 
    collection, 
    query, 
    orderBy, 
    addDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCukgVVzjjoDvqV2rMnA6wOi9KYPPv9mrg",
  authDomain: "precedent-pro.firebaseapp.com",
  projectId: "precedent-pro",
  storageBucket: "precedent-pro.firebasestorage.app",
  messagingSenderId: "587945946358",
  appId: "1:587945946358:web:19b1932f6369f8aab990d7",
  measurementId: "G-512QNGXYB6"
};
// --- END OF FIREBASE CONFIGURATION ---

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Icon Components ---
const PlusIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const SendIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>;
const MicIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m6 13.5v-1.5" /></svg>;
const GoogleIcon = () => <svg viewBox="0 0 48 48" className="w-5 h-5 mr-3"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.651 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>;

function App() {
    const [user, setUser] = useState(null);
    useEffect(() => onAuthStateChanged(auth, setUser), []);
    if (!user) return <LoginScreen />;
    return <ChatApplication user={user} />;
}

const LoginScreen = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        try { await signInWithPopup(auth, new GoogleAuthProvider()); } 
        catch (e) { setError(e.message); }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
            else await signInWithEmailAndPassword(auth, email, password);
        } catch (e) { setError(e.message.replace('Firebase: ', '')); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 font-sans">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">Precedent Pro</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Your AI Legal Assistant</p>
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">{isRegistering ? 'Register' : 'Sign In'}</button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-blue-600 hover:underline mb-6">{isRegistering ? 'Have an account? Sign In' : "No account? Register"}</button>
                <div className="flex items-center my-4"><hr className="flex-grow border-gray-300 dark:border-gray-600"/><span className="mx-4 text-gray-500 text-sm">OR</span><hr className="flex-grow border-gray-300 dark:border-gray-600"/></div>
                <button onClick={handleGoogleLogin} className="w-full py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-sm flex items-center justify-center font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <GoogleIcon /> Sign in with Google
                </button>
            </div>
        </div>
    );
};

const ChatApplication = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event) => setInput(event.results[0][0].transcript);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, `users/${user.uid}/history`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, snap => setMessages(snap.docs.map(doc => ({...doc.data(), id: doc.id}))));
        return () => unsubscribe();
    }, [user]);

    useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isLoading]);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setFilePreview(URL.createObjectURL(f));
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !file) || isLoading) return;
        
        const userInput = input;
        const fileToUpload = file;
        setInput(''); setFile(null); setFilePreview(null);
        setIsLoading(true);

        let fileUrl = null;
        if (fileToUpload) {
            const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${fileToUpload.name}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            fileUrl = await getDownloadURL(snapshot.ref);
        }

        const userMessage = { 
            text: userInput || `File uploaded: ${fileToUpload.name}`, 
            sender: 'user', 
            timestamp: serverTimestamp(),
            userName: user.displayName || user.email,
            photoURL: user.photoURL,
            fileUrl,
        };
        await addDoc(collection(db, `users/${user.uid}/history`), userMessage);
        
        try {
            // ** CRITICAL UPGRADE: Send previous messages for context **
            const historyForApi = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await fetch('https://precedent-pro-server.onrender.com/gemini', { // <-- YOUR RENDER URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    history: historyForApi, // Send the history
                    text: userInput, 
                    fileUrl 
                }),
            });

            if (!response.ok) throw new Error('Network response failed.');
            const data = await response.json();
            
            const botMessage = { text: data.analysis, sender: 'bot', timestamp: serverTimestamp() };
            await addDoc(collection(db, `users/${user.uid}/history`), botMessage);
        } catch (e) {
            console.error("Backend Error:", e);
            const errorMsg = { text: "Sorry, an error occurred. Please try again.", sender: 'bot', timestamp: serverTimestamp() };
            await addDoc(collection(db, `users/${user.uid}/history`), errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleMic = () => {
        if (!recognitionRef.current) return alert("Voice recognition not supported on this browser.");
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Sidebar user={user} />
            {/* Main Chat Area with Mobile-First design */}
            <main className="flex-1 flex flex-col h-screen">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />)}
                    {isLoading && <LoadingBubble />}
                    <div ref={chatEndRef} />
                </div>
                <InputArea {...{input, setInput, handleSend, isLoading, fileInputRef, handleFileChange, filePreview, setFilePreview, setFile, handleMic, isListening}} />
            </main>
        </div>
    );
};

// ** UPGRADED SIDEBAR: Hidden on mobile (md:flex) **
const Sidebar = ({ user }) => (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 p-4 flex-col hidden md:flex">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Precedent Pro</h1>
        <p className="text-sm text-gray-500 mb-6">AI Legal Assistant</p>
        <div className="flex-grow"><h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">History</h2></div>
        <div className="flex items-center gap-3 p-2 rounded-lg">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`} alt="User" className="w-10 h-10 rounded-full"/>
            <div className="flex-1 text-sm overflow-hidden">
                <p className="font-semibold truncate">{user.displayName || user.email}</p>
                <button onClick={() => signOut(auth)} className="text-xs text-red-500 hover:underline">Logout</button>
            </div>
        </div>
    </aside>
);

const ChatMessage = ({ msg }) => {
    const isUser = msg.sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">P</div>}
            <div className={`max-w-lg lg:max-w-2xl p-4 rounded-2xl shadow-md ${ isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.fileUrl && <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline mt-2 block break-all">View Uploaded File</a>}
            </div>
            {isUser && <img src={msg.photoURL || `https://ui-avatars.com/api/?name=${msg.userName}&background=6D28D9&color=fff`} alt="User" className="w-8 h-8 rounded-full shadow-md flex-shrink-0"/>}
        </div>
    );
};

const LoadingBubble = () => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">P</div>
        <div className="max-w-xl p-4 rounded-2xl shadow-md bg-white dark:bg-gray-700 rounded-bl-none">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
        </div>
    </div>
);

// ** UPGRADED INPUT AREA: Fixed position on mobile, better styling **
const InputArea = ({ input, setInput, handleSend, isLoading, fileInputRef, handleFileChange, filePreview, setFilePreview, setFile, handleMic, isListening }) => {
    const handleKeyPress = (e) => (e.key === 'Enter' && !e.shiftKey) && (e.preventDefault(), handleSend());
    return (
        <div className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-3xl mx-auto">
                {filePreview && (
                    <div className="mb-2 relative w-24"><img src={filePreview} alt="Preview" className="rounded-lg w-full h-auto" /><button onClick={() => { setFilePreview(null); setFile(null); }} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500">&times;</button></div>
                )}
                <div className="relative flex items-center">
                    <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mr-2"><PlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx"/>
                    <textarea className="flex-grow p-3 pr-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Ask Precedent Pro..." rows="1" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button onClick={handleMic} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}><MicIcon className="w-5 h-5" /></button>
                        <button onClick={handleSend} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors" disabled={isLoading || (!input.trim() && !filePreview)}><SendIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

