"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  reactions?: Record<string, number>;
};

type User = {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
  customStatus?: string;
};

const possibleReplies = [
  "Thanks for your message!",
  "I'll get back to you shortly.",
  "Interesting point!",
  "Let me check on that.",
  "Agreed!",
  "Can we discuss this tomorrow?",
  "That's a great question!",
  "Let me think about that...",
  "Could you clarify that?",
  "I'll need to check my schedule",
];

export default function MessagingApp() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState<User[]>([
    { id: '1', name: 'You', status: 'online', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', name: 'Sarah Parker', status: 'online', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', customStatus: 'Available' },
    { id: '3', name: 'Mike Chen', status: 'away', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', customStatus: 'In a meeting' },
    { id: '4', name: 'Emma Wilson', status: 'offline', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '5', name: 'Alex Turner', status: 'online', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', customStatus: 'Working' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [reactionButtonPos, setReactionButtonPos] = useState<{x: number; y: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }
    };
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: possibleReplies[Math.floor(Math.random() * possibleReplies.length)],
        sender: onlineUsers[1].id,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  const addReaction = (emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === selectedMessageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: (msg.reactions?.[emoji] || 0) + 1
              }
            }
          : msg
      )
    );
    setSelectedMessageId(null);
    setReactionButtonPos(null);
  };

  // Landing Page Components
  const Navbar = () => (
    <nav className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <div className="container mx-auto flex justify-between items-center">
        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>ChatApp</span>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className={`p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} mt-auto`}>
      <div className="container mx-auto text-center">
        <p>© 2025 ChatApp. All rights reserved.</p>
      </div>
    </footer>
  );

  const handleGetStarted = () => {
    setShowLanding(false);
    setTimeout(() => setShowApp(true), 500);
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (showLanding) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Welcome to ChatApp
            </h1>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect and collaborate with your team in real-time
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 rounded-lg text-lg font-medium ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col md:flex-row transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex justify-between items-center border-b">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          ☰
        </button>
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </motion.button>
      </div>

      {/* Mobile Sidebar */}
      <motion.div 
        className={`w-80 border-r p-4 fixed left-0 top-0 bottom-0 z-50 md:hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        initial={{ x: -320 }}
        animate={{ x: showSidebar ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contacts</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className={`text-2xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          {onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Image
                  width={48}
                  height={48}
                  className="rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                  theme === 'dark' ? 'border-gray-800' : 'border-white'
                } ${
                  user.status === 'online' ? 'bg-green-500' :
                  user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {user.name}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.customStatus || (user.status === 'away' ? 'Away' : user.status)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fixed Desktop Sidebar */}
      <motion.div 
        className={`w-80 border-r p-4 hidden md:block fixed left-0 top-0 bottom-0 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contacts</h2>
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </motion.button>
        </div>
        <div className="space-y-3">
          {onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Image
                  width={48}
                  height={48}
                  className="rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                  theme === 'dark' ? 'border-gray-800' : 'border-white'
                } ${
                  user.status === 'online' ? 'bg-green-500' :
                  user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {user.name}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.customStatus || (user.status === 'away' ? 'Away' : user.status)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:ml-80">
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 relative"
          style={{ 
            maxHeight: 'calc(100vh - 140px)',
            overscrollBehavior: 'contain'
          }}
        >
          <AnimatePresence>
                  {messages.map((message) => {
                    const sender = onlineUsers.find(u => u.id === message.sender);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.02 }}
                        >
                          {/* Message bubble with proper rounded corners */}
                          <div className={`p-4 rounded-2xl max-w-md ${
                            message.sender === 'user'
                              ? theme === 'dark' 
                                ? 'bg-blue-700 rounded-tr-sm rounded-br-none' 
                                : 'bg-blue-600 rounded-tr-sm rounded-br-none'
                              : theme === 'dark' 
                                ? 'bg-gray-700 rounded-tl-sm rounded-bl-none' 
                                : 'bg-white border border-gray-300 rounded-tl-sm rounded-bl-none'
                          }`}>
                            {/* Message content remains the same */}
                            {sender && message.sender !== 'user' && (
                              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {sender.name}
                              </p>
                            )}
                            <p className={message.sender === 'user' ? 'text-white' : theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}>
                              {message.text}
                            </p>
                            {message.reactions && (
                              <motion.div 
                                className="flex flex-wrap gap-1 mt-2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                {Object.entries(message.reactions).map(([emoji, count]) => (
                                  <motion.span
                                    key={emoji}
                                    className={`text-sm px-1.5 py-0.5 rounded-full ${
                                      theme === 'dark' 
                                        ? 'bg-gray-700/80 text-gray-100' 
                                        : 'bg-gray-200/90 text-gray-800'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {emoji} {count > 1 ? count : ''}
                                  </motion.span>
                                ))}
                              </motion.div>
                            )}
                          </div>

                          {/* Reaction button - properly positioned for each message type */}
                          <motion.button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const viewportWidth = window.innerWidth;
                              const pickerWidth = 280;
                              
                              // Calculate position based on message type
                              let adjustedX = message.sender === 'user' 
                                ? rect.left - pickerWidth + 40  // Position left for sent messages
                                : rect.left;                   // Position right for received
                              
                              // Ensure it stays within viewport
                              if (adjustedX + pickerWidth > viewportWidth) {
                                adjustedX = viewportWidth - pickerWidth - 10;
                              }
                              if (adjustedX < 10) {
                                adjustedX = 10;
                              }
                              
                              setReactionButtonPos({
                                x: adjustedX,
                                y: rect.top
                              });
                              setSelectedMessageId(message.id);
                            }}
                            className={`absolute -bottom-3 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-white/90 text-gray-800 shadow-sm' 
                                : 'bg-blue-500/90 text-white shadow-sm'
                            } ${
                              message.sender === 'user'
                                ? 'left-0 -bottom-3'  // Right side for sent messages
                                : 'right-0 -bottom-3'   // Left side for received
                            }`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <span className="text-lg">➕</span>
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <div 
            className={`border-t p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
            style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: theme === 'dark' ? 'rgb(17 24 39)' : 'rgb(255 255 255)',
              zIndex: 10, // Add z-index to ensure it stays above other elements
              marginTop: 'auto' // This ensures it sticks to the bottom
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className={`flex-1 p-3 rounded-xl transition-all duration-200 focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white focus:ring-blue-600 placeholder-gray-400'
                    : 'bg-white text-gray-800 focus:ring-blue-500 placeholder-gray-500 border border-gray-300'
                }`}
              />
              <motion.button
                onClick={handleSend}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-medium ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                Send
              </motion.button>
            </div>
          </div>
      </div>

      {/* Reaction Picker Modal */}
      <AnimatePresence>
        {selectedMessageId && reactionButtonPos && (
          <motion.div
            className="fixed inset-0 bg-transparent z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedMessageId(null);
              setReactionButtonPos(null);
            }}
          >
            <motion.div
              className={`absolute p-2 rounded-2xl shadow-xl ${
                theme === 'dark' 
                  ? 'bg-[#262626] border border-[#363636]' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                top: `${reactionButtonPos.y - 50}px`,
                left: `${reactionButtonPos.x - 20}px`,
              }}
              initial={{ y: 20, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1 px-2 items-center">
                <div className="flex space-x-1 overflow-x-auto max-w-[280px] scrollbar-hide">
                  {['👍', '❤️', '😄', '😲', '😢', '👎', '🎉', '🚀', '💡', '🤔', '🙌', '🔥'].map(emoji => (
                    <motion.button
                      key={emoji}
                      onClick={() => addReaction(emoji)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-2xl p-2 rounded-full hover:bg-gray-100/20 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
