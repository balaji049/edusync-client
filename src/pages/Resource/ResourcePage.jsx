// src/pages/Resource/ResourcePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

const ResourcePage = () => {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get(`/resources/get/${resourceId}`); // create this endpoint if needed
        setResource(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [resourceId]);

  if (!resource) return <div>Loading resource…</div>;

  return (
    <div className="page-container">
      <h1>{resource.title}</h1>
      <p>{resource.description}</p>

      {resource.url ? (
        // for files served from backend you may need full URL: http://localhost:5000 + url
        <a href={resource.url.startsWith("http") ? resource.url : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${resource.url}`} target="_blank" rel="noreferrer">
          Open resource →
        </a>
      ) : (
        <p>No resource URL found</p>
      )}
    </div>
  );
};

export default ResourcePage;
