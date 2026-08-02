import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, resolveMediaUrl } from "../utils/constants";
import MediaImage from "./MediaImage";
import ChatBackground from "./ChatBackground";

const TickIcon = ({ status }) => {
  if (status === "sent") {
    return (
      <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 16 11" fill="none">
        <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 5.5L10 9L16 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 11" fill="none">
      <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 5.5L10 9L16 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const WAVE_HEIGHTS = [8, 14, 22, 12, 18, 26, 10, 16, 24, 14, 9, 20, 15, 11, 23, 13, 17, 26, 12, 8, 19, 15, 24, 10, 14, 21, 16, 9, 18, 13];

const VoiceMessage = ({ url, isSelf }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const resetOnEnd = () => {
    setPlaying(false);
    setCurrentTime(0);
  };

  const barColor = isSelf ? "bg-white/80" : "bg-primary";

  return (
    <div className="flex items-center gap-3 py-1">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={resetOnEnd}
      />
      <button
        onClick={togglePlay}
        className="w-9 h-9 shrink-0 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex items-end gap-[3px] h-7 flex-1 min-w-[80px]">
        {WAVE_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full ${barColor} ${playing ? "waveform-bar" : ""}`}
            style={{
              height: `${h}px`,
              opacity: i / WAVE_HEIGHTS.length > 0.7 ? 0.55 : 1,
              animationDelay: `${(i % 5) * 0.12}s`,
              transform: playing ? undefined : "scaleY(0.35)",
            }}
          />
        ))}
      </div>
      <span className={`text-[10px] font-bold shrink-0 ${isSelf ? "text-white/70" : "text-primary"}`}>
        {formatTime(playing ? currentTime : duration)}
      </span>
    </div>
  );
};

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const EMOJI_LIST = [
  "😀","😃","😄","😁","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲",
  "😛","😜","🤪","😝","🤑","🤗","🤭","🫣","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄",
  "😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥴","😵","🤯","🥳","🥺","😢",
  "😭","😤","😠","😡","🤬","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","🎃","😺","😸",
  "😹","😻","😼","😽","🙀","😿","😾","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞",
  "💗","💖","💘","💝","💟","❣️","💌","💋","👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌",
  "🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊",
  "🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃",
  "🧠","🦷","🦴","👀","👁️","👅","👄","👶","🧒","👦","👧","🧑","👱","👨","👩","🧔","👩‍🦰","👨‍🦰",
  "👩‍🦱","👨‍🦱","👩‍🦳","👨‍🦳","👩‍🦲","👨‍🦲","🧑‍🎓","👨‍🎓","👩‍🎓","🧑‍🏫","👨‍🏫","👩‍🏫","🧑‍💻","👨‍💻","👩‍💻","🧑‍💼","👨‍💼","👩‍💼",
  "🧑‍🔧","👨‍🔧","👩‍🔧","🧑‍🔬","👨‍🔬","👩‍🔬","🧑‍🎤","👨‍🎤","👩‍🎤","🧑‍🎨","👨‍🎨","👩‍🎨","🧑‍🚀","👨‍🚀","👩‍🚀","👮","🕵️","💂",
  "🥷","👷","🫅","🤴","👸","👳","👲","🧕","🤵","👰","🤰","🫃","🫄","🤱","👼","🎅","🤶","🦸",
  "🦹","🧙","🧚","🧛","🧜","🧝","🧞","🧟","🧌","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🕴️",
  "👯","🧖","🛀","🛌","👭","👫","👬","💏","💑","👪","👨‍👩‍👧‍👦","👨‍👩‍👧","👨‍👩‍👦","👩‍👩‍👧‍👦","👨‍👨‍👧‍👦",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧",
  "🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰",
  "🪲","🪳","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠",
  "🐟","🐬","🐳","🐋","🦈","🪸","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒",
  "🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛",
  "🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀",
  "🐿️","🦔","🐾","🐉","🐲","🌵","🎄","🌲","🌳","🌴","🪵","🌱","🌿","☘️","🍀","🎍","🪴","🎋",
  "🍃","🍂","🍁","🪺","🪹","🍄","🐚","🪨","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞",
  "🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫",
  "⭐","🌟","✨","⚡","☄️","💥","🔥","🌪️","🌈","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️",
  "🌨️","❄️","☃️","⛄","🌬️","💨","💧","💦","🫧","☔","☂️","🌊","🌫️","🍏","🍎","🍐","🍊","🍋",
  "🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒",
  "🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🫘","🥐","🍞","🥖","🥨","🧀","🥚","🍳","🧈",
  "🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔",
  "🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠",
  "🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰",
  "🥜","🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🫗","🥃","🍸",
  "🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢","🧂","⚽","🏀","🏈","⚾","🥎","🎾","🏐",
  "🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊",
  "🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","🤺","⛹️","🤾","🏌️",
  "🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎫",
  "🎟️","🎪","🤹","🎭","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🪗","🎸","🪕","🎻",
  "🎲","♟️","🎯","🎳","🎮","🕹️","🎰","🚗","🚙","🚕","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻",
  "🚚","🚛","🚜","🏍️","🛵","🛺","🚲","🛴","🛹","🛼","🚏","🛣️","🛤️","⛽","🛞","🚨","🚥","🚦",
  "🛑","🚧","⚓","🛟","⛵","🛶","🚤","🛳️","⛴️","🛥️","🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁",
  "🚟","🚠","🚡","🛰️","🚀","🛸","🏠","🏡","🏘️","🏚️","🏗️","🏢","🏭","🏣","🏤","🏥","🏦","🏨",
  "🏩","🏪","🏫","🏬","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🌁",
  "🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🗾","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏟️","🎠",
  "🎡","🎢","🎪","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","🛑","⌚","📱",
  "💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️",
  "🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","📡","🔋",
  "🪫","🔌","💡","🔦","🕯️","🪔","🧯","🗑️","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎",
  "⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🪤","🧱","⛓️","🧲","🔫","💣",
  "🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺","🔮","📿","🧿","🪬","💈","⚗️","🔭",
  "🔬","🕳️","🩻","🩹","🩺","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡️","🧹","🪠","🧺","🧻","🚽",
  "🚿","🛁","🪥","🪒","🧴","🪣","🧽","🪟","🪑","🛋️","🛏️","🛌","🧸","🪆","🖼️","🪞","🪄","🪅",
  "🪩","🕹️","🪀","🃏","🀄","🎴","🎭","🖌️","🖍️","📝","📖","📚","📕","📗","📘","📙","📔","📓",
  "📒","📃","📜","📄","📰","🗞️","📑","🔖","🏷️","💰","💴","💶","💷","💸","💳","🧾","✉️","📧",
  "📨","📩","📤","📥","📦","📫","📪","📬","📭","📮","🗳️","✏️","✒️","🖋️","🖊️","🖌️","🖍️","📎",
  "🖇️","📐","📏","✂️","🔗","⛓️","🪝","🧷","🔒","🔓","🔐","🔑","🗝️","🔨","🪓","⛏️","⚒️","🛠️",
  "🔧","🔩","⚙️","🧰","🪛","🔫","💣","🧨","🪃","🏹","🛡️","🔪","🗡️","⚔️","🔮","💎","🔗","🧿",
  "🎁","🎀","🎊","🎉","🎎","🏮","🎐","🧧","✉️","🎫","🎟️","🎭","🎨","🎬","🎤","🎧","🎼","🎹",
  "🥁","🪘","🎷","🎺","🪗","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🕹️","🎰","🚗","🚙","🚕",
  "🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🛺","🚲","🛴","🛹","🛼",
  "🚏","🛣️","🛤️","⛽","🛞","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🛶","🚤","🛳️","⛴️","🛥️",
  "🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰️","🚀","🛸","🏠","🏡","🏘️","🏚️",
  "🏗️","🏢","🏭","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏯","🏰","💒","🗼","🗽","⛪",
  "🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🌁","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🗾","🏔️","⛰️",
  "🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏟️","🎠","🎡","🎢","🎪","🚃","🚋","🚞","🚝","🚄","🚅","🚈",
];

const Chat = () => {
  const navigate = useNavigate();
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const [isOnline, setIsOnline] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [highlightMsgId, setHighlightMsgId] = useState(null);

  const [reactionMsgId, setReactionMsgId] = useState(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showJump, setShowJump] = useState(false);

  const user = useSelector((store) => store.user);
  const firstName = user?.firstName;
  const userId = user?._id;

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const readEmittedRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const cancelRecordingRef = useRef(false);
  const audioContextRef = useRef(null);

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
        res?.data?.messages
          .filter((msg) => !msg.deletedFor || !msg.deletedFor.includes(userId))
          .map((msg) => {
            const { senderId, text, _id, status, isDeleted, reactions, attachment } = msg;
            return {
              _id,
              firstName: senderId?.firstName,
              lastName: senderId?.lastName,
              text,
              status: status || "sent",
              isDeleted: isDeleted || false,
              reactions: reactions || [],
              attachment: attachment || null,
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
    setTypingUser(null);
    setIsTyping(false);
    setIsOnline(false);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    fetchChatMessages(1);
  }, [targetUserId]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    setShowJump(!isAtBottom());
    if (isFetching || !hasMore) return;
    if (container.scrollTop <= 50) {
      fetchChatMessages(page + 1);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;
    socket.emit("joinChat", { firstName, userId, targetUserId });
    socket.emit("checkUserOnline", { userId: targetUserId });

    readEmittedRef.current = false;

    socket.on("userOnlineStatus", ({ userId: statusUserId, online }) => {
      if (statusUserId === targetUserId) setIsOnline(online);
    });

    socket.on("user:online", ({ userId: onlineUserId }) => {
      if (onlineUserId === targetUserId) setIsOnline(true);
    });

    socket.on("user:offline", ({ userId: offlineUserId }) => {
      if (offlineUserId === targetUserId) setIsOnline(false);
    });

    socket.on("messageReceived", ({ _id, firstName: fName, lastName: lName, text, status, attachment }) => {
      const shouldScroll = isAtBottom();
      setMessages((prev) => [
        ...prev,
        { _id, firstName: fName, lastName: lName, text, status: status || "sent", attachment: attachment || null, reactions: [], isDeleted: false, createdAt: new Date() },
      ]);
      if (shouldScroll) {
        setTimeout(() => scrollToBottom(), 30);
      }
      if (fName !== firstName) {
        socket.emit("messageRead", { targetUserId });
      }
    });

    socket.on("messagesDelivered", ({ byUserId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.firstName !== firstName && msg.status === "sent"
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    });

    socket.on("messagesRead", ({ readByUserId, messageIds }) => {
      const idSet = new Set(messageIds.map((id) => id.toString()));
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id && idSet.has(msg._id.toString())
            ? { ...msg, status: "read" }
            : msg
        )
      );
    });

    socket.on("userTyping", ({ userId: typingUserId, firstName: typingFirstName }) => {
      if (typingUserId !== userId) {
        setTypingUser(typingFirstName);
        setIsTyping(true);
      }
    });

    socket.on("userStoppedTyping", ({ userId: stoppedUserId }) => {
      if (stoppedUserId !== userId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    socket.on("messageReacted", ({ messageId, userId: reactedUserId, emoji, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, reactions: reactions || [] }
            : msg
        )
      );
    });

    socket.on("messageDeleted", ({ messageId, deleteFor }) => {
      if (deleteFor === "me") {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeleted: true, text: "", attachment: null }
              : msg
          )
        );
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error event:", err.message);
    });

    return () => {
      if (socket) {
        socket.off("userOnlineStatus");
        socket.off("user:online");
        socket.off("user:offline");
        socket.off("messageReceived");
        socket.off("messagesDelivered");
        socket.off("messagesRead");
        socket.off("userTyping");
        socket.off("userStoppedTyping");
        socket.off("messageReacted");
        socket.off("messageDeleted");
        socket.off("error");
      }
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  useEffect(() => {
    const handleRelease = () => {
      if (isRecording) stopRecording();
    };
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchend", handleRelease);
    return () => {
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [isRecording]);

  useEffect(() => {
    if (messages.length > 0 && socketRef.current && !readEmittedRef.current) {
      const hasOtherMessages = messages.some((m) => m.firstName !== firstName);
      if (hasOtherMessages) {
        readEmittedRef.current = true;
        socketRef.current.emit("messageRead", { targetUserId });
      }
    }
  }, [messages, firstName]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { targetUserId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stopTyping", { targetUserId });
      }
    }, 2000);
  }, [targetUserId]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping();
  };

  const sendMessage = (textToSend = newMessage) => {
    const msgText = typeof textToSend === "string" ? textToSend : newMessage;
    if (socketRef.current && msgText.trim()) {
      socketRef.current.emit("sendMessage", {
        targetUserId,
        text: msgText,
      });
      setNewMessage("");
      if (socketRef.current) {
        socketRef.current.emit("stopTyping", { targetUserId });
      }
      setTimeout(() => scrollToBottom(), 30);
    }
  };

  const sendAttachment = (attachment) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        targetUserId,
        text: "",
        attachment,
      });
      setTimeout(() => scrollToBottom(), 30);
    }
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(BASE_URL + "upload", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, type, name, size } = await uploadFile(file);
      sendAttachment({ url, type, name, size });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];
      cancelRecordingRef.current = false;

      let recorder;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = 3;
        const destination = ctx.createMediaStreamDestination();
        source.connect(gainNode);
        gainNode.connect(destination);
        recorder = new MediaRecorder(destination.stream);
        audioContextRef.current = ctx;
      } else {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (audioContextRef.current) {
          try { audioContextRef.current.close(); } catch (e) { /* ignore */ }
          audioContextRef.current = null;
        }
        if (cancelRecordingRef.current || audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size === 0) return;
        const ext = (recorder.mimeType || "audio/webm").includes("ogg")
          ? "ogg"
          : "webm";
        const file = new File(
          [blob],
          `voice-${Date.now()}.${ext}`,
          { type: recorder.mimeType || "audio/webm" }
        );
        try {
          const { url, type, name, size } = await uploadFile(file, "audio");
          sendAttachment({ url, type, name, size });
        } catch (err) {
          console.error("Voice upload error:", err);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      cancelRecordingRef.current = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (socketRef.current) {
      socketRef.current.emit("messageReaction", { messageId, targetUserId, emoji });
    }
    setReactionMsgId(null);
  };

  const handleDeleteMessage = (messageId, deleteFor) => {
    if (socketRef.current) {
      socketRef.current.emit("deleteMessage", { messageId, targetUserId, deleteFor });
    }
    setShowDeleteMenu(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(
        `${BASE_URL}chat/${targetUserId}/search?q=${encodeURIComponent(searchQuery)}`,
        { withCredentials: true }
      );
      setSearchResults(
        (res.data?.messages || []).map((msg) => {
          const { senderId, text, _id } = msg;
          return { _id, firstName: senderId?.firstName, lastName: senderId?.lastName, text };
        })
      );
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const scrollToMessage = (msgId, idx) => {
    setSearchIndex(idx);
    setHighlightMsgId(msgId);
    setTimeout(() => {
      const el = document.getElementById("msg-" + msgId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setHighlightMsgId(null), 2000);
  };

  const goToNextResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (searchIndex + 1) % searchResults.length;
    scrollToMessage(searchResults[nextIdx]._id, nextIdx);
  };

  const goToPrevResult = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
    scrollToMessage(searchResults[prevIdx]._id, prevIdx);
  };

  const getUserReaction = (reactions) => {
    if (!reactions || !userId) return null;
    const found = reactions.find((r) => r.userId === userId || r.userId?._id === userId);
    return found ? found.emoji : null;
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const partnerName = partner
    ? `${partner.firstName} ${partner.lastName || ""}`
    : "Developer Match";

  const formatDayLabel = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const today = new Date();
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(today) - startOf(d)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 my-6 overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-blob w-[28rem] h-[28rem] bg-rose-500/[0.16] -top-32 -right-32" />
      <div className="aurora-blob w-80 h-80 bg-indigo-500/[0.14] top-1/3 -left-32" style={{ animationDelay: "-9s" }} />
      <div className="aurora-blob w-72 h-72 bg-fuchsia-500/[0.12] bottom-10 -right-24" style={{ animationDelay: "-15s" }} />

      <div className="relative glass-card border border-white/10 h-[82vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl fade-up">
        {/* Animated top edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 opacity-80 pointer-events-none z-20" />

        {/* Animated background: particles + drifting orbs */}
        <ChatBackground />
        <div className="chat-orb pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="chat-orb pointer-events-none absolute bottom-16 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" style={{ animationDelay: "-8s" }} />
        <div className="chat-orb pointer-events-none absolute top-1/2 left-1/3 w-56 h-56 rounded-full bg-fuchsia-500/[0.07] blur-3xl" style={{ animationDelay: "-4s" }} />

        {/* Header */}
        <div className="relative px-4 sm:px-6 py-3.5 border-b border-white/10 flex justify-between items-center bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/connections")}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              title="Back to connections"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="relative shrink-0 p-[2px] rounded-2xl avatar-ring">
              <div className="w-11 h-11 rounded-2xl ring-2 ring-base-950/60 overflow-hidden bg-base-900 relative">
                {partner?.photoURL ? (
                  <MediaImage
                    src={partner.photoURL}
                    alt={partnerName}
                    className="object-cover w-full h-full select-none"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-black text-base">
                    {partnerName.charAt(0)}
                  </div>
                )}
                <span
                  className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-base-950 ${
                    isOnline ? "bg-emerald-400" : "bg-white/25"
                  }`}
                />
              </div>
            </div>

            <div className="text-left min-w-0">
              <h1 className="font-black text-white text-base sm:text-lg leading-tight truncate">
                {partnerName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isTyping && typingUser ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-primary uppercase tracking-widest font-black mr-1">
                      {typingUser} is typing
                    </span>
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: "0s" }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: "0.15s" }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: "0.3s" }} />
                  </div>
                ) : isOnline ? (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">
                      Online
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white/25"></span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                      Offline
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); setSearchResults([]); }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                showSearch
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/25 hover:bg-white/10 hover:scale-105"
              } active:scale-95`}
              title="Search messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {isFetching && (
              <span className="loading loading-spinner loading-sm text-primary"></span>
            )}
          </div>
        </div>

          {showSearch && (
            <div className="px-4 py-2 border-b border-white/10 bg-white/[0.03] pop-in">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    placeholder="Search messages..."
                    className="w-full input input-xs bg-white/[0.06] text-white border-white/10 focus:border-primary text-xs rounded-xl h-9 pl-8 placeholder-white/30"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none rounded-xl px-3 text-xs text-white font-bold h-9 min-h-9"
                >
                  {isSearching ? <span className="loading loading-spinner loading-xs" /> : "Search"}
                </button>
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); setSearchIndex(-1); }}
                  className="btn btn-ghost btn-xs text-base-content/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-base-content/50">
                        {searchIndex + 1}/{searchResults.length}
                      </span>
                      <button
                        onClick={goToPrevResult}
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-white p-0.5"
                        title="Previous"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={goToNextResult}
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-white p-0.5"
                        title="Next"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {searchResults.map((r, i) => (
                      <button
                        key={r._id}
                        onClick={() => {
                          scrollToMessage(r._id, i);
                        }}
                        className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                          i === searchIndex
                            ? "bg-primary/20 text-white"
                            : "text-white/70 hover:text-white bg-base-900/60 hover:bg-base-900"
                        }`}
                      >
                        <span className="font-bold text-primary shrink-0">{r.firstName}:</span>
                        <span className="truncate">{r.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <p className="text-[10px] text-base-content/40 mt-1">0 results found</p>
              )}
            </div>
          )}

        {/* Messages */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto chat-grid-bg px-4 sm:px-6 py-5 space-y-3"
          >
            {hasMore && messages.length >= 10 && (
              <div className="text-center py-2 fade-up">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 bg-white/[0.05] py-1 px-3 rounded-full border border-white/10">
                  Scroll up to load older messages
                </span>
              </div>
            )}

            {messages.length === 0 && !isFetching && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-indigo-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-base-950 flex items-center justify-center">
                      <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black text-white text-shimmer">
                    Matched with {partnerName}!
                  </p>
                  <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                    Start the conversation! Share what tech project you're working on.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-sm">
                  <button
                    onClick={() => sendMessage("Hey! Want to pair program on a project? 🚀")}
                    className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white rounded-xl px-3 text-xs font-bold h-9 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 transition-all"
                  >
                    Pair Program 🚀
                  </button>
                  <button
                    onClick={() => sendMessage("What tech stack are you currently building with? 💻")}
                    className="btn border-white/10 bg-white/5 hover:bg-white/10 border text-white rounded-xl px-3 text-xs font-bold h-9 hover:scale-105 active:scale-95 transition-all"
                  >
                    Ask Tech Stack 💻
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isSelf = firstName === msg.firstName;
              const showDivider =
                index === 0 ||
                formatDayLabel(messages[index - 1].createdAt) !== formatDayLabel(msg.createdAt);
              const staggerDelay =
                index >= messages.length - 6 ? (index - (messages.length - 6)) * 70 : 0;
              return (
                <div key={`${msg._id || index}`}>
                  {showDivider && (
                    <div className="flex items-center justify-center my-3 date-divider">
                      <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 backdrop-blur-md">
                        {formatDayLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    id={"msg-" + msg._id}
                    className={`chat ${isSelf ? "chat-end" : "chat-start"} ${
                      isSelf ? "msg-in-self" : "msg-in-other"
                    }`}
                    style={{ animationDelay: `${staggerDelay}ms` }}
                    onMouseEnter={() => setReactionMsgId(msg._id)}
                    onMouseLeave={() => { if (showDeleteMenu !== msg._id) setReactionMsgId(null); }}
                  >
                    <div className="chat-header text-[10px] text-white/35 mb-1 flex items-center gap-1.5 px-1 font-bold">
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
                      className={`chat-bubble ${isSelf ? "chat-bubble-self" : "chat-bubble-other"} text-xs sm:text-sm max-w-md break-words py-3 px-4 font-medium relative overflow-visible ${
                        msg.isDeleted ? "opacity-60 italic" : ""
                      } ${highlightMsgId === msg._id ? "search-highlight" : ""}`}
                    >
                      {msg.isDeleted ? (
                        "This message was deleted"
                      ) : (
                        <>
                          {msg.text && <span>{msg.text}</span>}
                          {msg.attachment && (
                            <div className={msg.text ? "mt-2" : ""}>
                              {msg.attachment.type === "image" ? (
                                <MediaImage
                                  src={msg.attachment.url}
                                  alt={msg.attachment.name}
                                  className="max-w-[200px] max-h-[200px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setPreviewAttachment(msg.attachment)}
                                />
                              ) : msg.attachment.type === "audio" ? (
                                <VoiceMessage url={resolveMediaUrl(msg.attachment.url)} isSelf={isSelf} />
                              ) : (
                                <button
                                  onClick={() => setPreviewAttachment(msg.attachment)}
                                  className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-xs hover:bg-black/30 transition-colors w-full text-left"
                                >
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="truncate">{msg.attachment.name}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Reactions badge attached to bottom of bubble */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`react-pop absolute ${isSelf ? "right-0" : "left-0"} -bottom-2.5 flex gap-0.5 bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-full px-1.5 py-0.5 shadow-lg z-20`}>
                          {msg.reactions.map((r, i) => {
                            const isMine = r.userId === userId || r.userId?._id === userId;
                            return (
                              <span
                                key={i}
                                onClick={() => isMine ? handleReaction(msg._id, r.emoji) : null}
                                className={`text-sm ${isMine ? "cursor-pointer opacity-100" : "opacity-80"}`}
                                title={isMine ? "Click to remove" : ""}
                              >
                                {r.emoji}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Hover actions: reaction + delete */}
                      {!msg.isDeleted && reactionMsgId === msg._id && (
                        <div className={`absolute ${isSelf ? "-left-16" : "-right-8"} top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-150`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveReactionPicker(activeReactionPicker === msg._id ? null : msg._id); }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/15 shadow-lg backdrop-blur-md hover:bg-white/15 hover:scale-110 transition-all"
                            title="Add reaction"
                          >
                            <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          {isSelf && (
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(showDeleteMenu === msg._id ? null : msg._id); }}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/15 shadow-lg backdrop-blur-md hover:bg-red-500/20 hover:border-red-500/30 hover:scale-110 transition-all"
                                title="Delete message"
                              >
                                <svg className="w-3.5 h-3.5 text-white/60 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {showDeleteMenu === msg._id && (
                                <>
                                  <div className="fixed inset-0 z-50" onClick={() => setShowDeleteMenu(null)} />
                                  <div className={`absolute top-full ${isSelf ? "right-0" : "left-0"} mt-1 z-50 bg-base-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px] pop-in`}>
                                    <button onClick={() => handleDeleteMessage(msg._id, "me")} className="block w-full text-left text-xs text-white/80 hover:bg-base-800 px-4 py-2.5 transition-colors">Delete for me</button>
                                    <button onClick={() => handleDeleteMessage(msg._id, "everyone")} className="block w-full text-left text-xs text-red-400 hover:bg-base-800 px-4 py-2.5 transition-colors">Delete for everyone</button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reaction picker popup */}
                      {activeReactionPicker === msg._id && !msg.isDeleted && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveReactionPicker(null)} />
                          <div className={`absolute z-40 ${isSelf ? "right-0" : "left-0"} bottom-full mb-2 flex items-center gap-1 bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-full px-3 py-1.5 shadow-2xl pop-in`}>
                            {EMOJIS.map((emoji) => {
                              const userReacted = getUserReaction(msg.reactions) === emoji;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => { handleReaction(msg._id, emoji); setActiveReactionPicker(null); }}
                                  className={`text-lg hover:scale-125 transition-transform ${userReacted ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tick + Delete footer */}
                    <div className={`flex items-center gap-1 mt-0.5 ${isSelf ? "justify-end pr-1" : "justify-start pl-1"}`}>
                      {isSelf && <TickIcon status={msg.status} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Jump to bottom */}
          {showJump && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 z-30 jump-in w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-transform"
              title="Jump to latest"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="relative px-4 py-3.5 border-t border-white/10 flex items-center gap-2.5 sm:gap-3 bg-white/[0.04] backdrop-blur-2xl">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip,.mp4,.mp3"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-white/50 hover:text-white hover:border-white/25 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            title="Attach file"
          >
            {uploading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          {/* Emoji picker */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.06] border transition-all hover:scale-105 active:scale-95 ${
                showEmojiPicker
                  ? "text-primary border-primary/50 bg-primary/10"
                  : "text-white/50 hover:text-white border-white/10 hover:bg-white/10 hover:border-white/25"
              }`}
              title="Emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-full left-0 mb-2 z-20 bg-base-900 border border-white/10 rounded-2xl shadow-2xl p-3 w-[320px] max-h-[260px] overflow-y-auto pop-in">
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_LIST.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setNewMessage((prev) => prev + emoji);
                          emitTyping();
                        }}
                        className="text-xl hover:bg-white/10 hover:scale-125 rounded-lg p-1 transition-all"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {isRecording ? (
            <div className="flex items-center gap-3 flex-1 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 h-12">
              <span className="rec-ping w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <span className="text-white font-bold text-xs tracking-wider shrink-0">
                {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
                {String(recordingTime % 60).padStart(2, "0")}
              </span>
              <span className="text-red-400/70 text-[10px] uppercase tracking-widest font-black">
                Recording...
              </span>
              <button
                onClick={cancelRecording}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-all shrink-0"
                title="Cancel recording"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="input-glow flex-1 flex items-center bg-white/[0.06] border border-white/10 rounded-2xl px-4 h-12">
              <input
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type a message or code snippet..."
                className="flex-1 bg-transparent text-white text-xs outline-none placeholder-white/30"
              />
            </div>
          )}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white px-5 rounded-2xl h-12 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-wider shrink-0"
              title="Send voice message"
            >
              <span>Send Voice</span>
            </button>
          ) : !newMessage.trim() ? (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white w-12 rounded-2xl h-12 flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all shrink-0"
              title="Press and hold to record voice message"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              className="btn btn-primary btn-shine bg-gradient-to-r from-primary to-secondary border-none text-white px-6 rounded-2xl h-12 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-wider shrink-0"
            >
              <span>Send</span>
              <svg className="w-4 h-4 fill-current rotate-45 text-white" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Attachment preview modal */}
      {previewAttachment && (
        <>
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewAttachment(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewAttachment(null)}>
            <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
              {previewAttachment.type === "image" ? (
                <MediaImage
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
              ) : previewAttachment.type === "audio" ? (
                <div className="bg-base-900 border border-white/10 rounded-2xl shadow-2xl p-12 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-lg text-center break-all max-w-md">Voice message</p>
                  <audio controls autoPlay src={resolveMediaUrl(previewAttachment.url)} className="w-[320px]" />
                </div>
              ) : (
                <div className="bg-base-900 border border-white/10 rounded-2xl shadow-2xl p-12 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-base-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-lg text-center break-all max-w-md">{previewAttachment.name}</p>
                  {previewAttachment.size && (
                    <p className="text-white/40 text-xs">{(previewAttachment.size / 1024).toFixed(1)} KB</p>
                  )}
                </div>
              )}
              <button
                onClick={() => downloadFile(resolveMediaUrl(previewAttachment.url), previewAttachment.name)}
                className="absolute top-4 right-14 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all shadow-lg"
                title="Download"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all shadow-lg"
                title="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
