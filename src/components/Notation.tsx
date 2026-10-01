"use client";

import { useEffect, useRef } from "react";
import { Formatter, Renderer, Stave, StaveNote } from "vexflow";

export function Notation() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    element.replaceChildren();
    const renderer = new Renderer(element, Renderer.Backends.SVG);
    renderer.resize(320, 140);
    const context = renderer.getContext();
    const stave = new Stave(12, 20, 290).addClef("alto");
    stave.setContext(context).draw();
    const notes = [new StaveNote({ clef: "alto", keys: ["e/4", "c/5"], duration: "w" })];
    Formatter.FormatAndDraw(context, stave, notes);
    return () => element.replaceChildren();
  }, []);
  return <div ref={container} className="notation engraved-notation" role="img" aria-label="Alto clef: E4 and C5, with no key signature or accidentals" />;
}