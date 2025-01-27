import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

function App() {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]); // Stores all messages
    const [user, setUser] = useState(''); // Stores the current user
    const [message, setMessage] = useState(''); // Stores the current message input
    const [notification, setNotification] = useState(''); // Stores notifications

    const messagesEndRef = useRef(null);

    // Fetch messages from the backend when the component mounts
    useEffect(() => {
        fetch('https://localhost:7076/api/Messages')
            .then(response => response.json())
            .then(data => setMessages(data)) // Set the fetched messages
            .catch(error => console.error('Error fetching messages:', error));
    }, []);

    // Initialize SignalR connection
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:7076/chathub', {
                skipNegotiation: true,
                transport: 1 // Use WebSockets directly
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    // Start SignalR connection and listen for messages
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected!');

                    // Listen for new messages
                    connection.on('ReceiveMessage', (user, text) => {
                        setMessages(prevMessages => [...prevMessages, { user, text }]);
                    });

                    // Listen for user join notifications
                    connection.on('UserJoined', (user) => {
                        setNotification(`${user} joined the chat`);
                        setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
                    });

                    // Listen for user leave notifications
                    connection.on('UserLeft', (user) => {
                        setNotification(`${user} left the chat`);
                        setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    // Scroll to the bottom of the messages list when a new message is added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send a new message
    const sendMessage = async () => {
        if (user && message) {
            try {
                // Send the message to the backend API
                await fetch('https://localhost:7076/api/Messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user, text: message })
                });

                // Clear the input field
                setMessage('');
            } catch (e) {
                console.log('Error sending message:', e);
            }
        }
    };

    // Notify other users when a new user joins
    const handleUserJoin = async () => {
        if (connection && user) {
            try {
                await connection.invoke('NotifyUserJoined', user);
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Chat App</h1>
            {notification && <div style={{ color: 'green', marginBottom: '10px' }}>{notification}</div>}
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={user}
                    onChange={e => setUser(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button onClick={handleUserJoin} style={{ padding: '5px 10px' }}>Join Chat</button>
            </div>
            <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{msg.user}: </strong>{msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter your message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px', width: '70%' }}
                />
                <button onClick={sendMessage} style={{ padding: '5px 10px' }}>Send</button>
            </div>
        </div>
    );
}

export default App;