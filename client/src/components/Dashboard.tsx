import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Dashboard.css'; // Move styles here (shown below)

const socket = io();

const Dashboard = () => {
  const [username, setUsername] = useState('Loading...');
  const [category, setCategory] = useState('');
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Fetch user profile
    fetch('/user')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUsername(data.username))
      .catch(() => (window.location.href = '/login.html'));

    // Receive messages
    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim()) {
      socket.emit('message', input);
      setMessages(prev => [...prev, { user: 'You', text: input }]);
      setInput('');
    }
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setMessages([]);
  };

  const showProfile = () => {
    fetch('/user')
      .then(res => res.json())
      .then(data => {
        setCategory('profile');
        setMessages([]);
        setInput('');
        setUsername(data.username);
      });
  };

  const handleLogout = () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      fetch('/logout', { method: 'POST' })
        .then(() => (window.location.href = '/login.html'))
        .catch(() => (window.location.href = '/login.html'));
    }, 500);
  };

  return (
    <div className="dashboard-body">
      <div className="sidebar">
        <h2>EduConnect Hub</h2>
        <ul>
          {['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Alumni', 'Faculty', 'General'].map(cat => (
            <li key={cat}><a onClick={() => handleCategory(cat)}>{cat}</a></li>
          ))}
        </ul>
        <div className="footer">
          <a onClick={showProfile}>My Profile</a>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div id="profile-name">Welcome, {username}</div>

      <div className="main-content">
        {category === 'profile' ? (
          <div className="profile-content">
            <h1>My Profile</h1>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Email:</strong> Not available</p>
            <p><strong>Department:</strong> Computer Science</p>
            <p><strong>Status:</strong> Active</p>
            <button onClick={() => handleCategory('General')}>Back to Dashboard</button>
          </div>
        ) : category ? (
          <>
            <div className="category-badge">{category}</div>
            <h1>Welcome to {category} Section!</h1>
            <p>Here you will find resources and discussions for {category}.</p>
            <div className="chat-container">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.user === 'You' ? 'user-message' : 'other-message'}`}>
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={input}
                placeholder="Type your message..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="welcome-box">
            <div className="welcome-icon">👋</div>
            <h1>Welcome to EduConnect Hub!</h1>
            <p>Your educational networking platform. Select a category from the sidebar to join discussions, connect with peers, and access resources.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
