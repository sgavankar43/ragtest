import React, { useState } from 'react';
import axios from 'axios';

const Summary = ({ messages, theme }) => {
  const { darkMode, setDarkMode, neumorph, bgColor, cardColor, textColor, borderColor } = theme;
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/summarize`, {
        history: messages,
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error summarizing chat:', error);
      setSummary('Failed to generate summary.');
    }
    setIsLoading(false);
  };

  return (
    <div className={`w-80 h-full ${cardColor} p-4 border-l ${borderColor} flex flex-col m-2 rounded-lg shadow-lg`}>
      <h2 className="text-lg font-semibold mb-4">Conversation Summary</h2>
      <button
        onClick={handleSummarize}
        disabled={isLoading || messages.length <= 1}
        className={`w-full p-2 rounded-lg ${cardColor} hover:${neumorph} disabled:opacity-50 disabled:cursor-not-allowed mb-4`}
      >
        {isLoading ? 'Summarizing...' : 'Summarize Conversation'}
      </button>
      <div className={`flex-1 overflow-y-auto border rounded-md p-2 ${bgColor} ${borderColor}`}>
        {summary ? (
          <p className="text-sm whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-gray-500">Click the button to generate a summary of the current conversation.</p>
        )}
      </div>
    </div>
  );
};

export default Summary;
