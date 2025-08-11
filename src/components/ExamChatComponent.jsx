import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Loader,
} from "lucide-react";
import ExamChatService, { ExamChatAPI } from "../service/ExamChatService";

const ExamChatComponent = ({
  examId,
  studentId,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const userRole = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle incoming messages
  const handleIncomingMessage = useCallback(
    (message) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) return prev;

        const newMessages = [...prev, message];
        return newMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

      // Update unread count if chat is minimized or closed
      if (isMinimized || !isOpen) {
        if (
          (userRole === "STUDENT" && message.senderType === "TEACHER") ||
          (userRole === "TEACHER" && message.senderType === "STUDENT")
        ) {
          setUnreadCount((prev) => prev + 1);
        }
      }

      // Auto-scroll to bottom for new messages
      setTimeout(scrollToBottom, 100);
    },
    [isMinimized, isOpen, userRole, scrollToBottom]
  );

  // Initialize chat
  useEffect(() => {
    if (isOpen && examId) {
      initializeChat();
    }

    return () => {
      if (isOpen) {
        ExamChatService.disconnect();
      }
    };
  }, [isOpen, examId]);

  // Handle connection status
  useEffect(() => {
    const handleConnectionChange = (status) => {
      setConnected(status);
      if (!status) {
        setError("Connection lost. Trying to reconnect...");
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          ExamChatService.reconnect();
        }, 3000);
      } else {
        setError(null);
      }
    };

    ExamChatService.onConnectionChange(handleConnectionChange);

    return () => {
      ExamChatService.removeConnectionCallback(handleConnectionChange);
    };
  }, []);

  // Mark messages as read when chat is opened or maximized
  useEffect(() => {
    if (isOpen && !isMinimized && unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, isMinimized, unreadCount]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Connect to WebSocket
      if (!ExamChatService.isConnected()) {
        await ExamChatService.connect();
      }

      // Subscribe to messages based on user role
      if (userRole === "STUDENT") {
        ExamChatService.subscribeToStudentChat(
          examId,
          parseInt(userId),
          handleIncomingMessage
        );
      } else if (userRole === "TEACHER") {
        ExamChatService.subscribeToTeacherChat(
          examId,
          parseInt(userId),
          handleIncomingMessage
        );
      }

      // Load chat history
      await loadChatHistory();

      setConnected(true);
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to connect to chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const historyResponse = await ExamChatAPI.getChatHistory(
        examId,
        studentId
      );
      console.log("Successfully fetched chat History");

      setMessages(historyResponse.messages || []);
      setUnreadCount(historyResponse.unreadCount || 0);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setError("Failed to load chat history");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !connected) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      if (userRole === "STUDENT") {
        await ExamChatAPI.sendStudentMessage(examId, messageText);
      } else if (userRole === "TEACHER") {
        await ExamChatAPI.sendTeacherMessage(examId, studentId, messageText);
      }

      // Message will be received via WebSocket
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setNewMessage(messageText); // Restore message text
    } finally {
      setSending(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await ExamChatAPI.markMessagesAsRead(examId, studentId);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized && unreadCount > 0) {
      markMessagesAsRead();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString();
  };

  const renderMessage = (message, index) => {
    const isOwnMessage =
      (userRole === "STUDENT" && message.senderType === "STUDENT") ||
      (userRole === "TEACHER" && message.senderType === "TEACHER");

    const prevMessage = messages[index - 1];
    const showDateSeparator =
      !prevMessage ||
      new Date(message.createdAt).toDateString() !==
        new Date(prevMessage.createdAt).toDateString();

    return (
      <div key={message.id}>
        {showDateSeparator && (
          <div className="text-center text-xs text-gray-500 my-4">
            <div className="bg-gray-100 inline-block px-3 py-1 rounded-full">
              {formatDate(message.createdAt)}
            </div>
          </div>
        )}

        <div
          className={`mb-3 flex ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {!isOwnMessage && (
              <div className="text-xs font-semibold mb-1 text-gray-600">
                {message.senderType === "TEACHER"
                  ? message.teacherName
                  : message.studentName}
              </div>
            )}

            <div className="break-words">{message.message}</div>

            <div
              className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                isOwnMessage ? "text-blue-100" : "text-gray-500"
              }`}
            >
              <Clock size={10} />
              <span>{formatTime(message.createdAt)}</span>
              {isOwnMessage && message.isRead && (
                <CheckCircle size={10} className="text-green-300" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-white rounded-lg shadow-xl border transition-all duration-300 ${
          isMinimized ? "w-80 h-14" : "w-96 h-96"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle size={18} />
            <h3 className="font-semibold text-sm">
              {userRole === "STUDENT"
                ? "Chat with Teacher"
                : `Chat with Student`}
            </h3>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-400" : "bg-red-400"
              }`}
            />

            <button
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            {/* Connection Status */}
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200">
                <div className="flex items-center space-x-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-4 flex items-center justify-center">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading chat...</span>
              </div>
            )}

            {/* Messages */}
            {!loading && (
              <div className="flex-1 p-4 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle
                      size={32}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">
                      Start a conversation with your{" "}
                      {userRole === "STUDENT" ? "teacher" : "student"}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) =>
                      renderMessage(message, index)
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            {/* Message Input */}
            {!loading && (
              <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${
                        userRole === "STUDENT" ? "teacher" : "student"
                      }...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: "40px", maxHeight: "80px" }}
                      disabled={sending || !connected}
                    />
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending || !connected}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>

                {!connected && (
                  <div className="mt-2 text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>
                      Disconnected - Messages will be sent when reconnected
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamChatComponent;
