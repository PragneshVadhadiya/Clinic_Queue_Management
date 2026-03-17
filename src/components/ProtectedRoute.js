"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace(`/${user.role}`); // Redirect to their actual role path if forbidden
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ fontSize: "18px", color: "var(--text-muted)" }}>Loading verification...</p>
      </div>
    );
  }

  // Double check in render to avoid flickering forbidden content
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; 
  }

  return children;
}
