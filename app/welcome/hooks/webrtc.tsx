import { useEffect, useRef, useState } from "react";


export function useWebRTC() {
  type Message = { type: "remote" | "local"; text: string };
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const [role, setRole] = useState<"initiator" | "receiver" | null>(null);
  const [localSDP, setLocalSDP] = useState("");
  const [remoteSDPInput, setRemoteSDPInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [dcState, setDcState] = useState("closed");
  const [pcState, setPcState] = useState("new");
  const [iceState, setIceState] = useState<"gathering" | "complete" | "idle">("idle");

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [] // offline/LAN; ajouter STUN/TURN si nécessaire hors LAN
    });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => setPcState(pc.connectionState);

    pc.onicegatheringstatechange = () => {
      setIceState(pc.iceGatheringState === "gathering" ? "gathering" : 
                  pc.iceGatheringState === "complete" ? "complete" : "idle");
      
      // Quand tous les candidates sont collectés, mettre à jour le SDP complet
      if (pc.iceGatheringState === "complete" && pc.localDescription) {
        setLocalSDP(JSON.stringify(pc.localDescription));
      }
    };

    // Si on est récepteur, on attend le DataChannel de l'initiateur
    pc.ondatachannel = (event) => {
      dcRef.current = event.channel;
      wireDataChannel(event.channel);
    };

    return () => {
      try { dcRef.current?.close(); } catch {}
      try { pcRef.current?.close(); } catch {}
    };
  }, []);

  const wireDataChannel = (dc: RTCDataChannel) => {
    dc.onopen = () => setDcState("open");
    dc.onclose = () => setDcState("closed");
    dc.onmessage = (event) => {
      setMessages((prev) => [...prev, { type: "remote", text: event.data }]);
    };
  };

  // INITIATEUR: créer l'offer + DataChannel
  const startInitiator = async () => {
    setRole("initiator");
    const pc = pcRef.current;
    if (!pc) return;
    
    const dc = pc.createDataChannel("chat");
    dcRef.current = dc;
    wireDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    // Le SDP complet sera mis à jour via onicegatheringstatechange
    setLocalSDP("⏳ Collecte des ICE candidates en cours...");
  };

  // RÉCEPTEUR: appliquer l'offer, créer l'answer
  const applyOfferAndCreateAnswer = async () => {
    const pc = pcRef.current;
    if (!pc) {
      alert("RTCPeerConnection non initialisé");
      return;
    }
    
    if (!remoteSDPInput.trim()) {
      alert("Colle d'abord l'offer dans le champ SDP distant");
      return;
    }

    try {
      const offerDesc = JSON.parse(remoteSDPInput);
      if (offerDesc.type !== "offer") {
        alert("Le SDP collé n'est pas une offer (type: " + offerDesc.type + ")");
        return;
      }
      
      setRole("receiver");
      await pc.setRemoteDescription(offerDesc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      // Le SDP complet sera mis à jour via onicegatheringstatechange
      setLocalSDP("⏳ Collecte des ICE candidates en cours...");
    } catch (e: any) {
      console.error("Erreur lors de l'application de l'offer:", e);
      alert("Erreur: " + e.message);
    }
  };

  // INITIATEUR: appliquer l'answer reçue
  const applyAnswer = async () => {
    const pc = pcRef.current;
    if (!pc) {
      alert("RTCPeerConnection non initialisé");
      return;
    }
    
    if (!remoteSDPInput.trim()) {
      alert("Colle d'abord l'answer dans le champ SDP distant");
      return;
    }

    try {
      const answerDesc = JSON.parse(remoteSDPInput);
      if (answerDesc.type !== "answer") {
        alert("Le SDP collé n'est pas une answer (type: " + answerDesc.type + ")");
        return;
      }
      
      await pc.setRemoteDescription(answerDesc);
    } catch (e: any) {
      console.error("Erreur lors de l'application de l'answer:", e);
      alert("Erreur: " + e.message);
    }
  };

  const sendMessage = (text: string) => {
    const dc = dcRef.current;
    if (dc?.readyState === "open") {
      dc.send(text);
      setMessages((prev) => [...prev, { type: "local", text }]);
    }
  };

  return {
    // state
    role, pcState, dcState, iceState,
    localSDP,
    messages,
    // inputs
    remoteSDPInput, setRemoteSDPInput,
    // actions
    startInitiator,
    applyOfferAndCreateAnswer,
    applyAnswer,
    sendMessage
  };
}
