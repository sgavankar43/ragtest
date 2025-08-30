import React, { useState } from 'react';
import axios from 'axios';

const Summary = ({ messages }) => {
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
    <div className="w-80 h-full bg-gray-50 dark:bg-gray-800 p-4 border-l border-gray-200 dark:border-gray-700 flex flex-col m-2 rounded-lg shadow-lg text-gray-900 dark:text-gray-100">
      <h2 className="text-lg font-semibold mb-4">Conversation Summary</h2>
      <button
        onClick={handleSummarize}
        disabled={isLoading || messages.length <= 1}
        className="bg-blue-500 text-white rounded-md px-4 py-2 mb-4 hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Summarizing...' : 'Summarize Conversation'}
      </button>
      <div className="flex-1 overflow-y-auto border rounded-md p-2 bg-white dark:bg-gray-700">
        {summary ? (
          <p className="text-sm whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Click the button to generate a summary of the current conversation.</p>
        )}
      </div>
    </div>
  );
};

export default Summary;
