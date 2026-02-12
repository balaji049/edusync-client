// src/components/community/ChatWindow.jsx
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import ChatSearchBar from "./ChatSearchBar";
import API from "../../services/api";
import MessageBubble from "./MessageBubble";
import socket from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";
import CallButton from "./CallButton";
//import VideoRoom from "./VideoRoom";




/* ============================
   NORMALIZE MESSAGE FORMAT
   (FINAL – SAFE & CORRECT)
============================ */
const normalizeMessage = (m) => ({
  _id: m._id,
  text: m.text,
  type: m.type || "text",          // text | file | image | ai | system
  channel: m.channel,
  timestamp: m.timestamp,

  // sender identity
  senderId:
    m.role === "ai"
      ? "ai"
      : m.senderId || m.sender?._id || null,

  senderName:
    m.role === "ai"
      ? "EduSync AI"
      : m.senderName || m.sender?.name || "Unknown",

  senderRole: m.role || "user",    // user | ai | system

  // attached resource (file/image)
  resource: m.resource || null,
});

/* ============================
   HIGHLIGHT SEARCH TEXT
============================ */
function highlightText(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

const ChatWindow = ({ communityId, channelId }) => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  const messageRefs = useRef({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  /* ============================
     RESET ON CHANNEL CHANGE
  ============================ */
  useEffect(() => {
    setMessages([]);
    setSearchResults(null);
    setSearchQuery("");
    setTypingUsers([]);
    messageRefs.current = {};
  }, [channelId]);

  /* ============================
     LOAD MESSAGE HISTORY
  ============================ */
  useEffect(() => {
    if (!communityId || !channelId) return;

    API.get(`/messages/list/${communityId}`)
      .then((res) => {
        const channelMessages = res.data
          .filter((m) => m.channel === channelId)
          .map(normalizeMessage);
        setMessages(channelMessages);
      })
      .catch(console.error);
  }, [communityId, channelId]);

  /* ============================
     REAL-TIME SOCKET MESSAGES
  ============================ */
  useEffect(() => {
    if (!channelId || !user?._id) return;

    const handleMessage = (msg) => {
      if (msg.channel !== channelId) return;

      const normalized = normalizeMessage(msg);

      setMessages((prev) => {
        if (prev.some((m) => m._id === normalized._id))
          return prev;
        return [...prev, normalized];
      });
    };

    socket.on("message-received", handleMessage);
    return () =>
      socket.off("message-received", handleMessage);
  }, [channelId, user?._id]);



  /* ============================
   📡 LIVE RESOURCE COUNTER UPDATE
   (RUN ONCE)
============================ */
useEffect(() => {
  const handleResourceUpdate = (data) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.resource?._id === data.resourceId
          ? {
              ...m,
              resource: {
                ...m.resource,
                views: data.views,
                downloads: data.downloads,
              },
            }
          : m
      )
    );
  };

  socket.on("resource-updated", handleResourceUpdate);

  return () => {
    socket.off("resource-updated", handleResourceUpdate);
  };
}, []);


  /* ============================
     TYPING INDICATOR
  ============================ */
  useEffect(() => {
    const handleTypingUpdate = (userIds) => {
      setTypingUsers(
        userIds.filter((id) => id !== user?._id)
      );
    };

    socket.on("typing:update", handleTypingUpdate);
    return () =>
      socket.off("typing:update", handleTypingUpdate);
  }, [user?._id]);

  /* ============================
     AUTO SCROLL
  ============================ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, searchResults]);

  /* ============================
     SEND MESSAGE
  ============================ */
  const sendMessage = async () => {
    if (!text.trim()) return;

    const payload = text;
    setText("");

    const room = `${communityId}:${channelId}`;
    socket.emit("typing:stop", { room });

    await API.post("/messages/send", {
      communityId,
      channelId,
      text: payload,
    });
  };






  /* ============================
     HANDLE TYPING
  ============================ */
  const handleTyping = (value) => {
    setText(value);

    const room = `${communityId}:${channelId}`;
    socket.emit("typing:start", { room });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { room });
    }, 1200);
  };

  /* ============================
     FILE UPLOAD (RESOURCE → MESSAGE)
  ============================ */
  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("communityId", communityId);
    formData.append("channelId", channelId);

    await API.post(
      "/resources/upload-message",
      formData
    );

    fileInputRef.current.value = "";
  };

  /* ============================
     JUMP TO MESSAGE
  ============================ */
  const jumpToMessage = (id) => {
    messageRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const displayMessages = searchResults ?? messages;

  return (
    <section className="chat-window">
      {/* 🔍 SEARCH */}
      <ChatSearchBar
        communityId={communityId}
        onResults={setSearchResults}
        onQuery={setSearchQuery}
      />

      {searchResults && (
        <button
          className="clear-search-btn"
          onClick={() => setSearchResults(null)}
        >
          Clear Search
        </button>
      )}

   {/*
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
  <LiveKitButton
    communityId={communityId}
    channelId={channelId}
  />
</div>

<LiveKitRoomView
  communityId={communityId}
  channelId={channelId}
/>


    {/* 🔊 CALL CONTROLS (CHANNEL LEVEL) 
<div className="voice-call-header" style={{ display: "flex", gap: "8px" }}>
  <CallButton
    communityId={communityId}
    channelId={channelId}
  />

  <div style={{ marginBottom: "10px" }}>
  <button disabled style={{ marginRight: "8px" }}>
    Voice Call (Disabled)
  </button>
  <button disabled>
    Video Call (Disabled)
  </button>
</div>


</div>

*/}
{/* 🎥 VIDEO ROOM (ABOVE MESSAGES) 
<VideoRoom
  communityId={communityId}
  channelId={channelId}
/>  */}

{/* 🔊 VOICE CALL (AUDIO ONLY) */}




      {/* 💬 MESSAGES */}
      <div className="chat-messages">
        {displayMessages.map((msg) => (
          <div
            key={msg._id}
            ref={(el) =>
              (messageRefs.current[msg._id] = el)
            }
            onClick={() =>
              searchResults && jumpToMessage(msg._id)
            }
          >
            <MessageBubble
  type={msg.type}
  name={msg.senderName}
  isSelf={msg.senderId === user?._id}
  resource={msg.resource}
>
  {/* TEXT CONTENT */}
  {msg.text && (
    searchResults ? (
      <span
        dangerouslySetInnerHTML={{
          __html: highlightText(msg.text, searchQuery),
        }}
      />
    ) : (
      <span>{msg.text}</span>
    )
  )}

  {/* CHANNEL TAG (SEARCH MODE ONLY) */}
  {searchResults && (
    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
      #{msg.channel}
    </div>
  )}
</MessageBubble>

          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ✏️ TYPING */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          Someone is typing...
        </div>
      )}

      {/* ✍️ INPUT */}
      <div className="chat-input">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) =>
            handleFileUpload(e.target.files[0])
          }
        />

        <input
          value={text}
          onChange={(e) =>
            handleTyping(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
          placeholder={`Message #${channelId}`}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </section>
  );
};

export default ChatWindow;




/*




import React, { useEffect, useState, useContext } from "react";
import API from "../../services/api";
import MessageBubble from "./MessageBubble";
import socket from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";

const ChatWindow = ({ communityId, channelId }) => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* ============================
     RESET ON CHANNEL CHANGE
  ============================ 
  useEffect(() => {
    setMessages([]);
  }, [channelId]);

  /* ============================
     LOAD MESSAGE HISTORY
     (CHANNEL-SCOPED)
  ============================ 
  useEffect(() => {
    if (!communityId || !channelId) return;

    API.get(`/messages/list/${communityId}`)
      .then((res) => {
        const channelMessages = res.data.filter(
          (m) => m.channel === channelId
        );
        setMessages(channelMessages);
      })
      .catch((err) =>
        console.error("Load messages failed:", err)
      );
  }, [communityId, channelId]);

  /* ============================
     REAL-TIME SOCKET MESSAGES
     (CHANNEL ALREADY JOINED)
  ============================ 
  useEffect(() => {
    if (!communityId || !channelId || !user?._id) return;

    const handleMessage = (msg) => {
      // extra safety (should already be isolated by room)
      if (msg.channel !== channelId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("message-received", handleMessage);

    return () => {
      socket.off("message-received", handleMessage);
    };
  }, [communityId, channelId, user?._id]);

  /* ============================
     SEND MESSAGE
  ============================ 
  const sendMessage = async () => {
    if (!text.trim() || !channelId) return;

    const payload = text;
    setText("");

    try {
      await API.post("/messages/send", {
        communityId,
        channelId,
        text: payload,
      });
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  return (
    <section className="chat-window">
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            role={msg.role}                // ✅ user | ai
            name={msg.senderName}          // ✅ stable
            isSelf={msg.senderId === user?._id}
          >
            {msg.text}
          </MessageBubble>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={`Message #${channelId}`}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </section>
  );
};

export default ChatWindow;
*/