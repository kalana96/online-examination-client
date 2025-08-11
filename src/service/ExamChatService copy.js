// ExamChatService.js
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

class ExamChatService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
    this.connectionCallbacks = [];
  }

  // Connect to WebSocket
  connect() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      try {
        const socket = new SockJS("http://localhost:1010/ws");
        this.stompClient = Stomp.over(socket);

        // const baseUrl =
        //   import.meta.env.VITE_API_BASE_URL || "http://localhost:1010";
        // const socket = new SockJS(`${baseUrl}/ws`);
        // this.stompClient = Stomp.over(socket);

        // Disable debug logging in production
        this.stompClient.debug = (str) => {
          console.log("STOMP: " + str);
        };

        this.stompClient.connect(
          {},
          (frame) => {
            console.log("Connected to WebSocket:", frame);
            this.connected = true;
            this.connectionCallbacks.forEach((callback) => callback(true));
            resolve();
          },
          (error) => {
            console.error("WebSocket connection error:", error);
            this.connected = false;
            this.connectionCallbacks.forEach((callback) => callback(false));
            reject(error);
          }
        );
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.stompClient && this.connected) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription, key) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.messageCallbacks.clear();

      this.stompClient.disconnect(() => {
        console.log("Disconnected from WebSocket");
      });

      this.connected = false;
      this.connectionCallbacks.forEach((callback) => callback(false));
    }
  }

  // Subscribe to chat messages for student
  subscribeToStudentChat(examId, studentId, callback) {
    if (!this.connected) {
      console.warn("Not connected to WebSocket");
      return null;
    }

    const topic = `/topic/exam/${examId}/student/${studentId}`;
    const subscriptionKey = `student_${examId}_${studentId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.log("Already subscribed to student chat:", topic);
      return this.subscriptions.get(subscriptionKey);
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const chatMessage = JSON.parse(message.body);
        console.log("Received student message:", chatMessage);
        callback(chatMessage);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    this.subscriptions.set(subscriptionKey, subscription);
    this.messageCallbacks.set(subscriptionKey, callback);

    console.log("Subscribed to student chat:", topic);
    return subscription;
  }

  // Subscribe to chat messages for teacher
  subscribeToTeacherChat(examId, teacherId, callback) {
    if (!this.connected) {
      console.warn("Not connected to WebSocket");
      return null;
    }

    const topic = `/topic/exam/${examId}/teacher/${teacherId}`;
    const subscriptionKey = `teacher_${examId}_${teacherId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.log("Already subscribed to teacher chat:", topic);
      return this.subscriptions.get(subscriptionKey);
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const chatMessage = JSON.parse(message.body);
        console.log("Received teacher message:", chatMessage);
        callback(chatMessage);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    this.subscriptions.set(subscriptionKey, subscription);
    this.messageCallbacks.set(subscriptionKey, callback);

    console.log("Subscribed to teacher chat:", topic);
    return subscription;
  }

  // Unsubscribe from specific chat
  unsubscribeFromChat(subscriptionKey) {
    if (this.subscriptions.has(subscriptionKey)) {
      const subscription = this.subscriptions.get(subscriptionKey);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      this.messageCallbacks.delete(subscriptionKey);
      console.log("Unsubscribed from:", subscriptionKey);
    }
  }

  // Add connection status callback
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  // Remove connection status callback
  removeConnectionCallback(callback) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }

  // Reconnect if disconnected
  async reconnect() {
    if (!this.connected) {
      try {
        await this.connect();

        // Re-subscribe to all previous subscriptions
        const previousCallbacks = new Map(this.messageCallbacks);
        this.subscriptions.clear();
        this.messageCallbacks.clear();

        for (const [key, callback] of previousCallbacks) {
          const [type, examId, userId] = key.split("_");
          if (type === "student") {
            this.subscribeToStudentChat(examId, userId, callback);
          } else if (type === "teacher") {
            this.subscribeToTeacherChat(examId, userId, callback);
          }
        }

        console.log("Reconnected and re-subscribed to all chats");
      } catch (error) {
        console.error("Reconnection failed:", error);
      }
    }
  }
}

// HTTP API calls
class ExamChatAPI {
  static async sendStudentMessage(examId, message, messageType = "TEXT") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/student/exam-chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId,
          message,
          messageType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending student message:", error);
      throw error;
    }
  }

  static async sendTeacherMessage(
    examId,
    studentId,
    message,
    messageType = "TEXT"
  ) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/teacher/exam-chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId,
          studentId,
          message,
          messageType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending teacher message:", error);
      throw error;
    }
  }

  static async getChatHistory(examId, studentId = null) {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");
      console.log(
        "User Role:",
        userRole,
        "examId:",
        examId,
        "studentId:",
        studentId
      );

      let url;
      if (userRole === "STUDENT") {
        // url = `/api/v1/student/exam-chat/history/${examId}`;
        url = `/api/v1/teacher/exam-chat/history/${examId}/${studentId}`;
      } else {
        url = `/api/v1/teacher/exam-chat/history/${examId}/${studentId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Successfully fetched chat Historyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }

  static async markMessagesAsRead(examId, studentId = null) {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      let url;
      if (userRole === "STUDENT") {
        url = `/api/v1/student/exam-chat/mark-read/${examId}`;
      } else {
        url = `/api/v1/teacher/exam-chat/mark-read/${examId}/${studentId}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  static async getActiveStudentChats(examId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/v1/teacher/exam-chat/active-chats/${examId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching active chats:", error);
      throw error;
    }
  }
}

// Create singleton instance
const chatService = new ExamChatService();

export default chatService;
export { ExamChatAPI };
