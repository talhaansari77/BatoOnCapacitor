import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileConnectionFlow from "../components/profilelink/ProfileConnectionFlow";

export default function ProfileConnection() {
  const navigate = useNavigate();

  const handleComplete = ({ matchStatus, profileId, redirectTo }) => {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate("/Dashboard");
    }
  };

  return (
    <ProfileConnectionFlow 
      onComplete={handleComplete}
    />
  );
}