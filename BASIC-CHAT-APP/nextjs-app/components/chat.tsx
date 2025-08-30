"use client";

import { useState, useEffect, useRef } from "react";

export function Chat() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [error, setError] = useState<string>("");

  const [theme, setTheme] = useState<string>("dark"); // To handle theme switching
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user" as const, text: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "bot", text: data.message }]);
        setError("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Function to change theme
  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    document.documentElement.className = theme;
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          {/* Corrected image path */}
          <img
            src="/Gemini_Generated_Image_u29zs9u29zs9u29z.png" // Path relative to 'public' folder
            alt="Logo"
          />
        </div>
        <button>+ New Chat</button>
        <div className="menu">
          <p>Chat History</p>
          <a href="#">Sample Conversation 1</a>
          <a href="#">Sample Conversation 2</a>
          <a href="#">Sample Conversation 3</a>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">ChatBot 💬</div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.role === "user" ? "user-message" : "assistant-message"}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="typing-indicator">
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        <div className="input-container">
          <input
            type="text"
            placeholder="Ask me anything..."
            disabled={loading}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Theme Selector */}
        <div className="theme-selector">
          <label htmlFor="light">Light</label>
          <input
            type="radio"
            id="light"
            name="theme"
            checked={theme === "light"}
            onChange={() => handleThemeChange("light")}
          />
          <label htmlFor="dark">Dark</label>
          <input
            type="radio"
            id="dark"
            name="theme"
            checked={theme === "dark"}
            onChange={() => handleThemeChange("dark")}
          />
        </div>
      </div>
    </div>
  );
}
