"use client";

import { get, set, clear, createStore } from "idb-keyval";
import { useEffect, useState } from "react";
import { asset } from "./urls";

const fileStore = createStore("muson-demo-files", "uploads");

export async function saveFile(file: File, video = false) {
  const valid = video
    ? ["video/mp4", "video/webm", "video/quicktime"]
    : ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!valid.includes(file.type))
    throw new Error(
      video
        ? "Choose an MP4, WebM or MOV video."
        : "Choose a PDF, JPG, PNG or WebP file.",
    );
  if (!file.size || file.size > (video ? 50 : 5) * 1024 * 1024)
    throw new Error(
      video
        ? "Use a video smaller than 50 MB for this demo."
        : "Use a document smaller than 5 MB.",
    );
  const key = `muson-file-${crypto.randomUUID()}`;
  try {
    await set(key, file, fileStore);
  } catch {
    throw new Error(
      "Browser storage is unavailable or full. Use the bundled sample instead.",
    );
  }
  return key;
}

export function useFileUrl(key?: string, video = false) {
  const [loaded, setLoaded] = useState<{ key: string; url: string }>({
    key: "",
    url: "",
  });
  useEffect(() => {
    if (!key || key.startsWith("sample")) return;
    let active = true;
    let url = "";
    get<Blob>(key, fileStore)
      .then((blob) => {
        if (!blob || !active) return;
        url = URL.createObjectURL(blob);
        setLoaded({ key, url });
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key]);
  if (key?.startsWith("sample"))
    return asset(video ? "demo/performance.mp4" : "demo/document.pdf");
  return loaded.key === key ? loaded.url : "";
}

export const clearFiles = () => clear(fileStore);
