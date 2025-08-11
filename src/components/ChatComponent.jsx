import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  User,
  GraduationCap,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
  Loader,
} from "lucide-react";
import ChatService from "../service/ChatServiceCopy";

const ChatComponent = ({
  examId,
  studentId,
  studentName,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [teacherTyping, setTeacherTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const connectionAttemptRef = useRef(false);

  // Load chat history when component opens
  useEffect(() => {
    if (isOpen && examId && studentId && !loadingHistory) {
      loadChatHistory();
    }
  }, [isOpen, examId, studentId]);

  // WebSocket connection management
  useEffect(() => {
    if (isOpen && examId && studentId && !connectionAttemptRef.current) {
      connectionAttemptRef.current = true;
      const token = localStorage.getItem("token");

      if (!token) {
        setConnectionError("Authentication token not found");
        connectionAttemptRef.current = false;
        return;
      }

      // Setup event listeners
      ChatService.on("connected", handleConnected);
      ChatService.on("disconnected", handleDisconnected);
      ChatService.on("message", handleMessage);
      ChatService.on("typing", handleIncomingTyping);
      ChatService.on("error", handleError);

      // Connect to chat with proper async handling
      setConnecting(true);
      ChatService.connect(examId, studentId, token)
        .then(() => {
          console.log("Chat connection established");
        })
        .catch((error) => {
          console.error("Failed to connect to chat:", error);
          setConnectionError("Failed to connect to chat server");
        })
        .finally(() => {
          setConnecting(false);
          connectionAttemptRef.current = false;
        });

      return () => {
        // Cleanup event listeners
        ChatService.off("connected", handleConnected);
        ChatService.off("disconnected", handleDisconnected);
        ChatService.off("message", handleMessage);
        ChatService.off("typing", handleIncomingTyping);
        ChatService.off("error", handleError);
        connectionAttemptRef.current = false;
      };
    }

    return () => {
      if (!isOpen) {
        ChatService.disconnect();
        connectionAttemptRef.current = false;
      }
    };
  }, [isOpen, examId, studentId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear unread count when chat is opened/maximized
  useEffect(() => {
    if (!isMinimized && isOpen) {
      setUnreadCount(0);
    }
  }, [isMinimized, isOpen]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      setConnectionError(null);

      const history = await ChatService.getChatHistory(examId, studentId);

      const formattedMessages = history.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        senderName: msg.senderName,
        senderType: msg.senderType,
        timestamp: msg.timestamp,
        isOwn: msg.sender === studentId.toString(),
        messageType: msg.messageType,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setConnectionError("Failed to load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConnected = () => {
    console.log("Chat connected");
    setIsConnected(true);
    setConnectionError(null);
    setConnecting(false);
  };

  const handleDisconnected = () => {
    console.log("Chat disconnected");
    setIsConnected(false);
    setConnecting(false);
  };

  const handleMessage = (messageData) => {
    // Handle different message types
    if (
      messageData.messageType === "system" ||
      messageData.senderType === "system"
    ) {
      // System messages - only log, don't show to user unless it's important
      if (
        messageData.content &&
        !messageData.content.includes("joined the chat")
      ) {
        console.log("System message:", messageData.content);
      }
      return; // Don't show join/leave messages to users
    }

    // Handle error messages
    if (messageData.messageType === "error") {
      setConnectionError(messageData.content);
      return;
    }

    const formattedMessage = {
      id: messageData.id || Date.now() + Math.random(),
      content: messageData.content,
      sender: messageData.sender,
      senderName: messageData.senderName,
      senderType: messageData.senderType,
      timestamp: messageData.timestamp,
      isOwn: messageData.sender === studentId.toString(),
      messageType: messageData.messageType || "message",
    };

    setMessages((prev) => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(
        (msg) =>
          msg.id === formattedMessage.id ||
          (msg.content === formattedMessage.content &&
            msg.sender === formattedMessage.sender &&
            Math.abs(
              new Date(msg.timestamp) - new Date(formattedMessage.timestamp)
            ) < 1000)
      );
      if (exists) return prev;

      return [...prev, formattedMessage];
    });

    // Handle unread count
    if (isMinimized && messageData.sender !== studentId.toString()) {
      setUnreadCount((prev) => prev + 1);
    }

    // Clear teacher typing when message received
    if (
      messageData.senderType === "teacher" ||
      messageData.senderType === "admin"
    ) {
      setTeacherTyping(false);
    }
  };

  const handleIncomingTyping = (typingData) => {
    // Only show typing indicator for other users
    if (typingData.sender !== studentId.toString()) {
      setTeacherTyping(typingData.isTyping);

      // Auto-clear typing indicator after 5 seconds
      if (typingData.isTyping) {
        setTimeout(() => {
          setTeacherTyping(false);
        }, 5000);
      }
    }
  };

  const handleError = (error) => {
    console.error("Chat error:", error);
    setConnectionError(error);
    setConnecting(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    const messageContent = newMessage.trim();
    if (!messageContent) {
      return;
    }

    if (!ChatService.isConnected()) {
      setConnectionError("Not connected to chat server");
      return;
    }

    const success = ChatService.sendMessage(messageContent);
    if (success) {
      setNewMessage("");

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        ChatService.sendTyping(false);
      }
    } else {
      setConnectionError("Failed to send message. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      ChatService.sendTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
      ChatService.sendTyping(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (e.target.value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          ChatService.sendTyping(false);
        }
      }, 3000); // Stop typing after 3 seconds of inactivity
    }
  };

  const formatTime = (timestamp) => {
    try {
      // Handle both string and Date objects
      const date =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid time";
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const retryConnection = () => {
    if (connectionAttemptRef.current) {
      return; // Already attempting to connect
    }

    setConnectionError(null);
    setConnecting(true);
    connectionAttemptRef.current = true;

    const token = localStorage.getItem("token");
    if (token && examId && studentId) {
      ChatService.connect(examId, studentId, token)
        .then(() => {
          console.log("Retry connection successful");
        })
        .catch((error) => {
          console.error("Retry connection failed:", error);
          setConnectionError("Connection retry failed");
        })
        .finally(() => {
          setConnecting(false);
          connectionAttemptRef.current = false;
        });
    } else {
      setConnectionError("Missing required connection parameters");
      setConnecting(false);
      connectionAttemptRef.current = false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send stop typing if we were typing
      if (isTyping) {
        ChatService.sendTyping(false);
      }
    };
  }, [isTyping]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <div className="relative">
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border z-50 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-96 h-96"
      }`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={18} />
          <span className="font-medium">Exam Chat</span>
          <div className="flex items-center space-x-1">
            {connecting ? (
              <Loader size={14} className="text-blue-200 animate-spin" />
            ) : isConnected ? (
              <Wifi size={14} className="text-green-200" />
            ) : (
              <WifiOff size={14} className="text-red-200" />
            )}
            <span className="text-xs">
              {connecting
                ? "Connecting..."
                : isConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && isMinimized && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={onToggle} className="p-1 hover:bg-blue-500 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {loadingHistory ? (
              <div className="text-center text-gray-500 mt-8">
                <Loader className="mx-auto mb-2 animate-spin" size={32} />
                <p className="text-sm">Loading chat history...</p>
              </div>
            ) : connectionError ? (
              <div className="text-center text-red-500 mt-8">
                <AlertCircle className="mx-auto mb-2" size={32} />
                <p className="text-sm mb-2">{connectionError}</p>
                <button
                  onClick={retryConnection}
                  disabled={connecting}
                  className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? "Connecting..." : "Retry Connection"}
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="mx-auto mb-2" size={32} />
                <p className="text-sm">No messages yet.</p>
                <p className="text-xs">
                  Start a conversation with your teacher!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs ${
                      message.isOwn ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        message.senderType === "teacher" ||
                        message.senderType === "admin"
                          ? "bg-green-500"
                          : message.senderType === "system"
                          ? "bg-gray-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {message.senderType === "teacher" ||
                      message.senderType === "admin" ? (
                        <GraduationCap size={14} />
                      ) : message.senderType === "system" ? (
                        "S"
                      ) : (
                        <User size={14} />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.isOwn
                            ? "bg-blue-600 text-white"
                            : message.senderType === "system"
                            ? "bg-gray-100 text-gray-600 italic"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {!message.isOwn && message.senderType !== "system" && (
                          <div className="text-xs font-medium mb-1 text-green-600">
                            {message.senderName || "Teacher"}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <div
                        className={`text-xs text-gray-500 mt-1 flex items-center ${
                          message.isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <Clock size={10} className="mr-1" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {teacherTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <GraduationCap size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder={
                  connecting
                    ? "Connecting..."
                    : isConnected
                    ? "Type your message..."
                    : connectionError
                    ? "Connection error..."
                    : "Connecting..."
                }
                disabled={!isConnected || connecting}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!isConnected || !newMessage.trim() || connecting}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </form>

            {/* Connection Status */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                {connecting && (
                  <>
                    <Loader
                      size={12}
                      className="mr-1 animate-spin text-blue-500"
                    />
                    <span className="text-blue-600">Connecting...</span>
                  </>
                )}
                {!connecting && !isConnected && (
                  <>
                    <WifiOff size={12} className="mr-1" />
                    <span>
                      {connectionError ? "Connection error" : "Disconnected"}
                    </span>
                  </>
                )}
                {!connecting && isConnected && (
                  <>
                    <Wifi size={12} className="mr-1 text-green-500" />
                    <span className="text-green-600">Connected</span>
                  </>
                )}
              </div>

              {connectionError && !connecting && (
                <button
                  onClick={retryConnection}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Retry
                </button>
              )}
            </div>

            {/* Character count for message input */}
            {newMessage.length > 400 && (
              <div className="text-xs text-gray-500 mt-1 text-right">
                {newMessage.length}/500
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;
