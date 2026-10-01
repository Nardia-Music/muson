"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Notice } from "./ui";

export function CameraPreview() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stream.current?.getTracks().forEach(track => track.stop());
    };
  }, []);
  const stop = () => {
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setEnabled(false);
  };
  return <section className="camera-check">
    <h3>Camera preview</h3>
    <video ref={video} className="camera-preview" autoPlay muted playsInline aria-label="Live camera preview" hidden={!enabled} />
    {!enabled && <div className="camera-placeholder"><Camera size={28} /><span>Camera off</span></div>}
    <p>Optional live preview. Nothing is recorded, saved or uploaded.</p>
    <button className="button secondary small" disabled={pending} onClick={async () => {
      if (enabled) { stop(); return; }
      setPending(true);
      setError("");
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (!mounted.current) { media.getTracks().forEach(track => track.stop()); return; }
        stream.current = media;
        if (video.current) { video.current.srcObject = media; await video.current.play(); }
        setEnabled(true);
      } catch {
        if (mounted.current) { stop(); setError("Camera unavailable or permission declined. You can continue with the supervised demonstration."); }
      } finally { if (mounted.current) setPending(false); }
    }}>{enabled ? <CameraOff size={16} /> : <Camera size={16} />}{pending ? "Opening camera..." : enabled ? "Turn camera off" : "Enable camera preview"}</button>
    {error && <Notice tone="warning">{error}</Notice>}
  </section>;
}