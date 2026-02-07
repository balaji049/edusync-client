import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./ProfilePage.css";

import {
  FaUserCircle,
  FaMedal,
  FaFire,
  FaChartLine,
  FaEnvelope,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

import ProfileStatCard from "../../components/profile/ProfileStatCard";
import AchievementBadge from "../../components/profile/AchievementBadge";
import ContributionHeatmap from "../../components/profile/ContributionHeatmap";
import AIInsightCard from "../../components/profile/AIInsightCard";
import EditProfileModal from "../../components/profile/EditProfileModal";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  /* ============================
     FETCH LOGGED-IN USER PROFILE
  ============================ */
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await API.get("/users/me"); // 🔐 token-based
        if (mounted) {
          setProfile(res.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Profile load error:", error);
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="loading">Loading profile...</p>;
  if (!profile) return <p className="error">Failed to load profile</p>;

  const avatarUrl = profile.profile?.avatarUrl
    ? `http://localhost:5000${profile.profile.avatarUrl}`
    : null;

  return (
    <div className="profile-container">
      {/* ============================
          PROFILE HEADER
      ============================ */}
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
              }}
            />
          ) : (
            <FaUserCircle size={100} />
          )}
        </div>

        <div className="profile-basic-info">
          <h1>
            {profile.name.charAt(0).toUpperCase() +
              profile.name.slice(1)}
          </h1>

          <p className="profile-email">
            <FaEnvelope /> {profile.email}
          </p>

          <span className={`role-tag ${profile.role}`}>
            {profile.role.toUpperCase()}
          </span>

          {/* Headline & Bio */}
          {profile.headline && (
            <p className="profile-headline">
              {profile.headline}
            </p>
          )}
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          <div className="profile-actions">
            <button
              className="edit-btn"
              onClick={() => setShowEdit(true)}
            >
              <IoSettingsSharp /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ============================
          STATS
      ============================ */}
      <div className="stats-grid">
        <ProfileStatCard
          title="Total Points"
          value={profile.points || 0}
          icon={<FaMedal />}
          color="#4F46E5"
        />

        <ProfileStatCard
          title="Messages Sent"
          value={profile.messageCount || 0}
          icon={<FaChartLine />}
          color="#0EA5E9"
        />

        <ProfileStatCard
          title="AI Questions"
          value={profile.aiQuestionsAsked || 0}
          icon={<FaFire />}
          color="#F97316"
        />

        <ProfileStatCard
          title="Learning Streak"
          value={
            profile.streakDays > 0
              ? `${profile.streakDays} days`
              : "Start today"
          }
          icon={<FaFire />}
          color="#22C55E"
        />
      </div>

      {/* ============================
          ACHIEVEMENTS
      ============================ */}
      <div className="section-card">
        <h2>🏅 Achievements</h2>

        <div className="achievements-list">
          {profile.achievements?.length ? (
            profile.achievements.map((badge, i) => (
              <AchievementBadge
                key={i}
                label={badge.label}
              />
            ))
          ) : (
            <p className="muted">
              Start participating to unlock achievements 🏆
            </p>
          )}
        </div>
      </div>

      {/* ============================
          CONTRIBUTION HEATMAP
      ============================ */}
      <div className="section-card">
        <h2>📆 Learning Activity</h2>
        <ContributionHeatmap
          data={profile.activityMap || []}
        />
      </div>

      {/* ============================
          AI INSIGHTS
      ============================ */}
      <div className="section-card">
        <h2>🤖 AI Insights</h2>
        <AIInsightCard
          messageCount={profile.messageCount || 0}
          aiQuestions={profile.aiQuestionsAsked || 0}
          streak={profile.streakDays || 0}
        />
      </div>

      {/* ============================
          EDIT PROFILE MODAL
      ============================ */}
      {showEdit && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEdit(false)}
          onUpdate={(updatedUser) =>
            setProfile(updatedUser)
          }
        />
      )}
    </div>
  );
};

export default ProfilePage;
