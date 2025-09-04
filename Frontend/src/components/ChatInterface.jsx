import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatInterface = ({ messages, setMessages, theme }) => {
  const { darkMode, setDarkMode, neumorph, bgColor, cardColor, textColor, borderColor } = theme;
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Backend configuration
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputValue]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the RAG system
      const conversationHistory = [...messages, userMessage];
      
      // Send request to backend
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        history: conversationHistory
      });

      // Handle the response based on its structure
      let responseContent = '';
      if (response.data.response) {
        const ragResponse = response.data.response;
        
        if (ragResponse.response_text) {
          // Conversational response
          responseContent = ragResponse.response_text;
        } else if (ragResponse.summaryOfRights) {
          // Structured response - format it nicely
          responseContent = formatStructuredResponse(ragResponse);
        } else {
          responseContent = JSON.stringify(ragResponse, null, 2);
        }
      } else {
        responseContent = 'Sorry, I received an unexpected response format.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      let errorMessage = 'Sorry, something went wrong while processing your request.';
      
      if (error.response?.status === 503) {
        errorMessage = 'The legal knowledge system is currently unavailable. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    }

    setIsLoading(false);
  };

  const formatStructuredResponse = (response) => {
    let formatted = '';
    
    if (response.summaryOfRights) {
      formatted += `**Summary of Rights:**\n${response.summaryOfRights}\n\n`;
    }
    
    if (response.relevantActsAndArticles && response.relevantActsAndArticles.length > 0) {
      formatted += '**Relevant Acts and Articles:**\n';
      response.relevantActsAndArticles.forEach((item, index) => {
        formatted += `${index + 1}. **${item.name}**: ${item.explanation}\n`;
      });
      formatted += '\n';
    }
    
    if (response.similarCaseLaw && response.similarCaseLaw.length > 0) {
      formatted += '**Similar Case Law:**\n';
      response.similarCaseLaw.forEach((item, index) => {
        formatted += `${index + 1}. **${item.name}**: ${item.principle}\n`;
      });
      formatted += '\n';
    }
    
    if (response.nextSteps && response.nextSteps.length > 0) {
      formatted += '**Next Steps:**\n';
      response.nextSteps.forEach((step, index) => {
        formatted += `${index + 1}. ${step}\n`;
      });
    }
    
    return formatted.trim();
  };

  return (
    <div className={`flex flex-col h-full ${cardColor} shadow-lg rounded-lg overflow-hidden m-2 border ${borderColor}`}>
      {/* Messages container */}
      <div className={`flex-1 p-4 overflow-y-auto ${bgColor}`}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : `${cardColor} rounded-bl-none`
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="whitespace-pre-line">{message.content}</div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className={`p-4 ${cardColor} border-t ${borderColor}`}>
        <form onSubmit={handleSubmit} className="flex items-start space-x-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your legal rights, relevant laws, or case precedents..."
            className={`flex-1 ${bgColor} ${borderColor} border rounded-lg px-4 py-2 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows="1"
            style={{ maxHeight: '150px' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`bg-blue-500 text-white rounded-full px-4 py-2 self-end hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 hover:${neumorph}`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;