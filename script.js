import React, { useState, useEffect } from 'react';
import './styles.css'; // Assuming you put styles.css in src

function App() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'; // Default for local dev

    // Fetch messages
    const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/messages`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data.reverse()); // Show newest first
        } catch (err) {
            setError('Failed to fetch messages. Please try again later.');
            console.error('Error fetching messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Set up polling to refresh messages every 10 seconds
        const intervalId = setInterval(fetchMessages, 10000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Handle new message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return; // Don't send empty messages

        try {
            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNewMessage(''); // Clear input
            fetchMessages(); // Refresh messages
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Error sending message:', err);
        }
    };

    return (
        <div className="container">
            <h1>WhisperWeb</h1>
            <p className="subtitle">Text anonymously. Share your thoughts, feelings, or just say hi!</p>

            <form onSubmit={handleSubmit} className="message-form">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your anonymous message here..."
                    maxLength="500"
                    rows="4"
                ></textarea>
                <button type="submit">Send Anonymously</button>
            </form>

            {error && <p className="error-message">{error}</p>}

            <div className="messages-section">
                <h2>Recent Whispers</h2>
                {isLoading ? (
                    <p>Loading whispers...</p>
                ) : messages.length === 0 ? (
                    <p>No whispers yet. Be the first to send one!</p>
                ) : (
                    <div className="message-list">
                        {messages.map((msg) => (
                            <div key={msg._id} className="message-card">
                                <p>{msg.content}</p>
                                <span className="timestamp">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;