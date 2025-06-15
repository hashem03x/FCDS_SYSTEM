import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './TopStudents.css';

const TopStudents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topStudents, setTopStudents] = useState({
    byLevel: {},
    byDepartment: {}
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTopStudents();
  }, []);

  const fetchTopStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://college-system-two.vercel.app/api/analytics/top-students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setTopStudents(data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again later.');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTopStudentsList = (students, title) => (
    <div className="top-students-section">
      <h3>{title}</h3>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : students.length === 0 ? (
        <div className="no-data">No data available</div>
      ) : (
        <div className="students-list">
          {students.map((student, index) => (
            <div key={student.id} className="student-card">
              <div className="rank">{index + 1}</div>
              <div className="student-info">
                <h4>{student.name}</h4>
                <p>ID: {student.id}</p>
                <p>GPA: {student.gpa.toFixed(2)}</p>
                {student.department && <p>Department: {student.department}</p>}
                {student.level && <p>Level: {student.level}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="analytics-container">
      <h2>Top Students Analytics</h2>
      
      <div className="analytics-grid">
        {Object.entries(topStudents.byLevel).map(([level, students]) => (
          <div key={level} className="analytics-card">
            {renderTopStudentsList(students, `Top 10 Students - Level ${level}`)}
          </div>
        ))}

        {Object.entries(topStudents.byDepartment).map(([department, students]) => (
          <div key={department} className="analytics-card">
            {renderTopStudentsList(students, `Top 10 Students - ${department}`)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStudents; 