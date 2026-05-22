import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { interviewService, questionService } from '../services/api';
import { toast } from 'react-toastify';
import './CreateInterview.css';

const CreateInterview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'mixed',
    difficulty: 'medium',
    category: '',
    maxDuration: 60
  });
  const [questions, setQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchInterview();
    }
    fetchQuestions();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await interviewService.getById(id);
      const interview = response.data.data;
      setFormData({
        title: interview.title,
        description: interview.description,
        type: interview.type,
        difficulty: interview.difficulty,
        category: interview.category,
        maxDuration: interview.maxDuration
      });
      setSelectedQuestions(interview.questions?.map(q => q._id) || []);
    } catch (error) {
      console.error('Error fetching interview:', error);
      toast.error('Failed to load interview');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getAll();
      setAvailableQuestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const interviewData = {
        ...formData,
        questions: selectedQuestions
      };

      if (isEditing) {
        await interviewService.update(id, interviewData);
        toast.success('Interview updated successfully');
      } else {
        await interviewService.create(interviewData);
        toast.success('Interview created successfully');
      }
      navigate('/interviews');
    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error(isEditing ? 'Failed to update interview' : 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-interview">
      <h1>{isEditing ? 'Edit Interview' : 'Create Interview'}</h1>
      
      <form onSubmit={handleSubmit} className="interview-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter interview title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter interview description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="system_design">System Design</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty *</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g., Frontend, Backend, DevOps"
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="maxDuration"
                value={formData.maxDuration}
                onChange={handleChange}
                required
                min="10"
                max="180"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Select Questions</h2>
          <p className="section-hint">Select questions to include in this interview</p>
          
          {availableQuestions.length === 0 ? (
            <p className="no-questions">No questions available. Create questions first.</p>
          ) : (
            <div className="questions-list">
              {availableQuestions.map((question) => (
                <div key={question._id} className="question-item">
                  <label className="question-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question._id)}
                      onChange={() => handleQuestionToggle(question._id)}
                    />
                    <div className="question-content">
                      <p className="question-text">{question.text}</p>
                      <div className="question-meta">
                        <span className={`difficulty-badge ${question.difficulty}`}>
                          {question.difficulty}
                        </span>
                        <span className="type-badge">{question.type}</span>
                        <span className="category-badge">{question.category}</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          <div className="selected-count">
            {selectedQuestions.length} question(s) selected
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/interviews')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading || selectedQuestions.length === 0} className="submit-button">
            {loading ? 'Saving...' : isEditing ? 'Update Interview' : 'Create Interview'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInterview;
