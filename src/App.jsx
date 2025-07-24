import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./css/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import ProtectedRoute component
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Subject from "./pages/Subject";
import LoginForm from "./pages/Login";
import AdminDashboard from "./screens/admin/AdminDashboard";
import StudentDashboard from "./screens/student/StudentDashboard";
import TeacherDashboard from "./screens/teacher/TeacherDashboard";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import AddTeacher from "./pages/AddTeacher";
import AdminProfile from "./pages/AdminProfile";
import AddClass from "./pages/AddClass";
import ViewStudent from "./pages/ViewStudent";
import StudentProfile from "./pages/StudentProfile";
import ClassList from "./pages/ClassList";
import EditClass from "./pages/EditClass";
import StudentList from "./pages/StudentList";
import TeacherList from "./pages/TeacherList";
import EditTeacher from "./pages/EditTeacher";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherClass from "./pages/TeacherClass";
import ExamSchedule from "./pages/ExamSchedule";
import ExamList from "./pages/ExamList";
import ExamEdit from "./pages/ExamEdit";
import ExamDetails from "./pages/ExamDetails";
import ExamCreate from "./pages/ExamCreate";
import QuestionBank from "./pages/QuestionBank";
import ExamQuestions from "./pages/ExamQuestions";
import StudentClass from "./pages/StudentClass";
import TeacherClassEdit from "./pages/TeacherClassEdit";
import TeacherStudent from "./pages/TeacherStudent";
import TeacherStudentList from "./pages/TeacherStudentList";
import TeacherLiveExam from "./pages/TeacherLiveExam";
import Proctoring from "./pages/Proctoring";
import CompletedExam from "./pages/CompletedExam";
import StudentUpcomingExam from "./pages/StudentUpcomingExam";
import StudentTodayExam from "./pages/StudentTodayExam";
import ExamEnrollment from "./pages/ExamEnrollment";
import TakingExam from "./pages/TakingExam";
import ResultProcess from "./pages/ResultProcess";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        {/* Public Route - Login Page */}
        <Route path="/" element={<LoginForm />} />

        {/* Admin Routes - Only accessible by ADMIN role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subject"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Subject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classList"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ClassList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addClass"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editClass/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addStudent"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/EditStudent/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/viewStudent/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ViewStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/studentList"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teacherList"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TeacherList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addTeacher"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddTeacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editTeacher/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <EditTeacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* Student Routes - Only accessible by STUDENT role */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/myClasses"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/upcomingExam"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentUpcomingExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/todayExam"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentTodayExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/takingExam"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <TakingExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/enrollExam/:id"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <ExamEnrollment />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes - Only accessible by TEACHER role */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/class"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/examSchedule"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/examCreate"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/examList"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/editExam/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/examQuestion/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/examDetails/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ExamDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/questionBank"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <QuestionBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/editClass/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherClassEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/addStudent"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/studentList"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherStudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/liveExam"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <TeacherLiveExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/proctoring"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <Proctoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/completedExam"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <CompletedExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/resultProcess"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <ResultProcess />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route - redirect to login for unknown paths */}
        <Route path="*" element={<LoginForm />} />
      </Routes>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
