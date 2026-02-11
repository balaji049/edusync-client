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
import { useCall } from "../../context/CallContext";
import JitsiCall from "../calls/JitsiCall";

/* ============================
   NORMALIZE MESSAGE FORMAT
============================ */
const normalizeMessage = (m) => ({
  _id: m._id,
  text: m.text,
  type: m.type || "text",
  channel: m.channel,
  timestamp: m.timestamp,
  senderId:
    m.role === "ai"
      ? "ai"
      : m.senderId || m.sender?._id || null,
  senderName:
    m.role === "ai"
      ? "EduSync AI"
      : m.senderName || m.sender?.name || "Unknown",
  senderRole: m.role || "user",
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

  /* ============================
     🔐 SAFE CALL CONTEXT (FIX)
  ============================ */
  const callCtx = useCall?.() || {};

  const {
    startVideoCall = () => {},
    endCall = () => {},
    callActive = false,
  } = callCtx;

  const roomName = `community-${communityId}-channel-${channelId}`;

  /* ============================
     STATE
  ============================ */
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
      setMessages((prev) =>
        prev.some((m) => m._id === normalized._id)
          ? prev
          : [...prev, normalized]
      );
    };

    socket.on("message-received", handleMessage);
    return () =>
      socket.off("message-received", handleMessage);
  }, [channelId, user?._id]);

  /* ============================
     RESOURCE COUNTER UPDATE
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
    return () =>
      socket.off("resource-updated", handleResourceUpdate);
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
    socket.emit("typing:stop", {
      room: `${communityId}:${channelId}`,
    });
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
     FILE UPLOAD
  ============================ */
  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("communityId", communityId);
    formData.append("channelId", channelId);
    await API.post("/resources/upload-message", formData);
    fileInputRef.current.value = "";
  };

  /* ============================
     UI
  ============================ */
  const displayMessages = searchResults ?? messages;

  return (
    <section className="chat-window">
      <ChatSearchBar
        communityId={communityId}
        onResults={setSearchResults}
        onQuery={setSearchQuery}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {!callActive ? (
          <>
            <button onClick={() => startVideoCall(roomName)}>
              🎥 Video Call
            </button>
            <button onClick={() => startVideoCall(roomName)}>
              🔊 Audio Call
            </button>
          </>
        ) : (
          <button onClick={endCall}>❌ Leave Call</button>
        )}
      </div>

      <JitsiCall />

      <div className="chat-messages">
        {displayMessages.map((msg) => (
          <div key={msg._id}>
            <MessageBubble
              type={msg.type}
              name={msg.senderName}
              isSelf={msg.senderId === user?._id}
              resource={msg.resource}
            >
              {msg.text &&
                (searchResults ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightText(
                        msg.text,
                        searchQuery
                      ),
                    }}
                  />
                ) : (
                  <span>{msg.text}</span>
                ))}
            </MessageBubble>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

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