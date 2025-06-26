// src/components/QueryBox.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderSpinner from "./LoaderSpinner";
import { FiSend } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";


export default function QueryBox({ initialVideoId = "" }) {
  const [videoId, setVideoId] = useState(initialVideoId);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVideoId(initialVideoId);
  }, [initialVideoId]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setAnswer("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ask/`, {
        question,
        video_id: videoId,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      const backendError = err.response?.data?.error || "❌ Failed to get answer.";
      setError(backendError);
    }
      finally {
            setLoading(false);
          }
  };

  return (
    <div className="w-[90%] max-w-screen-xl mx-auto mt-0 bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 mb-4">
        <div className="flex items-center text-xl font-bold text-gray-800">
          <FaYoutube className="text-red-600 text-2xl mr-2" />
          YouTube Transcript
        </div>
        {/* Right side empty or for future icons */}
        <div></div>
      </div>

      {/* Video Player */}
      <div className="px-6"> {/* horizontal padding only */}
        <div className="w-full h-[300px] rounded-xl overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ backgroundColor: 'transparent' }} // ensures no black background
          ></iframe>
        </div>
      </div>


      {/* Question Input */}
      <div className="p-6">
        <label className="block font-semibold mb-0 text-gray-700">Enter your question</label>
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            className="flex-grow outline-none text-gray-800 px-2"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>

      {/* Answer Display */}
      <div className="p-6">
        <label className="block font-semibold mb-2 text-gray-700">Answer display</label>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[80px] shadow-sm text-gray-700">
          {loading ? (
            <LoaderSpinner />
          ) : answer ? (
            answer
          ) : error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <span className="text-gray-400">Your answer will appear here...</span>
          )}
        </div>
      </div>
    </div>
  );
}
