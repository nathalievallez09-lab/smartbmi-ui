import { Heart, X } from "lucide-react";

export default function IntroPage({ onStart }) {
  return (
    <>
      <button
        type="button"
        aria-label="Admin exit"
        title="Admin exit"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 26,
          height: 26,
          borderRadius: 999,
          border: "1px solid rgba(38,101,140,0.3)",
          background: "rgba(255,255,255,0.68)",
          color: "#244f72",
          display: "grid",
          placeItems: "center",
          zIndex: 40,
          cursor: "pointer",
        }}
      >
        <X size={14} />
      </button>
      <div className="panel panel-large center-page clean-start intro-page-panel intro-hero-panel">
        <div className="intro-content">
          <div className="inline-flex items-center gap-2 tech-chip px-4 py-2 rounded-full mb-6">
            <Heart className="w-6 h-5 text-[#26658c] chip-heart" />
            <span className="text-[#26658c] font-medium chip-label">  Automated Health Monitoring</span>
          </div>
          <h2 className="intro-title">Know Your Body,<br />Know Your Health</h2>
          <p className="touch-text">Touch the screen to begin</p>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-primary btn-xl" onClick={onStart}>Start</button>
      </div>
    </>
  );
}
