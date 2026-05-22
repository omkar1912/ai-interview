import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Questions.css';

const Questions = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getAll({ 
        type: filter !== 'all' ? filter : undefined 
      });
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await questionService.delete(questionId);
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div className="questions">
      <div className="questions-header">
        <h1>Question Sets</h1>
        {isAdmin() && (
          <button 
            className="create-button"
            onClick={() => navigate('/create-question')}
          >
            Create Question Set
          </button>
        )}
      </div>

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'multiple_choice' ? 'active' : ''} 
          onClick={() => setFilter('multiple_choice')}
        >
          Multiple Choice
        </button>
        <button 
          className={filter === 'open_ended' ? 'active' : ''} 
          onClick={() => setFilter('open_ended')}
        >
          Open Ended
        </button>
        <button 
          className={filter === 'coding' ? 'active' : ''} 
          onClick={() => setFilter('coding')}
        >
          Coding
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions available</p>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((question) => (
            <div key={question._id} className="question-card">
              <div className="question-card-header">
                <h3>{question.text}</h3>
                <span className={`difficulty-badge ${question.difficulty}`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="question-meta">
                <span className="question-type">{question.type}</span>
                <span className="question-category">{question.category}</span>
                {question.timeLimit && (
                  <span className="question-time">{question.timeLimit} min</span>
                )}
              </div>
              {question.tags && question.tags.length > 0 && (
                <div className="question-tags">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              {isAdmin() && (
                <div className="question-actions">
                  <button 
                    className="edit-button"
                    onClick={() => navigate(`/questions/${question._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(question._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;
