// src/pages/community/CommunityPage.jsx
/*import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import CommunitySidebar from "../../components/community/CommunitySidebar";
import ChatWindow from "../../components/community/ChatWindow";
import AiAssistantWidget from "../../components/community/AiAssistantWidget";
import MembersPanel from "../../components/community/MembersPanel";
import ResourcePanel from "../../components/community/ResourcePanel";

import socket from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";

const CommunityPage = () => {
  const { communityId } = useParams();
  const { user } = useContext(AuthContext);
  const [activeChannel, setActiveChannel] = useState("general");

  /* ============================
     JOIN / LEAVE COMMUNITY ROOM
  ============================ 
  useEffect(() => {
    if (!communityId || !user?._id) return;

    socket.emit("join-community", communityId);

    return () => {
      socket.emit("leave-community", communityId);
    };
  }, [communityId, user?._id]);

  return (
    <div className="community-layout">
      <CommunitySidebar
        communityId={communityId}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
      />

      <ChatWindow
        communityId={communityId}
        channelId={activeChannel}
      />

      <MembersPanel communityId={communityId} />
      <ResourcePanel communityId={communityId} />
      <AiAssistantWidget />
    </div>
  );
};

export default CommunityPage;
*/
// src/pages/community/CommunityPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import CommunitySidebar from "../../components/community/CommunitySidebar";
import ChatWindow from "../../components/community/ChatWindow";
import MembersPanel from "../../components/community/MembersPanel";
import ResourcePanel from "../../components/community/ResourcePanel";
import AiAssistantWidget from "../../components/community/AiAssistantWidget";

import socket from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";

const CommunityPage = () => {
  const { communityId } = useParams();
  const { user } = useContext(AuthContext);

  // single source of truth for channel
  const [activeChannel, setActiveChannel] = useState("general");

  /* ============================
     JOIN / LEAVE COMMUNITY ROOM
     (members + presence)
  ============================ */
  useEffect(() => {
    if (!communityId || !user?._id) return;

    // join base community room
    socket.emit("join-community", communityId);

    return () => {
      socket.emit("leave-community", communityId);
    };
  }, [communityId, user?._id]);

  /* ============================
     JOIN / LEAVE CHANNEL ROOM
     (messages)
  ============================ */
  useEffect(() => {
    if (!communityId || !activeChannel) return;

    const channelRoom = `${communityId}:${activeChannel}`;

    socket.emit("join-community", channelRoom);

    return () => {
      socket.emit("leave-community", channelRoom);
    };
  }, [communityId, activeChannel]);

  return (
    <div className="community-layout">
      {/* LEFT: Channels */}
      <CommunitySidebar
        communityId={communityId}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
      />

      {/* CENTER: Chat */}
      <ChatWindow
        communityId={communityId}
        channelId={activeChannel}
      />

      {/* RIGHT: Members & Resources */}
      <MembersPanel communityId={communityId} />
      <ResourcePanel communityId={communityId} />

      {/* FLOATING AI */}
      <AiAssistantWidget
  communityId={communityId}
  channelId={activeChannel}
/>

    </div>
  );
};

export default CommunityPage;
