// src/components/VideoProcessingScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VideoProcessingScreen({ videoId }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("⏳ Processing video...");

  useEffect(() => {
    const indexVideo = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/index/`, {
          video_id: videoId,
        });
        setMessage("✅ Video indexed! Redirecting...");
        setTimeout(() => {
          navigate(`/ask/${videoId}`); // 🔁 You’ll create this route later
        }, 1000);
      } catch (err) {
  const errorMessage = err.response?.data?.error || "";

  if (errorMessage.includes("already been indexed")) {
    setMessage("⚠️ Already indexed. Redirecting...");
    setTimeout(() => {
      navigate(`/ask/${videoId}`);
    }, 1000);
  } else if (errorMessage.includes("Transcript not available in English")) {
    setMessage("❌ Transcript not available in English or is disabled for this video.");
    setTimeout(() => {
      navigate(`/`);
    }, 3000);
  } else {
    setMessage("❌ Failed to index video. Please try again.");
    setTimeout(() => {
      navigate(`/`);
    }, 1000);
  }
}

    };

    indexVideo();
  }, [videoId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-6">
      <div className="animate-pulse text-2xl font-semibold text-gray-700 mb-4">
        {message}
      </div>
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
    </div>
  );
}
