// src/components/community/ResourcePanel.jsx
import React, { useState, useEffect, useContext } from "react";
import API from "../../services/api";
import PrimaryButton from "../common/PrimaryButton";
import AddResourceModal from "./AddResourceModal";
import { AuthContext } from "../../context/AuthContext";
import socket from "../../services/socket";
import "./ResourcePanel.css";

const ResourcePanel = ({ communityId }) => {
  const { user } = useContext(AuthContext);

  const [resources, setResources] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  /* ============================
     ROLE CHECK
  ============================ */
  const canManageResources =
    user && ["teacher", "admin"].includes(user.role);

  /* ============================
     FETCH RESOURCES
  ============================ */
  const fetchResources = async () => {
    try {
      const res = await API.get(`/resources/${communityId}`);
      setResources(res.data);
    } catch (error) {
      console.error("Resource fetch error:", error);
    }
  };

  useEffect(() => {
    if (communityId) fetchResources();
  }, [communityId]);

  /* ============================
     SOCKET REAL-TIME SYNC
     (SINGLE SOURCE OF TRUTH)
  ============================ */
  useEffect(() => {
    if (!communityId) return;

    socket.emit("join-community", communityId);

    const handleResourceUpdated = ({
      resourceId,
      views,
      downloads,
    }) => {
      setResources((prev) =>
        prev.map((r) =>
          r._id === resourceId
            ? { ...r, views, downloads }
            : r
        )
      );
    };

    const handleResourceDeleted = ({ resourceId }) => {
      setResources((prev) =>
        prev.filter((r) => r._id !== resourceId)
      );
    };

    const handleResourceEdited = (updatedResource) => {
      setResources((prev) =>
        prev.map((r) =>
          r._id === updatedResource._id
            ? updatedResource
            : r
        )
      );
    };

    socket.on("resource-updated", handleResourceUpdated);
    socket.on("resource-deleted", handleResourceDeleted);
    socket.on("resource-edited", handleResourceEdited);

    return () => {
      socket.emit("leave-community", communityId);
      socket.off("resource-updated", handleResourceUpdated);
      socket.off("resource-deleted", handleResourceDeleted);
      socket.off("resource-edited", handleResourceEdited);
    };
  }, [communityId]);

  /* ============================
     HELPERS
  ============================ */
  const isImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isPDF = (url) => /\.pdf$/i.test(url);

  /* ============================
     DELETE RESOURCE
  ============================ */
  const handleDelete = async (resourceId) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await API.delete(`/resources/${resourceId}`);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete resource");
    }
  };

  /* ============================
     EDIT RESOURCE
  ============================ */
  const handleEdit = async (resource) => {
    const title = prompt("Edit title", resource.title);
    if (title === null) return;

    const description = prompt(
      "Edit description",
      resource.description || ""
    );

    try {
      await API.put(`/resources/${resource._id}`, {
        title,
        description,
      });
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update resource");
    }
  };

  /* ============================
     UI
  ============================ */
  return (
    <aside className="resource-panel">
      <h3>📚 Resources</h3>

      {canManageResources && (
        <PrimaryButton onClick={() => setShowUpload(true)}>
          + Add Resource
        </PrimaryButton>
      )}

      <div className="resource-list">
        {resources.map((r) => (
          <div className="resource-card" key={r._id}>
            <h4>{r.title}</h4>
            {r.description && <p>{r.description}</p>}

            {/* ANALYTICS */}
            <div className="resource-meta">
              <span>👁 {r.views || 0}</span>
              <span>⬇️ {r.downloads || 0}</span>
            </div>

            {/* IMAGE */}
            {r.url && isImage(r.url) && (
              <img
                src={`http://localhost:5000${r.url}`}
                alt={r.title}
                className="resource-preview-image"
              />
            )}

            {/* PDF */}
            {r.url && isPDF(r.url) && (
              <iframe
                src={`http://localhost:5000${r.url}`}
                title={r.title}
                className="resource-preview-pdf"
              />
            )}

            {/* ACTIONS */}
            {r.url && (
              <div className="resource-actions">
                <a
                  href={`http://localhost:5000${r.url}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    API.post(`/resources/${r._id}/view`)
                  }
                >
                  🔗 Open
                </a>

                <a
                  href={`http://localhost:5000${r.url}`}
                  download
                  onClick={() =>
                    API.post(
                      `/resources/${r._id}/download`
                    )
                  }
                >
                  ⬇️ Download
                </a>

                {canManageResources && (
                  <>
                    <button
                      className="resource-btn"
                      onClick={() => handleEdit(r)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="resource-btn danger"
                      onClick={() => handleDelete(r._id)}
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showUpload && (
        <AddResourceModal
          communityId={communityId}
          onClose={() => {
            setShowUpload(false);
            fetchResources();
          }}
        />
      )}
    </aside>
  );
};

export default ResourcePanel;
