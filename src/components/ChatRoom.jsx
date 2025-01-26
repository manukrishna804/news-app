import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';

const ChatRoom = () => {
  const { newsTitle } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const chatContainerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setError(null);
      } else {
        setCurrentUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!newsTitle || !currentUser) return;

    try {
      const chatRef = collection(db, 'chats', newsTitle, 'messages');
      const q = query(chatRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messageList);
        setError(null);
        setTimeout(scrollToBottom, 100);
      }, (error) => {
        console.error('Error fetching messages:', error);
        setError('Error loading messages. Please try again later.');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error);
      setError('Error connecting to chat. Please try again later.');
    }
  }, [newsTitle, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const chatRef = collection(db, 'chats', newsTitle, 'messages');
      await addDoc(chatRef, {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        userName: currentUser.email,
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
      setError(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto my-4">
      {/* Chat Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 className="font-semibold text-lg">{decodeURIComponent(newsTitle)}</h2>
          <p className="text-sm opacity-90">{messages.length} messages</p>
        </div>
        <div className="text-sm">
          {currentUser.email}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5]"
        style={{
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundSize: 'contain'
        }}
      >
        {messages.map((message, index) => {
          const isMyMessage = message.userId === currentUser?.uid;
          const showUserName = index === 0 || messages[index - 1]?.userId !== message.userId;

          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isMyMessage 
                    ? 'bg-[#DCF8C6] rounded-tr-none' 
                    : 'bg-white rounded-tl-none'
                }`}
              >
                {!isMyMessage && showUserName && (
                  <div className="text-sm font-medium text-[#075E54]">
                    {message.userName.split('@')[0]}
                  </div>
                )}
                <div className="text-[#303030]">{message.text}</div>
                <div className="text-xs text-gray-500 text-right mt-1">
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-gray-50 px-4 py-3 rounded-b-lg">
        <form onSubmit={sendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#075E54]"
              placeholder="Type a message"
              disabled={!!error}
            />
          </div>
          <button
            type="submit"
            className={`px-6 py-2 rounded-full transition-colors ${
              error 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#075E54] hover:bg-[#054c44]'
            } text-white`}
            disabled={!!error}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;