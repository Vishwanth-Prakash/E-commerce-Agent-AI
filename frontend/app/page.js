"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([
    {
      role: "bot",
      text: "👋 I am Ecommerce Bot, How can I help you?",
    },
  ]);
  const [debugLog, setDebugLog] = useState([]);
  const [debug, setDebug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  const chatEndRef = useRef(null);
  const debugEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    debugEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [debugLog]);

  const toggleExpand = (idx) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    setChat((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ask", { question });
      const { answer, sql_query, visualize, graphData, graphType } = res.data;

      const timestamp = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      setChat((prev) => [
        ...prev,
        {
          role: "bot",
          text: `🧠 Generated SQL:\n${sql_query || "Not available"}`,
          timestamp,
        },
      ]);

      if (debug) {
        setDebugLog((prev) => [
          ...prev,
          {
            question,
            response: JSON.stringify(res.data, null, 2),
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      setBotTyping(true);
      let currentText = "";
      const typingSpeed = 15;

      for (let i = 0; i <= answer.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
        currentText = answer.substring(0, i);

        setChat((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === "bot_typing") {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: currentText,
            };
          } else {
            updated.push({
              role: "bot_typing",
              text: currentText,
              visualize,
              graphData,
              graphType,
              timestamp,
            });
          }
          return updated;
        });
      }

      setChat((prev) => {
        const updated = [...prev];
        const last = updated.pop();
        updated.push({ ...last, role: "bot" });
        return updated;
      });
    } catch (err) {
      const errorMsg = "❌ Failed to fetch response.";
      setChat((prev) => [
        ...prev,
        { role: "bot", text: errorMsg, timestamp: new Date().toISOString() },
      ]);

      if (debug) {
        setDebugLog((prev) => [
          ...prev,
          {
            question,
            response: errorMsg,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setBotTyping(false);
      setLoading(false);
    }
  };

  const renderGraph = (graphType, graphData) => {
    const data = {
      labels: graphData.x,
      datasets: [
        {
          label: graphData.yLabel,
          data: graphData.y,
          backgroundColor: "#0070f3",
          borderColor: "#0070f3",
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#fff" } },
        title: { display: true, text: graphData.title, color: "#fff" },
      },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } },
      },
    };

    return graphType === "line" ? (
      <Line data={data} options={options} />
    ) : (
      <Bar data={data} options={options} />
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      <div className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          🛒 Ecommerce Chatbot
        </h1>
        <p className="text-center text-sm text-gray-400 mb-4">
          By <strong>Vishwanth P</strong> | 21MIS1117 |{" "}
          <em>Vellore Institute of Technology</em>
        </p>

        <label className="text-sm mb-2 block text-gray-400">
          <input
            type="checkbox"
            className="mr-2"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
          />
          Enable Debug Mode (Logs SQL, Response, and Timestamps)
        </label>

        <div className="bg-gray-900 rounded-lg p-4 h-[500px] overflow-y-auto mb-4">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 my-2 rounded-xl w-fit ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <div className="text-xs text-gray-300 mb-1">
                {msg.role === "user" ? "👤 You" : "🤖 Bot"}
              </div>
              <pre className="whitespace-pre-wrap text-sm">
                {expandedLogs[`chat-${idx}`]
                  ? msg.text
                  : msg.text.split("\n").slice(0, 5).join("\n")}
              </pre>
              {msg.text.split("\n").length > 5 && (
                <span
                  className="text-xs text-cyan-400 cursor-pointer block mt-1"
                  onClick={() =>
                    setExpandedLogs((prev) => ({
                      ...prev,
                      [`chat-${idx}`]: !prev[`chat-${idx}`],
                    }))
                  }
                >
                  {expandedLogs[`chat-${idx}`] ? "See Less ▲" : "See More ▼"}
                </span>
              )}
              {msg.timestamp && (
                <div className="text-[10px] text-gray-400 mt-1">
                  ⏱ {msg.timestamp}
                </div>
              )}
              {msg.visualize && msg.graphData && msg.graphType && (
                <div className="mt-2">
                  {renderGraph(msg.graphType, msg.graphData)}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <motion.div
              className="text-gray-400 italic mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              🤖 Thinking...
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
            placeholder="Ask a question..."
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <button
            onClick={askQuestion}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md font-semibold"
          >
            Send
          </button>
        </div>
      </div>

      {debug && (
        <div className="w-full md:w-[35%] p-4 bg-black overflow-y-auto border-l border-gray-800">
          <h2 className="text-cyan-400 mb-3 text-lg font-semibold">
            🛠 Debug Console
          </h2>
          {debugLog.length === 0 ? (
            <p className="text-gray-400">No debug logs yet.</p>
          ) : (
            debugLog.map((entry, idx) => {
              const isExpanded = expandedLogs[idx];
              const lines = entry.response.split("\n");
              const displayLines = isExpanded ? lines : lines.slice(0, 5);
              const timestamp = new Date(entry.timestamp).toLocaleString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }
              );

              return (
                <div key={idx} className="mb-4">
                  <p className="text-yellow-300 text-sm mb-1">
                    <strong>Q:</strong> {entry.question}
                  </p>
                  <pre className="bg-gray-900 text-green-300 p-2 rounded-md text-xs whitespace-pre-wrap">
                    {displayLines.join("\n")}
                  </pre>
                  {lines.length > 5 && (
                    <span
                      className="text-cyan-400 text-xs cursor-pointer block mt-1"
                      onClick={() => toggleExpand(idx)}
                    >
                      {isExpanded ? "See Less ▲" : "See More ▼"}
                    </span>
                  )}
                  <p className="text-[10px] text-gray-500 mt-1">
                    ⏱ {timestamp}
                  </p>
                  <hr className="my-2 border-gray-800" />
                </div>
              );
            })
          )}
          <div ref={debugEndRef} />
        </div>
      )}
    </div>
  );
}
