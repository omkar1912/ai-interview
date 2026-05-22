import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewService, answerService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0,
    totalQuestions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [interviewsRes, answersRes] = await Promise.all([
        interviewService.getAll(),
        answerService.getAll()
      ]);

      const interviews = interviewsRes.data.data || [];
      const answers = answersRes.data.data || [];

      setStats({
        totalInterviews: interviews.length,
        completedInterviews: answers.length,
        pendingInterviews: interviews.length - answers.length,
        totalQuestions: interviews.reduce((acc, int) => acc + (int.questions?.length || 0), 0)
      });

      setRecentActivity(answers.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Interviews</h3>
          <p className="stat-number">{stats.totalInterviews}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{stats.completedInterviews}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pendingInterviews}</p>
        </div>
        <div className="stat-card">
          <h3>Total Questions</h3>
          <p className="stat-number">{stats.totalQuestions}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <ul className="activity-list">
            {recentActivity.map((activity) => (
              <li key={activity._id} className="activity-item">
                <span className="activity-date">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
                <span className="activity-text">
                  Completed interview: {activity.interview?.title || 'Unknown'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
