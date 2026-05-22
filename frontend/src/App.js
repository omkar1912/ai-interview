import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Interviews from './pages/Interviews';
import InterviewDetail from './pages/InterviewDetail';
import CreateInterview from './pages/CreateInterview';
import Questions from './pages/Questions';
import CreateQuestion from './pages/CreateQuestion';
import Profile from './pages/Profile';
import TakeInterview from './pages/TakeInterview';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/interviews" element={<PrivateRoute><Interviews /></PrivateRoute>} />
          <Route path="/interviews/:id" element={<PrivateRoute><InterviewDetail /></PrivateRoute>} />
          <Route path="/create-interview" element={<AdminRoute><CreateInterview /></AdminRoute>} />
          <Route path="/questions" element={<PrivateRoute><Questions /></PrivateRoute>} />
          <Route path="/create-question" element={<AdminRoute><CreateQuestion /></AdminRoute>} />
          <Route path="/take-interview/:id" element={<PrivateRoute><TakeInterview /></PrivateRoute>} />
          <Route path="/results/:interviewId" element={<PrivateRoute><Results /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;