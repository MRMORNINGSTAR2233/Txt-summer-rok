import { useState } from 'react';
import axios from 'axios';

const SummarizePage = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', text);
    if (file) {
      formData.append('file', file);
    }
    formData.append('link', link);

    try {
      const response = await axios.post('/api/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-gray-800">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          AI-Powered Content Summarizer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to summarize"
            rows={6}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded-lg bg-blue-50 text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:text-blue-600 file:bg-blue-100 hover:file:bg-blue-200"
            />
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter link to summarize"
              className="w-full ml-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Summarize
          </button>
        </form>
        {summary && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-md text-gray-800">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Summary:</h2>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarizePage;
