import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../config.ts";

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { eyebrow, heading, photo, initials, bio, meta } = CONFIG.about;

  return (
    <div
      className={"overlay" + (open ? " open" : "")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aboutTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="about-panel">
        <button className="about-close" ref={closeRef} aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className="about-photo">
          {photoOk ? (
            <img src={photo} alt={heading} onError={() => setPhotoOk(false)} />
          ) : (
            <span className="initials">{initials}</span>
          )}
        </div>
        <div className="about-body">
          <div className="about-eyebrow">{eyebrow}</div>
          <h2 id="aboutTitle">{heading}</h2>
          {bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="about-meta">{meta}</div>
        </div>
      </div>
    </div>
  );
}
