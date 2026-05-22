import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import './Interviews.css';

const Interviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      const response = await interviewService.getAll({ type: filter !== 'all' ? filter : undefined });
      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (interviewId) => {
    navigate(`/take-interview/${interviewId}`);
  };

  if (loading) {
    return <div className="loading">Loading interviews...</div>;
  }

  return (
    <div className="interviews">
      <div className="interviews-header">
        <h1>Interviews</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'technical' ? 'active' : ''} 
            onClick={() => setFilter('technical')}
          >
            Technical
          </button>
          <button 
            className={filter === 'behavioral' ? 'active' : ''} 
            onClick={() => setFilter('behavioral')}
          >
            Behavioral
          </button>
          <button 
            className={filter === 'system_design' ? 'active' : ''} 
            onClick={() => setFilter('system_design')}
          >
            System Design
          </button>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">
          <p>No interviews available</p>
        </div>
      ) : (
        <div className="interviews-grid">
          {interviews.map((interview) => (
            <div key={interview._id} className="interview-card">
              <div className="interview-card-header">
                <h3>{interview.title}</h3>
                <span className={`difficulty-badge ${interview.difficulty}`}>
                  {interview.difficulty}
                </span>
              </div>
              <p className="interview-description">{interview.description}</p>
              <div className="interview-meta">
                <span className="interview-type">{interview.type}</span>
                <span className="interview-category">{interview.category}</span>
                <span className="interview-duration">{interview.maxDuration} min</span>
              </div>
              <div className="interview-footer">
                <span className="questions-count">{interview.questions?.length || 0} questions</span>
                <button 
                  className="start-button"
                  onClick={() => handleStartInterview(interview._id)}
                >
                  Start Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;
