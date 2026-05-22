import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../services/api';
import { toast } from 'react-toastify';
import './CreateQuestion.css';

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    type: 'open_ended',
    difficulty: 'medium',
    category: '',
    expectedAnswer: '',
    timeLimit: 10,
    tags: []
  });
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = field === 'isCorrect' ? value : value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData = {
        ...formData,
        options: formData.type === 'multiple_choice' ? options : []
      };

      await questionService.create(questionData);
      toast.success('Question created successfully');
      navigate('/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-question">
      <h1>Create Question</h1>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label>Question Text *</label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Enter your question here..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Question Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="open_ended">Open Ended</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="coding">Coding</option>
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
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

        <div className="form-group">
          <label>Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="e.g., JavaScript, React, Algorithms"
          />
        </div>

        <div className="form-group">
          <label>Expected Answer</label>
          <textarea
            name="expectedAnswer"
            value={formData.expectedAnswer}
            onChange={handleChange}
            rows={3}
            placeholder="Enter the expected answer or key points..."
          />
        </div>

        <div className="form-group">
          <label>Time Limit (minutes)</label>
          <input
            type="number"
            name="timeLimit"
            value={formData.timeLimit}
            onChange={handleChange}
            min="1"
            max="120"
          />
        </div>

        {formData.type === 'multiple_choice' && (
          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                  />
                  Correct
                </label>
                {options.length > 1 && (
                  <button type="button" onClick={() => removeOption(index)} className="remove-btn">
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className="add-option-btn">
              + Add Option
            </button>
          </div>
        )}

        <div className="form-group">
          <label>Tags</label>
          <div className="tag-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tags (press Enter)"
            />
            <button type="button" onClick={handleAddTag} className="add-tag-btn">
              Add
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="remove-tag">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/questions')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;
