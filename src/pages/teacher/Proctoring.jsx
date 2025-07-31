import React, { useState, useEffect } from "react";
import { Play, Square, Users, AlertTriangle, Camera, Eye } from "lucide-react";

const SimpleProctoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data
  const students = [
    { id: 1, name: "Lahiru Dilhan", status: "active", warnings: 0 },
    { id: 2, name: "Sameera Sampath", status: "active", warnings: 0 },
    { id: 3, name: "Sachina Dilminda Davis", status: "active", warnings: 0 },
    {
      id: 4,
      name: "Ridmika Athuraliya",
      status: "active",
      warnings: 0,
    },
    { id: 5, name: "Eva Brown", status: "active", warnings: 0 },
    { id: 6, name: "Frank Miller", status: "warning", warnings: 3 },
  ];

  const alerts = [
    // {
    //   id: 1,
    //   student: "Lahiru Dilhan",
    //   message: "Multiple tab switches",
    //   time: "2 min ago",
    // },
    // {
    //   id: 2,
    //   student: "Frank Miller",
    //   message: "Camera feed lost",
    //   time: "5 min ago",
    // },
    // {
    //   id: 3,
    //   student: "David Wilson",
    //   message: "No activity detected",
    //   time: "3 min ago",
    // },
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "warning":
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case "inactive":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <Eye className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Exam Monitor</h1>
            <p className="text-gray-600 text-sm">Mid Term Test</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                Time: {formatTime(recordingTime)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {students.length} students
              </span>
            </div>
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isMonitoring
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isMonitoring ? "bg-red-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span>{isMonitoring ? "LIVE" : "OFFLINE"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Area */}
        <div className="flex-1 p-6">
          {/* Controls */}
          <div className="bg-white rounded-lg p-4 mb-6 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {!isMonitoring ? (
                  <button
                    onClick={() => setIsMonitoring(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Monitoring</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMonitoring(false);
                      setRecordingTime(0);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Monitoring</span>
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {isMonitoring ? "Monitoring active" : "Click start to begin"}
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Student Feed</h2>
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Camera Active</span>
              </div>
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative">
              {selectedStudent ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-white">
                        {selectedStudent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-gray-500">Live Camera Feed</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a student to view their feed
                    </p>
                  </div>
                </div>
              )}

              {isMonitoring && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>REC</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l p-6">
          {/* Students */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students ({students.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id
                      ? "bg-blue-50 border-blue-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {student.name}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {getStatusIcon(student.status)}
                          <span className="text-xs text-gray-500 capitalize">
                            {student.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {student.warnings > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {student.warnings}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Alerts ({alerts.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {alert.student}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        {alert.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProctoring;
