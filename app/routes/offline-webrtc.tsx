import React, { useState } from "react";
import { useWebRTC } from "../welcome/hooks/webrtc";


export default function OfflineWebRTC() {
  const {
    role, pcState, dcState, iceState,
    localSDP,
    messages,
    remoteSDPInput, setRemoteSDPInput,
    startInitiator,
    applyOfferAndCreateAnswer,
    applyAnswer,
    sendMessage
  } = useWebRTC();

  const [msg, setMsg] = useState("");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h3>Choix du rôle</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startInitiator}>Je suis initiateur (créer offer)</button>
        </div>
        <p>
          <strong>État peer:</strong> {pcState} | 
          <strong> DataChannel:</strong> {dcState} |
          <strong> ICE:</strong> {iceState}
        </p>
      </section>

      <section>
        <h3>SDP local à partager (inclut les ICE candidates)</h3>
        <p><strong>Copie:</strong> sélectionne et partage ce JSON à l’autre tablette.</p>
        <textarea
          value={localSDP}
          readOnly
          rows={10}
          style={{ width: "100%", fontFamily: "monospace" }}
        />
      </section>

      <section>
        <h3>SDP distant à coller</h3>
        <p><strong>Colle:</strong> l’offer (si récepteur) ou l’answer (si initiateur).</p>
        <textarea
          value={remoteSDPInput}
          onChange={(e) => setRemoteSDPInput(e.target.value)}
          rows={10}
          style={{ width: "100%", fontFamily: "monospace" }}
          placeholder='Colle ici le SDP distant (JSON)'
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={applyOfferAndCreateAnswer}>Appliquer offer + créer answer (récepteur)</button>
          <button onClick={applyAnswer}>Appliquer answer (initiateur)</button>
        </div>
      </section>

      <section>
        <h3>Chat (DataChannel)</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Message"
            />
            <button onClick={() => { sendMessage(msg); setMsg(""); }}>
              Envoyer
            </button>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {messages.map((m, i) => (
              <li key={i}>
                <strong>{m.type === "local" ? "Moi:" : "Remote:"}</strong> {m.text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
