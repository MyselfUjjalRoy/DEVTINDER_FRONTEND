import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

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
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);

  const user = useSelector((store) => store.user);
  const firstName = user?.firstName;
  const userId = user?._id;

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const readEmittedRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
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

    readEmittedRef.current = false;

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(BASE_URL + "upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { url, type, name, size } = res.data;
      if (socketRef.current) {
        socketRef.current.emit("sendMessage", {
          targetUserId,
          text: "",
          attachment: { url, type, name, size },
        });
        setTimeout(() => scrollToBottom(), 30);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleDeleteChat = async () => {
    setDeletingChat(true);
    try {
      await axios.delete(BASE_URL + "chat/" + targetUserId, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.error("Delete chat error:", err);
    } finally {
      setDeletingChat(false);
      setShowChatMenu(false);
    }
  };

  const partnerName = partner
    ? `${partner.firstName} ${partner.lastName || ""}`
    : "Developer Match";

  const attachmentUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return BASE_URL.replace(/\/+$/, "") + url;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 my-6">
      <div className="glass-card border border-white/10 h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
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
                {isTyping && typingUser ? (
                  <span className="text-[10px] text-primary uppercase tracking-widest font-black animate-pulse">
                    {typingUser} is typing...
                  </span>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">
                      Pair Session Connected
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); setSearchResults([]); }}
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-white p-1.5"
              title="Search messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowChatMenu(!showChatMenu)}
                className="btn btn-ghost btn-xs text-base-content/60 hover:text-white p-1.5"
                title="More options"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </button>
              {showChatMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowChatMenu(null)} />
                  <div className="absolute right-0 top-full mt-1 z-40 bg-base-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                    <button
                      onClick={handleDeleteChat}
                      disabled={deletingChat}
                      className="flex items-center gap-2 w-full text-left text-xs text-red-400 hover:bg-base-800 px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      {deletingChat ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      Delete chat
                    </button>
                  </div>
                </>
              )}
            </div>
            {isFetching && (
              <span className="loading loading-spinner loading-sm text-primary"></span>
            )}
          </div>
        </div>

          {showSearch && (
            <div className="px-4 py-2 border-b border-white/10 bg-base-950/60">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Search messages..."
                  className="flex-1 input input-xs bg-base-900 text-white border-white/10 focus:border-primary text-xs rounded-xl h-9"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn btn-primary btn-xs rounded-xl px-3 text-xs"
                >
                  {isSearching ? <span className="loading loading-spinner loading-xs" /> : "Search"}
                </button>
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); setSearchIndex(-1); }}
                  className="btn btn-ghost btn-xs text-base-content/60"
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
                key={msg._id || index}
                id={"msg-" + msg._id}
                className={`chat ${isSelf ? "chat-end" : "chat-start"}`}
                onMouseEnter={() => setReactionMsgId(msg._id)}
                onMouseLeave={() => { if (showDeleteMenu !== msg._id) setReactionMsgId(null); }}
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
                  className={`chat-bubble text-xs sm:text-sm max-w-md break-words py-3 px-4 shadow-xl font-medium relative overflow-visible ${
                    isSelf
                      ? "bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-none"
                      : "bg-base-900 text-white rounded-2xl rounded-tl-none border border-white/10"
                  } ${msg.isDeleted ? "opacity-60 italic" : ""} ${highlightMsgId === msg._id ? "search-highlight" : ""}`}
                >
                  {msg.isDeleted ? (
                    "This message was deleted"
                  ) : (
                    <>
                      {msg.text && <span>{msg.text}</span>}
                      {msg.attachment && (
                        <div className={msg.text ? "mt-2" : ""}>
                          {msg.attachment.type === "image" ? (
                            <img
                              src={attachmentUrl(msg.attachment.url)}
                              alt={msg.attachment.name}
                              className="max-w-[200px] max-h-[200px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(attachmentUrl(msg.attachment.url), "_blank")}
                            />
                          ) : (
                            <a
                              href={attachmentUrl(msg.attachment.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-xs hover:bg-black/30 transition-colors"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="truncate">{msg.attachment.name}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Reactions badge attached to bottom of bubble */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`absolute ${isSelf ? "right-0" : "left-0"} -bottom-2.5 flex gap-0.5 bg-base-900 border border-white/10 rounded-full px-1.5 py-0.5 shadow-lg z-20`}>
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

                  {/* Reaction trigger icon — appears on hover */}
                  {!msg.isDeleted && reactionMsgId === msg._id && (
                    <div className={`absolute ${isSelf ? "-left-8" : "-right-8"} top-1/2 -translate-y-1/2 transition-opacity duration-150`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveReactionPicker(activeReactionPicker === msg._id ? null : msg._id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-base-900 border border-white/10 shadow-lg hover:bg-base-800 hover:scale-110 transition-all"
                        title="Add reaction"
                      >
                        <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Reaction picker popup */}
                  {activeReactionPicker === msg._id && !msg.isDeleted && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActiveReactionPicker(null)} />
                      <div className={`absolute z-40 ${isSelf ? "right-0" : "left-0"} bottom-full mb-2 flex items-center gap-1 bg-base-900 border border-white/10 rounded-full px-3 py-1.5 shadow-2xl`}>
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
                        {isSelf && (
                          <div className="w-px h-5 bg-white/10 mx-1" />
                        )}
                        {isSelf && (
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(showDeleteMenu === msg._id ? null : msg._id); }}
                              className="text-xs text-white/50 hover:text-red-400 transition-colors p-1"
                              title="Delete message"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            {showDeleteMenu === msg._id && (
                              <>
                                <div className="fixed inset-0 z-50" onClick={() => setShowDeleteMenu(null)} />
                                <div className="absolute bottom-full right-0 mb-1 z-50 bg-base-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                                  <button onClick={() => handleDeleteMessage(msg._id, "me")} className="block w-full text-left text-xs text-white/80 hover:bg-base-800 px-4 py-2.5 transition-colors">Delete for me</button>
                                  <button onClick={() => handleDeleteMessage(msg._id, "everyone")} className="block w-full text-left text-xs text-red-400 hover:bg-base-800 px-4 py-2.5 transition-colors">Delete for everyone</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Tick + Delete footer */}
                <div className={`flex items-center gap-1 mt-0.5 ${isSelf ? "justify-end pr-1" : "justify-start pl-1"}`}>
                  {isSelf && <TickIcon status={msg.status} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-base-950/90">
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
            className="btn btn-ghost btn-xs text-base-content/50 hover:text-white p-1.5 disabled:opacity-50"
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
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-ghost btn-xs text-base-content/50 hover:text-white p-1.5"
              title="Emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-full left-0 mb-2 z-20 bg-base-900 border border-white/10 rounded-2xl shadow-2xl p-3 w-[320px] max-h-[260px] overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_LIST.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setNewMessage((prev) => prev + emoji);
                          emitTyping();
                        }}
                        className="text-xl hover:bg-base-800 rounded-lg p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <input
            value={newMessage}
            onChange={handleInputChange}
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
