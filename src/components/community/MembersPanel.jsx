// src/components/community/MembersPanel.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import API from "../../services/api";
import socket from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";

const roleColors = {
  admin: "#dc2626",
  teacher: "#2563eb",
  student: "#10b981",
};

const MembersPanel = ({ communityId }) => {
  const { user } = useContext(AuthContext);

  const [members, setMembers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  /* ============================
     FETCH MEMBERS (DB SOURCE OF TRUTH)
  ============================ */
  const fetchMembers = useCallback(async () => {
    if (!communityId) return;

    try {
      const res = await API.get(`/community/members/${communityId}`);
      setMembers(res.data);
    } catch (err) {
      console.error("Member fetch error:", err);
    }
  }, [communityId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ============================
     SOCKET LISTENERS (NO MUTATION)
  ============================ */
  useEffect(() => {
    if (!communityId || !user?._id) return;

    const handleCommunityChange = () => {
      fetchMembers();
    };

    const handleOnlineUpdate = (onlineIds) => {
      setOnlineUserIds(onlineIds);
    };

    socket.on("community-members-update", handleCommunityChange);
    socket.on("onlineStatusUpdate", handleOnlineUpdate);

    return () => {
      socket.off("community-members-update", handleCommunityChange);
      socket.off("onlineStatusUpdate", handleOnlineUpdate);
    };
  }, [communityId, user?._id, fetchMembers]);

  return (
    <aside className="members-panel">
      <h3>👥 Members</h3>

      <div className="members-list">
        {members.map((m) => {
          const isOnline = onlineUserIds.includes(m.userId);

          return (
            <div key={m.userId} className="member-item">
              <span
                className="member-status"
                style={{
                  background: isOnline ? "#22c55e" : "#9ca3af",
                }}
              />
              <p className="member-name">{m.name}</p>
              <span
                className="member-role-tag"
                style={{
                  background: roleColors[m.role] || "#6b7280",
                }}
              >
                {m.role}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default MembersPanel;
