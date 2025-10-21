import { useState, useEffect, useRef } from 'react';
import models from '../models.json';
import { Play } from 'lucide-react';

export default function AIChatModel() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const messagesEndRef = useRef(null);

  const greenCheckbox = "🚀";
  const redXCheckbox = "🔴";
  const robot = "🤖";

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);

    return () => clearInterval(checkReady);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  const addMessage = (content, isUser) => {
    setMessages((prev) => [...prev, { content, isUser, id: Date.now() }]);
  };

  const sendMessage = async () => {
    const message = inputValue.trim();

    if (!message || !aiReady) {
      return;
    }

    addMessage(message, true);
    setInputValue("");
    setIsLoading(true);

    try {
      const conversation = [
        {
          role: "system",
          content: "Assistant provides helpful insight"
        },
        ...messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ];

      const response = await window.puter.ai.chat(
        conversation,
        {
          model: selectedModel
        }
      );

      const reply = typeof response === "string" ? response : response.message?.content || robot.concat(" There is no response from the assistan.");
      addMessage(reply, false);
    } catch (error) {
        console.log("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    const model = models.find((m) => m.id === newModel);
    addMessage(`🗘 Switched to ${model.name} ${model.provider}`, false);
  };

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#21221ecd] via-[#245e7f] to-[#54bfcf] flex flex-col items-center justify-center p-4 gap-8">
      <h1 className="text-6xl sm:text-6xl
        bg-gradient-to-r from-[#f80000] via-[#e2f1f1] to-[#4add74]
        bg-clip-text text-transparent text-center text-shadow-lg/15">
        AI Chat With Models
      </h1>

      <div className="flex flex-col sm:flex-row  gap-6">
        <div className={`px-4 py-2 rounded-lg text-sm
        ${aiReady ? "bg-gradient-to-r from-[#0c9692] to-[#0c4fae] border-none text-white font-semibold border item items-center gap-3 text"
            : "bg-[#17336b] text-[#ffffff] border border-[#17336b] font-semibold"}`}>
          {aiReady ? greenCheckbox.concat(" AI is Ready") : redXCheckbox.concat(" Waiting... AI not ready")}
        </div>
        <div className="flex items-center gap-2" hidden={!aiReady}>
          <span className="text-gray-200 text-sm font-semibold">
            Select Chat Model:
          </span>
          <select value={selectedModel} onChange={handleModelChange} disabled={!aiReady}
            className="bg-gradient-to-r from-[#c54675] to-[#6c476d] border-none
          rounded-lg px-3 py-2 text-white text-sm focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-semibold">
            {models.map((model) => (
              <option key={model.id} value={model.id} className="bg-[#844560ee] open:border-0">
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-[#17437095]
      backdrop:blur-md border border-none rounded-3xl p-6">
        <div className="flex items-center justify-center
        mb-4 p-2 bg-gradient-to-r from-[#e88141] to-[#c12020]
        rounded-xl border-none">
          <span className="text-[#ffffff] text-sm font-semibold">
            {robot.concat(" Using chat model: ")} {currentModel.name} ({currentModel.provider})
          </span>
        </div>
        <div className="h-96 overflow-y-auto border-b
        border-none mb-6 p-4 bg-gradient-to-b from-[#333333] via-[#094886] to-[#111100] rounded-2xl">
          {messages.length === 0 && (
            <div className="text-center text-[#efe4e4] mt-20 text-xl">
              📢 Let's start a conversation. Type a message.
              <br />
              <span className="text-xs text-gray-400 mt-2 block">
                You can try other listed models to check their behavior.
              </span>
            </div>
          )}

          {
            messages.map((msg) => (
              <div key={msg.id} className={`
                p-3 m-2 rounded-2xl w-fit max-w-[80%] text-wrap
                ${
                  msg.isUser ? "bg-gradient-to-r from-orange-600 to-red-400 text-white ml-auto text-right"
                  : "bg-gradient-to-r from-amber-700 to-orange-600 text-white"
                }`
              }>
                <div className="whitespace-pre-wrap">
                  {msg.content}
                </div>  
              </div>
            ))
          }

          {
            isLoading && (
              <div className="p-3 m-2 rounded-2xl max-w-xs bg-gradient-to-r from-red-600 to-amber-600 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                    {currentModel.name} is working ...
                </div>
              </div>
            )}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={inputValue} onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={ 
              aiReady ? `You can ask model "${currentModel.name}" whatever you want...`
                : "Waiting for AI model to be ready..."
             }
            disabled={!aiReady || isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6d1212] to-[#965c78] border-none rounded-2xl
            text-white placeholder-[#b8abab] focus:outline-none focus:ring-2
            focus:shadow-xl focus:shadow-amber-700/80
            focus:ring-orange-500 transition duration-400 disabled:opacity-50
            disabled:cursor-not-allowed" />
          <button onClick={sendMessage}
            disabled={!aiReady || isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-red-900/80 to-red-500 hover:opacity-80
            text-white font-semibold rounded-2xl gap-1
            transition-all duration-300 disabled:opacity-50
            flex items-center justify-end
            disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" hidden={ isLoading } />
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Sending
              </div>
            ) 
              :
              (
                  "Send"
              )
            }
          </button>
            </div>
      </div>     
    </div>
  );
}
