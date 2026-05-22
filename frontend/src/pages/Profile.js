import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, uploadService } from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data.data;
      setFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      await uploadService.uploadResume(resumeFile);
      toast.success('Resume uploaded successfully');
      setResumeFile(null);
      fetchProfile();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      
      <div className="profile-container">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                disabled
              />
            </div>

            <button type="submit" className="update-button">
              Update Profile
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Resume</h2>
          <div className="resume-upload">
            <div className="upload-area">
              <input
                type="file"
                id="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <label htmlFor="resume" className="upload-label">
                {resumeFile ? resumeFile.name : 'Choose Resume File'}
              </label>
              <p className="upload-hint">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
            <button
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploading}
              className="upload-button"
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>

          {user?.resumeUrl && (
            <div className="current-resume">
              <h3>Current Resume</h3>
              <a href={`/uploads/${user.resumeUrl}`} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Account Actions</h2>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
