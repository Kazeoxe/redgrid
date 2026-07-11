"use client";
import { useEffect, useState } from "react";
import { completeOAuth } from "../../../lib/oauth";
import { loadSettings } from "../../../storage";

export default function CallbackPage() {
  const [msg, setMsg] = useState("Connexion en cours…");

  useEffect(() => {
    (async () => {
      try {
        const settings = await loadSettings(window.location.origin);
        await completeOAuth(new URLSearchParams(window.location.search), settings);
        setMsg("Connecté. Redirection…");
        window.location.replace("/");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    })();
  }, []);

  return (
    <div style={{
      height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#08080a", color: "#ededef",
      fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", padding: 24, textAlign: "center",
    }}>
      {msg}
    </div>
  );
}
