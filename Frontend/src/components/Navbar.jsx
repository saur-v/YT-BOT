import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaYoutube } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const [inputId, setInputId] = useState("");

  const handleGoToProcess = () => {
    if (inputId.trim()) {
      navigate(`/process/${inputId.trim()}`);
      setInputId("");
    }
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200">
      {/* Left Side Logo/Brand */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate("/")}
      >
        <FaYoutube className="text-red-600 text-2xl" />
        <span className="text-xl font-bold text-gray-800">RAG Assistant</span>
      </div>

      {/* Right Side Input + Button */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Paste YouTube Video ID"
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition w-[220px]"
        />
        <button
          onClick={handleGoToProcess}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          Index
        </button>
      </div>
    </nav>
  );
}
