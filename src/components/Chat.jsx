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
    
    const socketRef = useRef(null); // Reference to the persistent socket connection
    const chatContainerRef = useRef(null); // Reference to the chat scrollable area

    // Check if scroll is near bottom
    const isAtBottom = () => {
        const container = chatContainerRef.current;
        if (!container) return false;
        const threshold = 150; // px threshold from bottom
        return container.scrollHeight - container.clientHeight - container.scrollTop <= threshold;
    };

    // Scroll to the bottom instantly
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Fetch paginated messages
    const fetchChatMessages = async (pageNumber) => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const res = await axios.get(
                `${BASE_URL}chat/${targetUserId}?page=${pageNumber}&limit=10`, 
                { withCredentials: true }
            );

            const chatMessages = res?.data?.messages.map((msg) => {
                const { senderId, text } = msg;
                return {
                    firstName: senderId?.firstName, 
                    lastName: senderId?.lastName,
                    text,
                    createdAt: msg.createdAt
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
                // Snap to bottom on first page load
                setTimeout(() => {
                    scrollToBottom();
                }, 30);
            } else {
                setMessages((prev) => [...chatMessages, ...prev]);
                // Lock scroll position so it doesn't jump
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

    // Initial load when targetUserId changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setMessages([]);
        setPartner(null);
        fetchChatMessages(1);
    }, [targetUserId]);

    // Handle scroll event for infinite pagination
    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container || isFetching || !hasMore) return;

        // Trigger loading when user scrolls within 50px of the top
        if (container.scrollTop <= 50) {
            fetchChatMessages(page + 1);
        }
    };

    // Setup Socket connection and listeners
    useEffect(() => {
        if (!userId) return;
        
        // Establish or retrieve the global socket connection
        const socket = createSocketConnection();
        socketRef.current = socket;

        // Join the chat room
        socket.emit("joinChat", { firstName, userId, targetUserId });

        // Listen for new incoming messages
        socket.on("messageReceived", ({ firstName, lastName, text }) => {
            const shouldScroll = isAtBottom();
            
            setMessages((prev) => [...prev, { text, firstName, lastName, createdAt: new Date() }]);

            // Only auto-scroll down if the user is already near the bottom
            if (shouldScroll) {
                setTimeout(() => {
                    scrollToBottom();
                }, 30);
            }
        });

        // Listen for error messages
        socket.on("error", (err) => {
            console.error("Socket error event:", err.message);
        });

        // Clean up listeners on unmount
        return () => {
            if (socket) {
                socket.off("messageReceived");
                socket.off("error");
            }
            socketRef.current = null;
        };
    }, [userId, targetUserId]);

    // Send message handler
    const sendMessage = () => {
        if (socketRef.current && newMessage.trim()) {
            socketRef.current.emit("sendMessage", {
                targetUserId,
                text: newMessage,
            });
            setNewMessage("");
            
            // Always scroll to bottom for sender's own new message
            setTimeout(() => {
                scrollToBottom();
            }, 30);
        }
    };

  const partnerName = partner
    ? `${partner.firstName} ${partner.lastName || ""}`
    : "Developer Partner";

  return (
    <div className="max-w-4xl mx-auto px-4 my-6">
      <div className="border border-base-300 h-[78vh] flex flex-col rounded-3xl bg-base-200/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 flex justify-between items-center bg-base-200/90">
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              <div className="w-10 h-10 rounded-full ring-2 ring-primary/20 overflow-hidden bg-primary/10 text-primary flex items-center justify-center">
                {partner?.photoURL ? (
                  <img
                    src={partner.photoURL}
                    alt={partnerName}
                    className="object-cover w-full h-full select-none"
                  />
                ) : (
                  <span className="text-sm font-black uppercase">
                    {partnerName.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-white text-base leading-tight">
                {partnerName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-base-content/50 uppercase tracking-widest font-bold">
                  Active Session
                </span>
              </div>
            </div>
          </div>
          {isFetching && (
            <span className="loading loading-spinner loading-sm text-secondary"></span>
          )}
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-base-100/30"
        >
          {hasMore && messages.length >= 10 && (
            <div className="text-center py-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/40 bg-base-300/40 py-1 px-3 rounded-full">
                Scroll up to load history
              </span>
            </div>
          )}

          {messages.length === 0 && !isFetching && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-base-300/50 flex items-center justify-center text-base-content/30">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm text-base-content/50 max-w-xs leading-relaxed">
                No messages yet. Send a friendly ping to start the conversation!
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isSelf = firstName === msg.firstName;
            return (
              <div
                key={index}
                className={`chat ${isSelf ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-header text-[10px] text-base-content/40 mb-1 flex items-center gap-1.5 px-1 font-semibold">
                  <span>{`${msg.firstName} ${msg.lastName || ""}`}</span>
                  <span>•</span>
                  <span className="opacity-80">
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
                <div
                  className={`chat-bubble text-sm max-w-md break-words py-2.5 px-4 shadow-md ${
                    isSelf
                      ? "bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-none"
                      : "bg-base-300 text-base-content rounded-2xl rounded-tl-none border border-base-300/50"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-base-300 flex items-center gap-3 bg-base-200/90 rounded-b-3xl">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 input input-bordered bg-base-300 text-white border-base-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-2xl text-sm h-12 placeholder-base-content/30"
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white px-5 rounded-2xl h-12 flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-primary/10 transition-all font-bold text-sm shrink-0"
          >
            <span>Send</span>
            <svg
              className="w-4 h-4 fill-current rotate-45 text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;