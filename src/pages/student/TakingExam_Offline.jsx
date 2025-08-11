import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TakingExamService from "../../service/TakingExamService";
import {
  MessageCircle,
  Bell,
  LogOut,
  User,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Shield,
  ShieldOff,
  Menu,
  X,
  Loader,
  RefreshCw,
} from "lucide-react";

const TakingExam = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // state for offline functionality
  const [offlineAnswers, setOfflineAnswers] = useState({});
  const [pendingSync, setPendingSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // New state for exam session management
  const [attemptId, setAttemptId] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const autoSaveTimeoutRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const { id } = useParams();
  const examId = id;
  // const token = localStorage.getItem("token");

  // offline storage utility functions
  const STORAGE_KEYS = {
    EXAM_DATA: `exam_${examId}_data`,
    ANSWERS: `exam_${examId}_answers`,
    TIME_REMAINING: `exam_${examId}_time`,
    ATTEMPT_ID: `exam_${examId}_attempt`,
    LAST_SYNC: `exam_${examId}_last_sync`,
    OFFLINE_QUEUE: `exam_${examId}_offline_queue`,
  };

  // Initialize student ID from token or localStorage
  useEffect(() => {
    // Decode token to get student ID or get from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // For now, assuming studentId is stored separately
        const storedStudentId = localStorage.getItem("id");
        if (storedStudentId) {
          setStudentId(parseInt(storedStudentId));
        }
      } catch (error) {
        console.error("Error getting student ID:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // useEffect for offline data loading
  useEffect(() => {
    if (studentId) {
      // Try to load offline data first
      const offlineExamData = loadFromOfflineStorage(STORAGE_KEYS.EXAM_DATA);
      const offlineAnswersData = loadFromOfflineStorage(STORAGE_KEYS.ANSWERS);
      const offlineTimeRemaining = loadFromOfflineStorage(
        STORAGE_KEYS.TIME_REMAINING
      );
      const offlineAttemptId = loadFromOfflineStorage(STORAGE_KEYS.ATTEMPT_ID);

      if (offlineExamData && offlineAttemptId) {
        console.log("Loading exam from offline storage");
        setExamData(offlineExamData);
        setAttemptId(offlineAttemptId);

        if (offlineAnswersData) {
          setAnswers(offlineAnswersData);
          setOfflineAnswers(offlineAnswersData);
        }

        if (offlineTimeRemaining) {
          setTimeRemaining(offlineTimeRemaining);
        }

        setLoading(false);
        setOfflineMode(true);

        // Try to sync if online
        if (navigator.onLine) {
          syncWithServer();
        }
      } else {
        fetchExamData();
      }
    }
  }, [studentId, examId]);

  //useEffect for auto-save with better error handling
  useEffect(() => {
    if (Object.keys(answers).length > 0 && attemptId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveAnswers();
      }, 30000);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, attemptId]);

  //Cleanup effect
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Save current state to offline storage before unmounting
      if (examData) {
        saveToOfflineStorage(STORAGE_KEYS.EXAM_DATA, examData);
      }
      if (Object.keys(answers).length > 0) {
        saveToOfflineStorage(STORAGE_KEYS.ANSWERS, answers);
      }
      if (timeRemaining) {
        saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, timeRemaining);
      }
      if (attemptId) {
        saveToOfflineStorage(STORAGE_KEYS.ATTEMPT_ID, attemptId);
      }
    };
  }, [examData, answers, timeRemaining, attemptId]);

  //timer effect to work with server-synchronized time
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (newTime % 30 === 0) {
          saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, newTime);
        }

        if (newTime <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeRemaining]);

  // Enhanced connection status monitoring with offline sync
  useEffect(() => {
    const handleOnline = async () => {
      console.log("Connection restored - syncing with server");
      setConnectionStatus(true);
      if (offlineMode) {
        await syncWithServer();
      } else if (attemptId) {
        syncTimeWithServer();
        if (Object.keys(answers).length > 0) {
          autoSaveAnswers();
        }
      }
    };

    const handleOffline = () => {
      console.log("Connection lost - switching to offline mode");
      setConnectionStatus(false);
      setOfflineMode(true);

      // Save current state to offline storage
      if (examData) {
        saveToOfflineStorage(STORAGE_KEYS.EXAM_DATA, examData);
      }
      if (Object.keys(answers).length > 0) {
        saveToOfflineStorage(STORAGE_KEYS.ANSWERS, answers);
        setOfflineAnswers(answers);
      }
      if (timeRemaining) {
        saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, timeRemaining);
      }
      if (attemptId) {
        saveToOfflineStorage(STORAGE_KEYS.ATTEMPT_ID, attemptId);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setConnectionStatus(navigator.onLine);
    if (!navigator.onLine) {
      setOfflineMode(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineMode, attemptId, answers, examData, timeRemaining]);

  // helper function to sync time with server immediately
  const syncTimeWithServer = useCallback(async () => {
    if (!attemptId) return;

    try {
      const timeData = await TakingExamService.getTimeRemaining(attemptId);
      const remainingTime = timeData.totalSecondsRemaining || 0;

      setTimeRemaining(Math.max(0, Math.floor(remainingTime)));

      if (timeData.timeExpired || remainingTime <= 0) {
        handleAutoSubmit();
      }
    } catch (error) {
      console.error("Error syncing time:", error);
    }
  }, [attemptId]);

  // fetchExamData with offline support
  const fetchExamData = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);

      const ipAddress = await TakingExamService.getClientIPAddress();
      const examData = await TakingExamService.getExamForTaking(
        examId,
        studentId,
        ipAddress
      );
      const sessionData = await TakingExamService.startExamSession(
        examId,
        studentId,
        ipAddress
      );

      setExamData(sessionData);
      setAttemptId(sessionData.attemptId);

      // Save to offline storage immediately
      saveToOfflineStorage(STORAGE_KEYS.EXAM_DATA, sessionData);
      saveToOfflineStorage(STORAGE_KEYS.ATTEMPT_ID, sessionData.attemptId);

      // Get initial time and save offline
      try {
        const timeData = await TakingExamService.getTimeRemaining(
          sessionData.attemptId
        );
        const remainingTime = timeData.totalSecondsRemaining || 0;

        setTimeRemaining(Math.max(0, Math.floor(remainingTime)));
        saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, remainingTime);

        if (timeData.timeExpired || remainingTime <= 0) {
          handleAutoSubmit();
          return;
        }
      } catch (timeError) {
        const fallbackTime = sessionData.durationMinutes
          ? sessionData.durationMinutes * 60
          : 0;
        setTimeRemaining(fallbackTime);
        saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, fallbackTime);
      }

      // Load existing answers
      if (sessionData.existingAnswers) {
        const transformedAnswers = {};
        Object.entries(sessionData.existingAnswers).forEach(
          ([questionId, answerObj]) => {
            transformedAnswers[questionId] = answerObj.answerText || "";
          }
        );
        setAnswers(transformedAnswers);
        setOfflineAnswers(transformedAnswers);
        saveToOfflineStorage(STORAGE_KEYS.ANSWERS, transformedAnswers);
      }

      setOfflineMode(false);
      setTimeout(() => {
        startTimeUpdates();
      }, 2000);
    } catch (err) {
      console.error("Error fetching exam data:", err);

      // Try to load from offline storage as fallback
      const offlineExamData = loadFromOfflineStorage(STORAGE_KEYS.EXAM_DATA);
      const offlineAttemptId = loadFromOfflineStorage(STORAGE_KEYS.ATTEMPT_ID);

      if (offlineExamData && offlineAttemptId) {
        console.log("Falling back to offline data");
        setExamData(offlineExamData);
        setAttemptId(offlineAttemptId);

        const offlineAnswersData = loadFromOfflineStorage(STORAGE_KEYS.ANSWERS);
        const offlineTimeRemaining = loadFromOfflineStorage(
          STORAGE_KEYS.TIME_REMAINING
        );

        if (offlineAnswersData) {
          setAnswers(offlineAnswersData);
          setOfflineAnswers(offlineAnswersData);
        }
        if (offlineTimeRemaining) {
          setTimeRemaining(offlineTimeRemaining);
        }

        setOfflineMode(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // autoSaveAnswers function
  const autoSaveAnswers = useCallback(async () => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    if (offlineMode || !navigator.onLine) {
      console.log("Offline mode - answers saved locally");
      saveToOfflineStorage(STORAGE_KEYS.ANSWERS, answers);
      addToOfflineQueue({
        type: "AUTO_SAVE",
        answers: answers,
        timestamp: Date.now(),
      });
      setPendingSync(true);
      return;
    }

    try {
      setAutoSaving(true);
      const formattedAnswers = formatAnswersForSubmission(answers);
      await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);

      saveToOfflineStorage(STORAGE_KEYS.ANSWERS, answers);
      setLastSyncTime(Date.now());

      console.log("Answers auto-saved successfully");
    } catch (err) {
      console.error("Auto-save failed:", err);

      setOfflineMode(true);
      saveToOfflineStorage(STORAGE_KEYS.ANSWERS, answers);
      addToOfflineQueue({
        type: "AUTO_SAVE_RETRY",
        answers: answers,
        timestamp: Date.now(),
      });
      setPendingSync(true);
    } finally {
      setAutoSaving(false);
    }
  }, [attemptId, answers, offlineMode]);

  // function to periodically update time remaining
  const startTimeUpdates = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    // Sync time immediately
    syncTimeWithServer();

    // Set up periodic sync every 30 seconds instead of 60 seconds
    timeUpdateIntervalRef.current = setInterval(async () => {
      if (attemptId) {
        try {
          const timeData = await TakingExamService.getTimeRemaining(attemptId);
          const remainingTime = timeData.totalSecondsRemaining || 0;

          setTimeRemaining(Math.max(0, Math.floor(remainingTime)));

          if (timeData.timeExpired || remainingTime <= 0) {
            clearInterval(timeUpdateIntervalRef.current);
            handleAutoSubmit();
          }
        } catch (error) {
          console.error("Error updating time:", error);
        }
      }
    }, 30000); // Update every 30 seconds
  };

  // submit with offline handling
  const handleSubmitExam = async () => {
    if (!attemptId) {
      console.error("No attempt ID available for submission");
      return;
    }

    if (offlineMode || !navigator.onLine) {
      alert(
        "Cannot submit exam while offline. Please check your internet connection and try again."
      );
      return;
    }

    try {
      setSubmitting(true);

      // Sync any pending offline data first
      if (pendingSync) {
        await syncWithServer();
      }

      // Final auto-save before submission
      if (Object.keys(answers).length > 0) {
        const formattedAnswers = formatAnswersForSubmission(answers);
        await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);
      }

      const result = await TakingExamService.submitExamFinal(attemptId);

      // Clear offline storage after successful submission
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (window.examOfflineStorage) {
          delete window.examOfflineStorage[key];
        }
      });

      // Clear intervals
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      navigate(`/student/exam-result/${examId}`, {
        state: {
          submissionId: result.submissionId,
          score: result.score,
          totalMarks: result.totalMarks,
        },
      });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert(`Failed to submit exam: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // const handleAutoSubmit = async () => {
  //   console.log("Time expired - auto-submitting exam");
  //   await handleSubmitExam();
  // };

  //Enhanced auto-submit with better error handling
  const handleAutoSubmit = useCallback(async () => {
    console.log("Auto-submit triggered - Time expired");

    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    setTimeRemaining(0);

    try {
      if (!attemptId) {
        console.error("No attempt ID available for submission");
        return;
      }

      if (offlineMode || !navigator.onLine) {
        alert(
          "Cannot submit exam while offline. Please check your internet connection and try again."
        );
        return;
      }

      setSubmitting(true);

      // Sync any pending offline data first
      if (pendingSync) {
        await syncWithServer();
      }

      // Final auto-save before submission
      if (Object.keys(answers).length > 0) {
        const formattedAnswers = formatAnswersForSubmission(answers);
        await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);
      }

      const result = await TakingExamService.submitExamFinal(attemptId);

      // Clear offline storage after successful submission
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (window.examOfflineStorage) {
          delete window.examOfflineStorage[key];
        }
      });

      // Clear intervals
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      navigate(`/student/exam-result/${examId}`, {
        state: {
          submissionId: result.submissionId,
          score: result.score,
          totalMarks: result.totalMarks,
        },
      });
    } catch (err) {
      console.error("Auto-submit failed:", err);
      alert(
        "Time has expired! There was an issue submitting your exam automatically. Please contact support immediately."
      );

      if (Object.keys(answers).length > 0 && attemptId) {
        try {
          const formattedAnswers = formatAnswersForSubmission(answers);
          await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);
          console.log("Progress saved after failed auto-submit");
        } catch (saveError) {
          console.error(
            "Failed to save progress after auto-submit failure:",
            saveError
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, offlineMode, pendingSync, answers, examId, navigate]);

  const refreshExamData = async () => {
    await fetchExamData();
  };

  // formatTime function
  const formatTime = (seconds) => {
    // Handle invalid, undefined, or negative seconds
    if (!seconds || seconds < 0 || isNaN(seconds) || !isFinite(seconds)) {
      return "00:00";
    }

    const totalSeconds = Math.floor(Math.abs(seconds)); // Ensure positive integer
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimeStatus = () => {
    if (timeRemaining <= 300) return "critical"; // 5 minutes
    if (timeRemaining <= 900) return "warning"; // 15 minutes
    return "normal";
  };

  // answer handling with offline storage
  const handleAnswerChange = (questionId, answer) => {
    const newAnswers = {
      ...answers,
      [questionId]: answer,
    };

    setAnswers(newAnswers);

    // Always save to offline storage
    saveToOfflineStorage(STORAGE_KEYS.ANSWERS, newAnswers);
    setOfflineAnswers(newAnswers);

    // Save timestamp
    saveToOfflineStorage(STORAGE_KEYS.LAST_SYNC, Date.now());

    if (offlineMode) {
      // Add to offline queue for later sync
      addToOfflineQueue({
        type: "ANSWER_UPDATE",
        questionId,
        answer,
        timestamp: Date.now(),
      });
      setPendingSync(true);
    } else {
      // Online - normal auto-save behavior
      if (answer && answer.toString().trim() !== "") {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          autoSaveAnswers();
        }, 5000);
      }
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSidebarOpen(false);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const clearSelection = () => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    handleAnswerChange(currentQuestion.id, "");
  };

  const getQuestionStatus = (questionIndex) => {
    const question = examData.questions[questionIndex];
    const answer = answers[question.id];
    if (answer && answer.toString().trim() !== "") {
      return "answered";
    }
    return "unanswered";
  };

  // new getQuestionStatus function
  // const getQuestionStatus = (questionIndex) => {
  //   const question = examData.questions[questionIndex];
  //   const answer = answers[question.id];

  //   // Convert answer to string and check if it has meaningful content
  //   const answerString = answer ? String(answer) : "";

  //   // For HTML content, strip tags to check actual text content
  //   const tempDiv = document.createElement("div");
  //   tempDiv.innerHTML = answerString;
  //   const textContent = tempDiv.textContent || tempDiv.innerText || "";

  //   if (textContent.trim() !== "") {
  //     return "answered";
  //   }
  //   return "unanswered";
  // };

  const applyFormatting = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      const content = editorRef.current.innerHTML;
      const currentQuestion = examData.questions[currentQuestionIndex];
      handleAnswerChange(currentQuestion.id, content);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const currentQuestion = examData.questions[currentQuestionIndex];
      handleAnswerChange(currentQuestion.id, content);
    }
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const confirmSubmission = () => {
    setShowSubmissionModal(false);
    handleSubmitExam();
  };

  const getSubmissionStats = () => {
    if (!examData) return { total: 0, answered: 0, unanswered: 0 };

    const totalQuestions = examData.questions.length;
    const answeredQuestions = examData.questions.filter((q) => {
      const answer = answers[q.id];
      return answer && answer.toString().trim() !== "";
    }).length;

    return {
      total: totalQuestions,
      answered: answeredQuestions,
      unanswered: totalQuestions - answeredQuestions,
      percentageComplete: Math.round(
        (answeredQuestions / totalQuestions) * 100
      ),
    };
  };

  const getAnswerSummary = () => {
    if (!examData) return [];

    return examData.questions.map((question) => {
      const answer = answers[question.id] || "";
      let displayAnswer = "";

      if (
        question.questionType === "MULTIPLE_CHOICE" ||
        question.questionType === "TRUE_FALSE"
      ) {
        displayAnswer = answer || "Not answered";
      } else if (
        question.questionType === "ESSAY" ||
        question.questionType === "SHORT_ANSWER"
      ) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = answer;
        displayAnswer =
          tempDiv.textContent || tempDiv.innerText || "Not answered";
      }

      return {
        ...question,
        answer: displayAnswer,
        isAnswered: answer && answer.toString().trim() !== "",
      };
    });
  };

  //Enhanced error boundary and connection status handling
  const handleConnectionError = (error) => {
    if (error.message.includes("Network error")) {
      setConnectionStatus(false);
    }

    // Auto-retry logic for network errors
    setTimeout(() => {
      setConnectionStatus(navigator.onLine);
    }, 5000);
  };

  // Enhanced exit exam functionality
  const handleExitExam = async () => {
    const confirmExit = window.confirm(
      "Are you sure you want to exit the exam? Your progress will be saved, but you'll need to restart the exam session."
    );

    if (confirmExit) {
      try {
        // Auto-save before exiting
        if (Object.keys(answers).length > 0 && attemptId) {
          const formattedAnswers = formatAnswersForSubmission(answers);
          await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);
        }

        // Clear all intervals and timeouts
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        navigate("/student/dashboard");
      } catch (error) {
        console.error("Error during exit:", error);
        // Still navigate even if save fails
        navigate("/student/dashboard");
      }
    }
  };

  // Enhanced loading state with retry functionality
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {studentId ? "Loading Exam..." : "Initializing..."}
        </h2>
        <p className="text-gray-600 mb-4">
          {studentId
            ? "Please wait while we prepare your exam."
            : "Setting up your exam session..."}
        </p>
        {error && (
          <button
            onClick={refreshExamData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  // Helper function to format answers consistently
  const formatAnswersForSubmission = useCallback(
    (answersObj) => {
      return Object.entries(answersObj).map(([questionId, answer]) => {
        let answerText = "";
        if (typeof answer === "string") {
          answerText = answer;
        } else if (typeof answer === "object") {
          answerText = JSON.stringify(answer);
        } else {
          answerText = String(answer || "");
        }

        return {
          questionId: parseInt(questionId),
          answerText: answerText,
          isSelected: answerText.trim() !== "",
          examAttemptId: attemptId,
          studentId: studentId,
        };
      });
    },
    [attemptId, studentId]
  );

  // OFFLINE FUNCTIONALITIES //

  // Save data to memory-based storage
  const saveToOfflineStorage = useCallback((key, data) => {
    try {
      if (!window.examOfflineStorage) {
        window.examOfflineStorage = {};
      }
      window.examOfflineStorage[key] = JSON.stringify(data);
      console.log(`Saved ${key} to offline storage`);
    } catch (error) {
      console.error("Error saving to offline storage:", error);
    }
  }, []);

  const loadFromOfflineStorage = useCallback((key) => {
    try {
      if (!window.examOfflineStorage) {
        return null;
      }
      const data = window.examOfflineStorage[key];
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading from offline storage:", error);
      return null;
    }
  }, []);

  const addToOfflineQueue = useCallback(
    (operation) => {
      const queue = loadFromOfflineStorage(STORAGE_KEYS.OFFLINE_QUEUE) || [];
      queue.push({
        ...operation,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      });
      saveToOfflineStorage(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    },
    [loadFromOfflineStorage, saveToOfflineStorage]
  );

  // sync function for offline data
  const syncWithServer = useCallback(async () => {
    if (!navigator.onLine) {
      console.log("Cannot sync - still offline");
      return;
    }

    try {
      setPendingSync(true);
      console.log("Starting offline sync...");

      const offlineQueue =
        loadFromOfflineStorage(STORAGE_KEYS.OFFLINE_QUEUE) || [];

      if (offlineQueue.length > 0) {
        console.log(`Processing ${offlineQueue.length} offline operations`);

        const latestAnswers = {};
        offlineQueue
          .filter((op) => op.type === "ANSWER_UPDATE")
          .forEach((op) => {
            if (
              !latestAnswers[op.questionId] ||
              op.timestamp > latestAnswers[op.questionId].timestamp
            ) {
              latestAnswers[op.questionId] = op;
            }
          });

        if (Object.keys(latestAnswers).length > 0 && attemptId) {
          const formattedAnswers = Object.values(latestAnswers).map((op) => ({
            questionId: parseInt(op.questionId),
            answerText:
              typeof op.answer === "string"
                ? op.answer
                : String(op.answer || ""),
            isSelected: String(op.answer || "").trim() !== "",
            examAttemptId: attemptId,
            studentId: studentId,
          }));

          await TakingExamService.autoSaveProgress(attemptId, formattedAnswers);
          console.log("Synced offline answers with server");
        }

        saveToOfflineStorage(STORAGE_KEYS.OFFLINE_QUEUE, []);
      }

      if (attemptId) {
        const timeData = await TakingExamService.getTimeRemaining(attemptId);
        const remainingTime = timeData.totalSecondsRemaining || 0;

        setTimeRemaining(Math.max(0, Math.floor(remainingTime)));
        saveToOfflineStorage(STORAGE_KEYS.TIME_REMAINING, remainingTime);

        if (timeData.timeExpired || remainingTime <= 0) {
          handleAutoSubmit();
          return;
        }
      }

      setLastSyncTime(Date.now());
      saveToOfflineStorage(STORAGE_KEYS.LAST_SYNC, Date.now());
      setOfflineMode(false);
      setPendingSync(false);

      console.log("Offline sync completed successfully");
    } catch (error) {
      console.error("Offline sync failed:", error);
      setPendingSync(false);
      setOfflineMode(true);
    }
  }, [attemptId, studentId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className=" text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Exam...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your exam.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Exam
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={refreshExamData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examData) return null;

  const currentQuestion = examData.questions[currentQuestionIndex];

  const renderQuestion = () => {
    const answer = answers[currentQuestion.id] || "";

    switch (currentQuestion.questionType) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}
                  </div>
                  <span className="text-blue-600 font-medium">
                    {currentQuestion.marks} marks
                  </span>
                </div>
                <div className="text-sm text-gray-500">Multiple Choice</div>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Select your answer
              </h4>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      answer === option
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answer === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800 flex-1">{option}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        );

      case "TRUE_FALSE":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}
                  </div>
                  <span className="text-green-600 font-medium">
                    {currentQuestion.marks} marks
                  </span>
                </div>
                <div className="text-sm text-gray-500">True/False</div>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Select True or False
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center justify-center space-x-3 p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      answer === option
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answer === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-gray-800 font-medium text-lg">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        );

      case "ESSAY":
      case "SHORT_ANSWER":
        const isEssay = currentQuestion.questionType === "ESSAY";
        return (
          <div className="space-y-6">
            <div
              className={`bg-gradient-to-r ${
                isEssay
                  ? "from-purple-50 to-pink-50 border-l-4 border-purple-500"
                  : "from-orange-50 to-amber-50 border-l-4 border-orange-500"
              } p-6 rounded-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`${
                      isEssay ? "bg-purple-500" : "bg-orange-500"
                    } text-white px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    Question {currentQuestionIndex + 1}
                  </div>
                  <span
                    className={`${
                      isEssay ? "text-purple-600" : "text-orange-600"
                    } font-medium`}
                  >
                    {currentQuestion.marks} marks
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {isEssay ? "Essay" : "Short Answer"}
                </div>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Your Answer
              </h4>

              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => applyFormatting("bold")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("italic")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("underline")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Underline"
                  >
                    <Underline size={16} />
                  </button>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button
                    type="button"
                    onClick={() => applyFormatting("insertUnorderedList")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Bullet List"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting("insertOrderedList")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered size={16} />
                  </button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className={`w-full p-4 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto ${
                    isEssay ? "min-h-[200px]" : "min-h-[100px]"
                  }`}
                  style={{ minHeight: isEssay ? "200px" : "100px" }}
                  dangerouslySetInnerHTML={{ __html: answer }}
                  suppressContentEditableWarning={true}
                  placeholder={
                    isEssay
                      ? "Write your detailed answer here..."
                      : "Write your answer here..."
                  }
                />
              </div>

              <div className="text-sm text-gray-500">
                {isEssay
                  ? "Provide a detailed explanation with examples where appropriate."
                  : "Keep your answer concise and to the point."}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-800 truncate">
          {examData.examName}
        </h1>
        <div className="flex items-center space-x-2">
          {autoSaving && (
            <Loader className="w-4 h-4 text-blue-500 animate-spin" />
          )}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              getTimeStatus() === "critical"
                ? "bg-red-100 text-red-700"
                : getTimeStatus() === "warning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:relative z-40 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out h-full overflow-y-auto`}
        >
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">{examData.examName}</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-white/20 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-blue-100">
              <p className="text-sm">{examData.subjectName}</p>
              <p className="text-sm">
                Duration: {examData.durationMinutes} minutes
              </p>
              <p className="text-sm">Total Marks: {examData.maxMarks}</p>
            </div>
            {autoSaving && (
              <div className="mt-3 flex items-center space-x-2 text-blue-100">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}
          </div>
          {/* Navigation */}
          <div className="p-4">
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Taking Exam</span>
              </div>

              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <MessageCircle size={18} />
                <span>Chat Support</span>
              </button>

              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell size={18} />
                <span>Notifications</span>
              </button>

              <button
                onClick={handleExitExam}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Exit Exam</span>
              </button>
            </nav>
          </div>
          {/* System Status */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {connectionStatus ? (
                    <Wifi size={16} className="text-green-500" />
                  ) : (
                    <WifiOff size={16} className="text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {offlineMode ? "Offline Mode" : "Connection"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      connectionStatus && !offlineMode
                        ? "bg-green-100 text-green-700"
                        : offlineMode
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {connectionStatus && !offlineMode
                      ? "Online"
                      : offlineMode
                      ? "Offline"
                      : "Disconnected"}
                  </span>
                  {pendingSync && (
                    <span className="text-xs text-orange-600 mt-1">
                      Sync Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {examData.isProctoringEnabled ? (
                    <Shield size={16} className="text-orange-500" />
                  ) : (
                    <ShieldOff size={16} className="text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">Proctoring</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    examData.isProctoringEnabled
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {examData.isProctoringEnabled ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Add sync button in the sidebar */}
          {offlineMode && (
            <div className="p-4 border-t">
              <button
                onClick={syncWithServer}
                disabled={!connectionStatus || pendingSync}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pendingSync ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
              {lastSyncTime && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
          {/* Student Info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {examData.studentName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Question Area */}
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-6 bg-white border-b">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">
                    {examData.subjectName}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {connectionStatus ? (
                    <Wifi size={16} className="text-green-500" />
                  ) : (
                    <WifiOff size={16} className="text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {connectionStatus ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {examData.isProctoringEnabled ? (
                    <Shield size={16} className="text-orange-500" />
                  ) : (
                    <ShieldOff size={16} className="text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {examData.isProctoringEnabled
                      ? "Proctored"
                      : "Not Proctored"}
                  </span>
                </div>

                {autoSaving && (
                  <div className="flex items-center space-x-2">
                    <Loader size={16} className="text-blue-500 animate-spin" />
                    <span className="text-sm text-blue-600">
                      Auto-saving...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {examData.studentName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  {renderQuestion()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft size={18} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Question {currentQuestionIndex + 1} of{" "}
                      {examData.questions.length}
                    </span>
                  </div>

                  <button
                    onClick={goToNext}
                    disabled={
                      currentQuestionIndex === examData.questions.length - 1
                    }
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Question Palette & Timer */}
          <div className="w-full lg:w-96 bg-white border-l">
            {/* Timer Section */}
            <div className="p-6 border-b">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock
                    className={`w-6 h-6 mr-2 ${
                      getTimeStatus() === "critical"
                        ? "text-red-500"
                        : getTimeStatus() === "warning"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Time Remaining
                  </h3>
                </div>
                <div
                  className={`text-3xl font-bold mb-2 ${
                    getTimeStatus() === "critical"
                      ? "text-red-600"
                      : getTimeStatus() === "warning"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <div
                  className={`text-sm px-3 py-1 rounded-full ${
                    getTimeStatus() === "critical"
                      ? "bg-red-100 text-red-700"
                      : getTimeStatus() === "warning"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {getTimeStatus() === "critical"
                    ? "Time Critical!"
                    : getTimeStatus() === "warning"
                    ? "Time Warning"
                    : "Time Remaining"}
                </div>
              </div>
            </div>

            {/* Question Palette */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Question Palette
                </h3>
                <button
                  onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {showQuestionPalette ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {showQuestionPalette && (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {examData.questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      return (
                        <button
                          key={index}
                          onClick={() => goToQuestion(index)}
                          className={`relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all hover:shadow-md ${
                            index === currentQuestionIndex
                              ? "border-blue-500 bg-blue-500 text-white shadow-md"
                              : status === "answered"
                              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                          {status === "answered" &&
                            index !== currentQuestionIndex && (
                              <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                            )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">
                        Current Question
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded flex items-center justify-center">
                        <CheckCircle className="w-2 h-2 text-green-500" />
                      </div>
                      <span className="text-sm text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">
                        Not Answered
                      </span>
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Progress Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Answered:</span>
                        <span className="font-semibold text-green-600">
                          {getSubmissionStats().answered}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-orange-600">
                          {getSubmissionStats().unanswered}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-blue-600">
                          {getSubmissionStats().total}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.round(
                            (getSubmissionStats().answered /
                              getSubmissionStats().total) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (getSubmissionStats().answered /
                                getSubmissionStats().total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Exam</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-2">
                Make sure to review all answers before submitting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Submit Exam</h2>
                  <p className="text-red-100 mt-1">
                    Please review your answers before final submission
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Submission Statistics */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Submission Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {getSubmissionStats().total}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Total Questions
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {getSubmissionStats().answered}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Answered
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {getSubmissionStats().unanswered}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Unanswered
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      Time Remaining
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Review */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-gray-600" />
                  Answer Review
                </h3>

                {getAnswerSummary().map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                            Question {index + 1}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {question.questionType.replace("_", " ")}
                          </span>
                          <span className="text-sm text-purple-600 font-medium">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {question.questionText}
                        </p>
                      </div>
                      <div
                        className={`ml-4 px-4 py-2 rounded-full text-sm font-semibold ${
                          question.isAnswered
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {question.isAnswered ? "✓ Answered" : "⚠ Not Answered"}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Your Answer:
                      </p>
                      <div className="text-gray-800">
                        {question.answer === "Not answered" ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="italic">No answer provided</span>
                          </div>
                        ) : question.questionType === "ESSAY" ||
                          question.questionType === "SHORT_ANSWER" ? (
                          <div className="max-h-24 overflow-y-auto bg-white p-3 rounded border">
                            {question.answer.length > 300
                              ? `${question.answer.substring(0, 300)}...`
                              : question.answer}
                          </div>
                        ) : (
                          <div className="bg-white p-3 rounded border">
                            <span className="font-semibold text-blue-600">
                              {question.answer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings and Notices */}
              {getSubmissionStats().unanswered > 0 && (
                <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-800 font-semibold mb-1">
                        Incomplete Submission
                      </h4>
                      <p className="text-yellow-700">
                        You have{" "}
                        <strong>{getSubmissionStats().unanswered}</strong>{" "}
                        unanswered question(s). You can still submit your exam,
                        but consider reviewing them first to maximize your
                        score.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="text-blue-800 font-semibold mb-1">
                      Time Status
                    </h4>
                    <p className="text-blue-700">
                      Time remaining:{" "}
                      <strong>{formatTime(timeRemaining)}</strong>
                      {getTimeStatus() === "critical" && (
                        <span className="ml-2 text-red-600 font-semibold">
                          ⚠ Time is running out!
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {!connectionStatus && (
                <div className="mt-6 p-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-center space-x-3">
                    <WifiOff className="w-6 h-6 text-red-600" />
                    <div>
                      <h4 className="text-red-800 font-semibold mb-1">
                        Connection Warning
                      </h4>
                      <p className="text-red-700">
                        You are currently offline. Please check your internet
                        connection before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t rounded-b-2xl">
              <button
                onClick={() => setShowSubmissionModal(false)}
                disabled={submitting}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                <span>Review Answers</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  This action cannot be undone
                </div>
                <button
                  onClick={confirmSubmission}
                  disabled={submitting || !connectionStatus}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Final Exam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakingExam;
