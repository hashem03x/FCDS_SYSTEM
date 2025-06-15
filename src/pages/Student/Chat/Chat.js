import React, { useState, useEffect } from 'react';
import './Chat.css';
import { useAuth } from '../../../context/AuthContext';

const Chat = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch initial chats when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchChats(user.id);
    }
  }, [user?.id]);

  // Search users when search query changes
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchUsers = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://college-system-two.vercel.app/api/chat/search?search=${query}&id=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Failed to search users. Please try again later.');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (userId) => {
    if (!userId) {
      setError('User ID is required to fetch chats');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://college-system-two.vercel.app/api/chat?id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      setRecentChats(data.map(chat => ({
        id: chat.chatId,
        name: chat.targetUserName,
        lastMessage: 'Click to start chatting',
        timestamp: new Date(chat.updatedAt).toLocaleString(),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      })));
    } catch (err) {
      setError('Failed to load chats. Please try again later.');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    if (!user?.id) {
      setError('User ID is required to fetch messages');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://college-system-two.vercel.app/api/chat/message/${chatId}?id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data.map(message => ({
        id: message.id,
        sender: message.senderId === user.id ? 'me' : message.senderId,
        text: message.content,
        timestamp: new Date(message.timestamp).toLocaleString()
      })));
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    await fetchChatMessages(user.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?.id || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const messageData = {
        id: user?.id,
        chatId: selectedUser?.id,
        content: newMessage.trim()
      };

      const response = await fetch(`http://college-system-two.vercel.app/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },

        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Add the message to the local state
      const message = {
        id: messages.length + 1,
        sender: 'me',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([...messages, message]);
      setNewMessage('');

      // Refresh messages to get the latest state
      await fetchChatMessages(selectedUser.id);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="recent-chats">
          <h3>{searchQuery ? 'Search Results' : 'Recent Chats'}</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : searchQuery ? (
            searchResults.length === 0 ? (
              <div className="no-chats">No users found</div>
            ) : (
              searchResults.map(user => (
                <div
                  key={user.id}
                  className="chat-item"
                  onClick={() => handleUserSelect({
                    id: user.id,
                    name: user.name,
                    lastMessage: 'Click to start chatting',
                    timestamp: new Date().toLocaleString()
                  })}
                >
                  <div className="chat-item-info">
                    <h4>{user.name}</h4>
                    <p className="chat-last-message">Click to start chatting</p>
                  </div>
                </div>
              ))
            )
          ) : recentChats.length === 0 ? (
            <div className="no-chats">No chats found</div>
          ) : (
            recentChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedUser?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleUserSelect(chat)}
              >
                <div className="chat-item-info">
                  <h4>{chat.name}</h4>
                  <p className="chat-last-message">{chat.lastMessage}</p>
                </div>
                <span className="chat-timestamp">{chat.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>{selectedUser.name}</h3>
            </div>
            
            <div className="messages-container">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">No messages yet</div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-timestamp">{message.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="message-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 