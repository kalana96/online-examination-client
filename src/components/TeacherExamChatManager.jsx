import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  X,
  User,
  Clock,
  Bell,
  BellOff,
  Loader,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";
import ExamChatService, { ExamChatAPI } from "../services/ExamChatService";

const TeacherExamChatManager = ({ examId, isOpen, onClose }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const teacherId = localStorage.getItem("id");

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle incoming messages
  const handleIncomingMessage = useCallback(
    (message) => {
      const studentId = message.studentId;

      setMessages((prev) => ({
        ...prev,
        [studentId]: [...(prev[studentId] || []), message],
      }));

      // Update unread count if not currently viewing this student's chat
      if (selectedStudent?.id !== studentId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [studentId]: (prev[studentId] || 0) + 1,
        }));
      }

      // Auto-scroll if viewing this student's chat
      if (selectedStudent?.id === studentId) {
        setTimeout(scrollToBottom, 100);
      }
    },
    [selectedStudent]
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

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Connect to WebSocket
      if (!ExamChatService.isConnected()) {
        await ExamChatService.connect();
      }

      // Subscribe to teacher messages
      ExamChatService.subscribeToTeacherChat(
        examId,
        parseInt(teacherId),
        handleIncomingMessage
      );

      // Load active student chats
      await loadActiveChats();

      setConnected(true);
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to connect to chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadActiveChats = async () => {
    try {
      const studentIds = await ExamChatAPI.getActiveStudentChats(examId);
      // You would need to fetch student details from your API
      // For now, creating placeholder student objects
      const students = studentIds.map((id) => ({
        id: id,
        name: `Student ${id}`, // You should replace this with actual student name from your API
        avatar: null,
      }));

      setActiveChats(students);

      // Load messages for each student
      const allMessages = {};
      const unreadCounts = {};

      for (const student of students) {
        try {
          const chatHistory = await ExamChatAPI.getChatHistory(
            examId,
            student.id
          );
          allMessages[student.id] = chatHistory.messages || [];
          unreadCounts[student.id] =
            chatHistory.messages?.filter(
              (msg) => !msg.isRead && msg.senderType === "STUDENT"
            ).length || 0;
        } catch (error) {
          console.error(
            `Error loading messages for student ${student.id}:`,
            error
          );
          allMessages[student.id] = [];
          unreadCounts[student.id] = 0;
        }
      }

      setMessages(allMessages);
      setUnreadCounts(unreadCounts);

      // Auto-select first student if available
      if (students.length > 0 && !selectedStudent) {
        selectStudent(students[0]);
      }
    } catch (error) {
      console.error("Error loading active chats:", error);
      setError("Failed to load student chats");
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);

    // Mark messages as read
    if (unreadCounts[student.id] > 0) {
      try {
        await ExamChatAPI.markMessagesAsRead(examId, student.id);
        setUnreadCounts((prev) => ({
          ...prev,
          [student.id]: 0,
        }));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }

    setTimeout(scrollToBottom, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !connected || !selectedStudent) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      await ExamChatAPI.sendTeacherMessage(
        examId,
        selectedStudent.id,
        messageText
      );

      // Message will be received via WebSocket, but also add locally for immediate UI update
      const localMessage = {
        id: Date.now(), // Temporary ID
        examId: examId,
        studentId: selectedStudent.id,
        teacherId: parseInt(teacherId),
        message: messageText,
        senderType: "TEACHER",
        messageType: "TEXT",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedStudent.id]: [
          ...(prev[selectedStudent.id] || []),
          localMessage,
        ],
      }));

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setNewMessage(messageText); // Restore message text
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce(
      (total, count) => total + count,
      0
    );
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.senderType === "TEACHER";
    const studentMessages = messages[selectedStudent?.id] || [];
    const prevMessage = studentMessages[index - 1];
    const showDateSeparator =
      !prevMessage ||
      new Date(message.createdAt).toDateString() !==
        new Date(prevMessage.createdAt).toDateString();

    return (
      <div key={`${message.id}-${index}`}>
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
                {message.studentName}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <h3 className="font-semibold">Exam Chat Management</h3>
            {getTotalUnreadCount() > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {getTotalUnreadCount()}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-sm">
              {connected ? "Connected" : "Disconnected"}
            </span>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Student List Sidebar */}
          <div className="w-80 bg-gray-50 border-r">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-2 text-gray-700">
                <Users size={18} />
                <h4 className="font-medium">Active Student Chats</h4>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {activeChats.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading students...</span>
              </div>
            ) : (
              <div className="overflow-y-auto">
                {activeChats.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle
                      size={32}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm">No active chats</p>
                    <p className="text-xs mt-1">
                      Students will appear here when they start chatting
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {activeChats.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => selectStudent(student)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                          selectedStudent?.id === student.id
                            ? "bg-blue-100 border-blue-500 border"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate">
                              {student.name}
                            </p>
                            {unreadCounts[student.id] > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCounts[student.id]}
                              </div>
                            )}
                          </div>

                          {messages[student.id] &&
                            messages[student.id].length > 0 && (
                              <p className="text-sm text-gray-600 truncate">
                                {
                                  messages[student.id][
                                    messages[student.id].length - 1
                                  ].message
                                }
                              </p>
                            )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {selectedStudent.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Student ID: {selectedStudent.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {messages[selectedStudent.id]?.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageCircle
                        size={32}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">
                        Start a conversation with {selectedStudent.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages[selectedStudent.id]?.map((message, index) =>
                        renderMessage(message, index)
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message ${selectedStudent.name}...`}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p className="text-lg font-medium">
                    Select a student to start chatting
                  </p>
                  <p className="text-sm mt-1">
                    Choose from the student list on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherExamChatManager;
