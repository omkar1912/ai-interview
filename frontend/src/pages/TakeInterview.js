import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService, answerService } from '../services/api';
import { toast } from 'react-toastify';
import './TakeInterview.css';

const TakeInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  useEffect(() => {
    if (interview && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && interview) {
      handleSubmit();
    }
  }, [timeLeft, interview]);

  const fetchInterview = async () => {
    try {
      const response = await interviewService.getById(id);
      const interviewData = response.data.data;
      setInterview(interviewData);
      setTimeLeft(interviewData.maxDuration * 60);
    } catch (error) {
      console.error('Error fetching interview:', error);
      toast.error('Failed to load interview');
      navigate('/interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < (interview?.questions?.length - 1)) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    const unansweredQuestions = interview?.questions?.filter(
      q => !answers[q._id] || answers[q._id].trim() === ''
    );

    if (unansweredQuestions?.length > 0 && timeLeft > 0) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const answerData = {
        interview: id,
        answers: interview.questions.map(q => ({
          question: q._id,
          answer: answers[q._id] || ''
        }))
      };

      await answerService.submit(answerData);
      toast.success('Interview submitted successfully');
      navigate(`/results/${id}`);
    } catch (error) {
      console.error('Error submitting interview:', error);
      toast.error('Failed to submit interview');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading interview...</div>;
  }

  if (!interview) {
    return <div className="error">Interview not found</div>;
  }

  const currentQuestion = interview.questions?.[currentQuestionIndex];

  return (
    <div className="take-interview">
      <div className="interview-header">
        <h1>{interview.title}</h1>
        <div className="timer">
          <span className={`timer-display ${timeLeft < 300 ? 'warning' : ''}`}>
            Time Left: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
        />
        <span className="progress-text">
          Question {currentQuestionIndex + 1} of {interview.questions.length}
        </span>
      </div>

      {currentQuestion && (
        <div className="question-container">
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Q{currentQuestionIndex + 1}</span>
              <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            <h2 className="question-text">{currentQuestion.text}</h2>
            
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="options-list">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="option-label">
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option.text}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      checked={answers[currentQuestion._id] === option.text}
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type !== 'multiple_choice' && (
              <textarea
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="answer-textarea"
              />
            )}
          </div>

          <div className="navigation-buttons">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="nav-button previous"
            >
              Previous
            </button>
            
            {currentQuestionIndex < interview.questions.length - 1 ? (
              <button onClick={handleNext} className="nav-button next">
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="nav-button submit"
              >
                {submitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeInterview;
