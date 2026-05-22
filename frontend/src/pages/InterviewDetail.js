import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './InterviewDetail.css';

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await interviewService.getById(id);
      setInterview(response.data.data);
    } catch (error) {
      console.error('Error fetching interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    navigate(`/take-interview/${id}`);
  };

  const handleEdit = () => {
    navigate(`/create-interview/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interview?')) return;
    
    try {
      await interviewService.delete(id);
      navigate('/interviews');
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview');
    }
  };

  if (loading) {
    return <div className="loading">Loading interview...</div>;
  }

  if (!interview) {
    return <div className="error">Interview not found</div>;
  }

  return (
    <div className="interview-detail">
      <div className="detail-header">
        <h1>{interview.title}</h1>
        <div className="header-actions">
          <button onClick={handleStart} className="start-button">
            Start Interview
          </button>
          {isAdmin() && (
            <>
              <button onClick={handleEdit} className="edit-button">
                Edit
              </button>
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h2>Description</h2>
          <p>{interview.description || 'No description provided'}</p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>Type</h3>
            <p>{interview.type}</p>
          </div>
          <div className="info-card">
            <h3>Difficulty</h3>
            <p className={`difficulty ${interview.difficulty}`}>
              {interview.difficulty}
            </p>
          </div>
          <div className="info-card">
            <h3>Category</h3>
            <p>{interview.category}</p>
          </div>
          <div className="info-card">
            <h3>Duration</h3>
            <p>{interview.maxDuration} minutes</p>
          </div>
        </div>

        <div className="questions-section">
          <h2>Questions ({interview.questions?.length || 0})</h2>
          {interview.questions?.length > 0 ? (
            <div className="questions-list">
              {interview.questions.map((question, index) => (
                <div key={question._id} className="question-item">
                  <span className="question-index">Q{index + 1}</span>
                  <p className="question-text">{question.text}</p>
                  <div className="question-meta">
                    <span className="meta-tag">{question.type}</span>
                    <span className={`meta-tag difficulty ${question.difficulty}`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-questions">No questions added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
