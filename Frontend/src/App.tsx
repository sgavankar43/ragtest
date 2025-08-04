import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChevronsRight, FileText, Landmark, Scale } from 'lucide-react';

// --- Define the structures ---
interface StructuredResponse {
  summaryOfRights?: string;
  relevantActsAndArticles?: { name: string; explanation: string }[];
  similarCaseLaw?: { name: string; principle: string }[];
  nextSteps?: string[];
  response_text?: string; // For conversational responses
}

interface Message {
  id: string;
  content: string; // We'll always store content as a string for the history
  structuredContent?: StructuredResponse; // Optional structured data for rendering
  role: 'user' | 'assistant';
  timestamp: Date;
}

// --- Structured Response Display Component (from before, no changes needed) ---
const StructuredResponseDisplay = ({ data }: { data: StructuredResponse }) => {
  // This component remains the same as the previous version
  return (
    <div className="space-y-4 text-sm">
      {data.summaryOfRights && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Summary of Your Rights</h3>
          <p className="text-slate-600 leading-relaxed">{data.summaryOfRights}</p>
        </div>
      )}
      {data.relevantActsAndArticles && data.relevantActsAndArticles.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Scale className="w-4 h-4 text-blue-500" />Relevant Acts & Articles</h3>
          <ul className="space-y-2">{data.relevantActsAndArticles.map((item, index) => <li key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="font-semibold text-slate-700">{item.name}</p><p className="text-slate-600 mt-1">{item.explanation}</p></li>)}</ul>
        </div>
      )}
      {data.similarCaseLaw && data.similarCaseLaw.length > 0 && (
         <div>
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Landmark className="w-4 h-4 text-blue-500" />Similar Case Law</h3>
          <ul className="space-y-2">{data.similarCaseLaw.map((item, index) => <li key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200"><p className="font-semibold text-slate-700">{item.name}</p><p className="text-slate-600 mt-1">{item.principle}</p></li>)}</ul>
        </div>
      )}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><ChevronsRight className="w-4 h-4 text-blue-500" />Potential Next Steps</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600">{data.nextSteps.map((step, index) => <li key={index}>{step}</li>)}</ul>
        </div>
      )}
    </div>
  );
};

// --- Updated ChatBubble Component ---
const ChatBubble = ({ message }: { message: Message }) => {
  const { role, content, structuredContent } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${isUser ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
          {/* Render structured content if it exists, otherwise render plain text content */}
          {structuredContent ? (
            <StructuredResponseDisplay data={structuredContent} />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
        <div className={`mt-1 text-xs text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Hello! I am your AI assistant. How can I help you today?', role: 'assistant', timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // --- Prepare history for the API call ---
    const historyForApi = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content // Send only the plain text content
    }));

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyForApi }), // Send the entire history
      });

      if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }
      const data = await response.json();
      
      let assistantMessage: Message;

      // Check if the response is a simple conversational text or a structured object
      if (data.response.response_text) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response.response_text,
          role: 'assistant',
          timestamp: new Date(),
        };
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: "Here is a structured breakdown of the information I found.", // Fallback text
          structuredContent: data.response, // The content is the JSON object
          role: 'assistant',
          timestamp: new Date(),
        };
      }
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("API call failed:", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), content: 'Sorry, an error occurred.', role: 'assistant', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // (handleKeyPress and other UI functions remain the same)
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Bot className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-xl font-semibold text-slate-800">RAG Chatbot</h1><p className="text-sm text-slate-500">Now with Conversational Memory</p></div>
        </div>
      </div>
      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          {isLoading && ( <div className="flex gap-4"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-white" /></div><div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm"><div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /><span className="text-sm text-slate-500">Thinking...</span></div></div></div>)}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything..." disabled={isLoading} className="w-full px-4 py-3 pr-12 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none text-slate-800 placeholder-slate-400 shadow-sm" />
            <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:hover:shadow-sm"><Send className="w-5 h-5 text-white" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
