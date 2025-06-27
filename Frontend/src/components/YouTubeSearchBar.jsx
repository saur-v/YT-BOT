import { useState, useRef } from "react";
import axios from "axios";
import LoaderSpinner from "./LoaderSpinner";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import heroAnimation from "../assets/youtube-hero.json";
import { FiSearch } from "react-icons/fi";


const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export default function YouTubeSearchPage({ onVideoSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setResults([]);
    setLoading(true);
    try {
      const res = await axios.get(YOUTUBE_SEARCH_URL, {
        params: {
          part: "snippet",
          q: query,
          maxResults: 12, // 🔼 more results
          key: YOUTUBE_API_KEY,
          type: "video",
        },
      });
      setResults(res.data.items);
    } catch (err) {
      console.error("YouTube search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (videoId) => {
    onVideoSelect(videoId);
    navigate(`/process/${videoId}`);

  };

  const handleMouseEnter = (videoId) => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredVideo(videoId);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6">
      {/* Hero Section */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto py-10 gap-10">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            🎯 YouTube Q&A Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Ask intelligent questions on any YouTube video — powered by AI. Get transcript-based answers instantly.
          </p>

          {/* Styled Search Bar */}
          <div className="flex items-center w-full max-w-xl mx-auto sm:mx-0 bg-white rounded-full border border-gray-300 shadow-md px-4 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className="flex-grow px-4 py-2 text-gray-700 bg-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              className="text-red-600 hover:text-red-700 transition p-2 rounded-full cursor-pointer"
              title="Search"
            >
              <FiSearch className="w-6 h-6" />
            </button>

          </div>
        </div>

        {/* Lottie Animation */}
        <div className="lg:w-1/2 flex justify-center">
          <Lottie animationData={heroAnimation} loop={true} className="w-full max-w-md" />
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center mt-8">
          <LoaderSpinner />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-12 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📺 Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((video) => (
              <div
                key={video.id.videoId}
                onClick={() => handleSelect(video.id.videoId)}
                onMouseEnter={() => handleMouseEnter(video.id.videoId)}
                onMouseLeave={handleMouseLeave}
                className={`relative bg-white rounded-xl shadow hover:shadow-2xl transition transform duration-300 flex flex-col items-center overflow-hidden cursor-pointer ${
                  hoveredVideo === video.id.videoId ? "scale-105 z-10" : ""
                }`}
              >
                {hoveredVideo === video.id.videoId ? (
                  <iframe
                    width="100%"
                    height="215"
                    src={`https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&mute=1&controls=0`}
                    title="YouTube video preview"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="rounded-t-xl"
                  />
                ) : (
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt="thumbnail"
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}
                <div className="p-4 w-full">
                  <h3 className="text-md font-semibold mb-1">{video.snippet.title}</h3>
                  <p className="text-sm text-gray-500">{video.snippet.channelTitle}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {video.id.videoId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
