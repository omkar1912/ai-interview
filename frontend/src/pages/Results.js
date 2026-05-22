import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { answerService, interviewService } from '../services/api';
import './Results.css';

const Results = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [interviewId]);

  const fetchResults = async () => {
    try {
      const [resultsRes, interviewRes] = await Promise.all([
        answerService.getResults(interviewId),
        interviewService.getById(interviewId)
      ]);

      setResults(resultsRes.data.data);
      setInterview(interviewRes.data.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (!results) {
    return <div className="error">No results found</div>;
  }

  const totalScore = results.answers?.reduce((acc, answer) => acc + (answer.score || 0), 0) || 0;
  const maxScore = results.answers?.length * 100 || 100;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="results">
      <div className="results-header">
        <h1>Interview Results</h1>
        {interview && <p className="interview-title">{interview.title}</p>}
      </div>

      <div className="score-summary">
        <div className="score-card">
          <h3>Total Score</h3>
          <div className="score-display">
            <span className="score-number">{percentage}%</span>
            <span className="score-detail">{totalScore} / {maxScore}</span>
          </div>
        </div>
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-label">Questions Answered</span>
            <span className="stat-value">{results.answers?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">
              {Math.round((results.totalTime || 0) / 60)} min
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed At</span>
            <span className="stat-value">
              {new Date(results.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="answers-list">
        <h2>Detailed Answers</h2>
        {results.answers?.map((answer, index) => (
          <div key={answer._id} className="answer-card">
            <div className="answer-header">
              <span className="question-number">Question {index + 1}</span>
              {answer.score !== null && (
                <span className={`score-badge ${answer.score >= 70 ? 'good' : answer.score >= 50 ? 'average' : 'poor'}`}>
                  Score: {answer.score}/100
                </span>
              )}
            </div>
            <p className="question-text">{answer.question?.text}</p>
            <div className="answer-content">
              <h4>Your Answer:</h4>
              <p>{answer.answer}</p>
            </div>
            {answer.feedback && (
              <div className="feedback-content">
                <h4>Feedback:</h4>
                <p>{answer.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button onClick={() => navigate('/interviews')} className="back-button">
          Back to Interviews
        </button>
        <button onClick={() => navigate('/dashboard')} className="dashboard-button">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
