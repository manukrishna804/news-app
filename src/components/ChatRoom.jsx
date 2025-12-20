import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import LoadingSpinner from './LoadingSpinner';

const ChatRoom = ({ newsTitle: propNewsTitle }) => {
  const { newsTitle: paramNewsTitle } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const chatContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Use propNewsTitle if available, otherwise use paramNewsTitle (decoded), otherwise use fallback
  const chatTitle = propNewsTitle || (paramNewsTitle ? decodeURIComponent(paramNewsTitle) : null) || 'General Chat';

  useEffect(() => {
    // Check authentication
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setError(null);
        console.log('[ChatRoom] User authenticated:', user.email, user.uid);
      } else {
        setCurrentUser(null);
        // Don't auto-redirect, allow viewing the "Login Required" state
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!chatTitle || !currentUser) {
      console.log('[ChatRoom] Waiting for requirements:', { chatTitle, hasUser: !!currentUser });
      return;
    }

    const safeChatTitle = chatTitle.replace(/[^a-zA-Z0-9]/g, '_');
    console.log('[ChatRoom] Setting up Firestore listener for:', safeChatTitle);

    // Set debug info for UI
    setDebugInfo({
      chatTitle,
      safeCollectionId: safeChatTitle,
      userId: currentUser.uid,
      path: `chats/${safeChatTitle}/messages`
    });

    try {
      // Create a safe collection path
      const chatRef = collection(db, 'chats', safeChatTitle, 'messages');
      const q = query(chatRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('[ChatRoom] Received messages:', messageList.length);
        setMessages(messageList);
        setError(null);
        setTimeout(scrollToBottom, 100);
      }, (err) => {
        console.error('[ChatRoom] Firestore Error:', err);
        console.error('[ChatRoom] Error Code:', err.code);
        console.error('[ChatRoom] Error Message:', err.message);

        if (err.code === 'permission-denied') {
          setError(`Access Denied: You do not have permission to view this chat. Check firestore.rules.`);
        } else {
          setError(`Error loading messages (${err.code}): ${err.message}`);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('[ChatRoom] Setup Error:', err);
      setError(`Error connecting to chat: ${err.message}`);
    }
  }, [chatTitle, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const safeChatTitle = chatTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const chatRef = collection(db, 'chats', safeChatTitle, 'messages');

      console.log('[ChatRoom] Attempting to send to:', safeChatTitle);

      const messageData = {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: currentUser.uid,
        userName: currentUser.email,
        createdAt: new Date().toISOString()
      };

      console.log('[ChatRoom] Message Payload:', messageData);

      const docRef = await addDoc(chatRef, messageData);
      console.log('[ChatRoom] Prepare Success, ID:', docRef.id);

      setNewMessage('');
      setError(null);
      scrollToBottom();
    } catch (err) {
      console.error('[ChatRoom] Send Error:', err);
      if (err.code === 'permission-denied') {
        setError(`Failed to send: Permission denied. You might not be authenticated correctly.`);
      } else {
        setError(`Failed to send: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] bg-gray-50 rounded-lg p-8 mx-auto max-w-md my-8 shadow-sm">
        <div className="mb-4 text-[#075E54]">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join the Discussion</h2>
        <p className="text-gray-600 text-center mb-6">Please log in to chat about "{chatTitle}" with others.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#075E54] hover:bg-[#054c44] text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-md"
        >
          Login to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto my-4">
      {/* Chat Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 className="font-semibold text-lg">{chatTitle}</h2>
          <p className="text-sm opacity-90">{messages.length} messages</p>
        </div>
        <div className="text-sm">
          {currentUser.email}
        </div>
      </div>

      {/* Debug Info (For Diagnostics) */}
      {debugInfo && (
        <div className="bg-yellow-50 p-2 text-xs font-mono border-b border-yellow-200 text-gray-600">
          <strong>DEBUG:</strong> Collection: {debugInfo.safeCollectionId} | UID: {debugInfo.userId.substring(0, 6)}...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Encountered</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation in {chatTitle}!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMyMessage = message.userId === currentUser?.uid;
            const showUserName = index === 0 || messages[index - 1]?.userId !== message.userId;

            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${isMyMessage
                    ? 'bg-[#DCF8C6] rounded-tr-none'
                    : 'bg-white rounded-tl-none'
                    }`}
                >
                  {!isMyMessage && showUserName && (
                    <div className="text-sm font-medium text-[#075E54]">
                      {message.userName ? message.userName.split('@')[0] : 'Anonymous'}
                    </div>
                  )}
                  <div className="text-[#303030]">{message.text}</div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
              disabled={isLoading || !!error}
            />
          </div>
          <button
            type="submit"
            className={`px-6 py-2 rounded-full transition-colors ${isLoading || error
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#075E54] hover:bg-[#054c44]'
              } text-white`}
            disabled={isLoading || !!error}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;