import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const navigate = useNavigate();
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const user = useSelector((store) => store.user);
  const firstName = user?.firstName;
  const userId = user?._id;

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return false;
    const threshold = 150;
    return container.scrollHeight - container.clientHeight - container.scrollTop <= threshold;
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchChatMessages = async (pageNumber) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `${BASE_URL}chat/${targetUserId}?page=${pageNumber}&limit=10`,
        { withCredentials: true }
      );

      const chatMessages =
        res?.data?.messages.map((msg) => {
          const { senderId, text } = msg;
          return {
            firstName: senderId?.firstName,
            lastName: senderId?.lastName,
            text,
            createdAt: msg.createdAt,
          };
        }) || [];

      if (res?.data?.participants) {
        const chatPartner = res.data.participants.find((p) => p._id !== userId);
        if (chatPartner) {
          setPartner(chatPartner);
        }
      }

      const container = chatContainerRef.current;
      const previousScrollHeight = container ? container.scrollHeight : 0;
      const previousScrollTop = container ? container.scrollTop : 0;

      if (pageNumber === 1) {
        setMessages(chatMessages);
        setTimeout(() => scrollToBottom(), 30);
      } else {
        setMessages((prev) => [...chatMessages, ...prev]);
        setTimeout(() => {
          if (chatContainerRef.current) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop =
              newScrollHeight - previousScrollHeight + previousScrollTop;
          }
        }, 30);
      }

      setHasMore(res.data.hasMore);
      setPage(pageNumber);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMessages([]);
    setPartner(null);
    fetchChatMessages(1);
  }, [targetUserId]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || isFetching || !hasMore) return;
    if (container.scrollTop <= 50) {
      fetchChatMessages(page + 1);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;
    socket.emit("joinChat", { firstName, userId, targetUserId });

    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      const shouldScroll = isAtBottom();
      setMessages((prev) => [
        ...prev,
        { text, firstName, lastName, createdAt: new Date() },
      ]);
      if (shouldScroll) {
        setTimeout(() => scrollToBottom(), 30);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error event:", err.message);
    });

    return () => {
      if (socket) {
        socket.off("messageReceived");
        socket.off("error");
      }
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  const sendMessage = (textToSend = newMessage) => {
    const msgText = typeof textToSend === "string" ? textToSend : newMessage;
    if (socketRef.current && msgText.trim()) {
      socketRef.current.emit("sendMessage", {
        targetUserId,
        text: msgText,
      });
      setNewMessage("");
      setTimeout(() => scrollToBottom(), 30);
    }
  };

  const partnerName = partner
    ? `${partner.firstName} ${partner.lastName || ""}`
    : "Developer Match";

  return (
    <div className="max-w-4xl mx-auto px-4 my-6">
      <div className="glass-card border border-white/10 h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-base-950/80">
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              <div className="w-11 h-11 rounded-2xl ring-2 ring-primary/40 overflow-hidden bg-base-900">
                {partner?.photoURL ? (
                  <img
                    src={partner.photoURL}
                    alt={partnerName}
                    className="object-cover w-full h-full select-none"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-black text-base">
                    {partnerName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="text-left">
              <h1 className="font-black text-white text-lg leading-tight">
                {partnerName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">
                  Pair Session Connected
                </span>
              </div>
            </div>
          </div>
          {isFetching && (
            <span className="loading loading-spinner loading-sm text-primary"></span>
          )}
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-base-950/40"
        >
          {hasMore && messages.length >= 10 && (
            <div className="text-center py-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/40 bg-base-900/60 py-1 px-3 rounded-full border border-white/5">
                Scroll up to load older messages
              </span>
            </div>
          )}

          {messages.length === 0 && !isFetching && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-white">Matched with {partnerName}!</p>
                <p className="text-xs text-base-content/50 max-w-xs leading-relaxed">
                  Start the conversation! Share what tech project you're working on.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-sm">
                <button
                  onClick={() => sendMessage("Hey! Want to pair program on a project? 🚀")}
                  className="badge badge-sm bg-base-800 hover:bg-primary hover:text-white border-white/10 text-base-content/70 font-semibold py-2 px-3 transition-colors cursor-pointer"
                >
                  Pair Program 🚀
                </button>
                <button
                  onClick={() => sendMessage("What tech stack are you currently building with? 💻")}
                  className="badge badge-sm bg-base-800 hover:bg-primary hover:text-white border-white/10 text-base-content/70 font-semibold py-2 px-3 transition-colors cursor-pointer"
                >
                  Ask Tech Stack 💻
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isSelf = firstName === msg.firstName;
            return (
              <div
                key={index}
                className={`chat ${isSelf ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-header text-[10px] text-base-content/40 mb-1 flex items-center gap-1.5 px-1 font-bold">
                  <span>{`${msg.firstName} ${msg.lastName || ""}`}</span>
                  <span>•</span>
                  <span>
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
                <div
                  className={`chat-bubble text-xs sm:text-sm max-w-md break-words py-3 px-4 shadow-xl font-medium ${
                    isSelf
                      ? "bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-none"
                      : "bg-base-900 text-white rounded-2xl rounded-tl-none border border-white/10"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-base-950/90">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message or code snippet..."
            className="flex-1 input input-bordered bg-base-900 text-white border-white/10 focus:outline-none focus:border-primary text-xs rounded-2xl h-12 placeholder-base-content/30"
          />
          <button
            onClick={() => sendMessage()}
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white px-6 rounded-2xl h-12 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-wider shrink-0"
          >
            <span>Send</span>
            <svg className="w-4 h-4 fill-current rotate-45 text-white" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
