import React, { useState, useEffect, useRef } from "react";
import {
  initializeApp
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// --- FIREBASE CONFIG (replace with yours) ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- ICONS ---
const PlusIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const SendIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  </svg>
);
const MicIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m6 13.5v-1.5"
    />
  </svg>
);

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (!user) return <LoginScreen />;
  return <ChatApplication user={user} />;
}

// --- LOGIN ---
const LoginScreen = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering)
        await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 p-4 font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center">
          Precedent Pro
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Your AI Legal Assistant
        </p>
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {isRegistering ? "Register" : "Sign In"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          {isRegistering
            ? "Have an account? Sign In"
            : "No account? Register"}
        </button>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="mx-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-gray-100 dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow flex items-center justify-center font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <span className="mr-2">🔑</span> Sign in with Google
        </button>
      </div>
    </div>
  );
};

// --- CHAT APP ---
const ChatApplication = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/history`),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, isLoading]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput("");
    setIsLoading(true);

    const userMessage = {
      text,
      sender: "user",
      timestamp: serverTimestamp(),
      userName: user.displayName || user.email,
      photoURL: user.photoURL,
    };
    await addDoc(collection(db, `users/${user.uid}/history`), userMessage);

    try {
      const response = await fetch("https://precedent-pro-server.onrender.com/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Network error");
      const data = await response.json();

      const botMessage = {
        text: data.analysis,
        sender: "bot",
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, `users/${user.uid}/history`), botMessage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col">
        <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="font-bold text-lg text-blue-600 dark:text-blue-400">
            Precedent Pro
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {isLoading && <LoadingBubble />}
          <div ref={chatEndRef} />
        </div>
        <InputArea
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

const Sidebar = ({ user }) => (
  <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 hidden md:flex flex-col">
    <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
      Precedent Pro
    </h1>
    <div className="flex-grow" />
    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
      <img
        src={
          user.photoURL ||
          `https://ui-avatars.com/api/?name=${user.email}&background=0D8ABC&color=fff`
        }
        alt="User"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 text-sm">
        <p className="font-semibold truncate">{user.displayName || user.email}</p>
        <button
          onClick={() => signOut(auth)}
          className="text-xs text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  </aside>
);

const ChatMessage = ({ msg }) => {
  const isUser = msg.sender === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          P
        </div>
      )}
      <div
        className={`max-w-lg p-3 rounded-2xl shadow ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </div>
      {isUser && (
        <img
          src={
            msg.photoURL ||
            `https://ui-avatars.com/api/?name=${msg.userName}&background=6D28D9&color=fff`
          }
          alt="User"
          className="w-8 h-8 rounded-full"
        />
      )}
    </div>
  );
};

const LoadingBubble = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
      P
    </div>
    <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl">
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  </div>
);

const InputArea = ({ input, setInput, handleSend, isLoading }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <textarea
          className="flex-grow p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Ask Precedent Pro..."
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default App;
