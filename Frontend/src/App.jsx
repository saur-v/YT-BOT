// src/App.jsx
import { useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import YouTubeSearchBar from "./components/YouTubeSearchBar";
import QueryBox from "./components/QueryBox";
import VideoProcessingScreen from "./components/VideoProcessingScreen";
import Navbar from "./components/Navbar";

function App() {
  const [selectedVideoId, setSelectedVideoId] = useState("");

  return (

    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar /> {/* Always visible on top */}
      <Routes>
        {/* 🔍 Home Search */}
        <Route
          path="/"
          element={
            <div className="p-6">
              <YouTubeSearchBar onVideoSelect={setSelectedVideoId} />
            </div>
          }
        />

        {/* ⏳ Processing screen */}
        <Route
          path="/process/:videoId"
          element={<VideoProcessingWrapper />}
        />

        {/* ❓ Q&A Assistant */}
        <Route
          path="/ask/:videoId"
          element={
            <div className="p-6 max-w-6xl mx-auto">
              {/* <h1 className="text-3xl font-bold text-center mb-6">
                🎯 YouTube RAG Assistant
              </h1> */}
              <div className="flex flex-col gap-6">
                <QueryBoxWrapper />
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// Wrapper to extract videoId from URL for processing
const VideoProcessingWrapper = () => {
  const { videoId } = useParams();
  return <VideoProcessingScreen videoId={videoId} />;
};

// Wrapper for Q&A page
const QueryBoxWrapper = () => {
  const { videoId } = useParams();
  return <QueryBox initialVideoId={videoId} />;
};

export default App;
