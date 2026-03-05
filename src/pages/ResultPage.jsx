import { Activity, BadgeCheck, Fingerprint, UserRound } from "lucide-react";
import QRCode from "react-qr-code";

export default function ResultPage({ user, onReset }) {
  const dashboardUrl = `https://dynamos-smart-bmi.vercel.app/?userId=${encodeURIComponent(user.id)}`;

  return (
    <div className="page-with-actions result-page">
      <div className="screen-grid">
        <div className="panel panel-large result-panel">
          <div className="result-head">
            <h2><Activity /> Result</h2>
            <span className="result-chip">ANALYSIS COMPLETE</span>
          </div>
          <div className="result-grid">
            {[
              ["Name", user.name || "--", <UserRound />],
              ["User ID", user.id],
              ["Age", user.age ?? "--"],
              ["Sex", user.sex || "--"],
              ["Weight", user.weightKg != null ? `${user.weightKg} kg` : "--"],
              ["Height", user.heightCm != null ? `${user.heightCm} cm` : "--"],
              ["BMI", user.bmi != null ? String(user.bmi) : "--"],
              ["Category", user.category || "--"],
            ].map(([k, v, icon]) => (
              <div className="result-item" key={k}>
                <div className="result-label">{icon}{k}</div>
                <div className={`result-value ${k === "Name" ? "result-value-name" : ""}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel result-message-panel">
          <div className="result-message-head">
            <h3><Fingerprint /> Session</h3>
            <span className="result-message-badge">OK</span>
          </div>
          <div className="result-message-list">
            <div className="result-message-item">
              <span className="result-message-dot"><BadgeCheck /></span>
              <p>Saved</p>
            </div>
            <div className="result-message-item">
              <span className="result-message-dot"><Fingerprint /></span>
              <p>ID: {user.id}</p>
            </div>
            <div className="result-message-item">
              <span className="result-message-dot"><Activity /></span>
              <p>Complete</p>
            </div>
          </div>
          <div className="result-qr-card">
            <div className="result-qr-code">
              <QRCode
                value={dashboardUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#0f224a"
                level="M"
              />
            </div>
            <div className="result-qr-text">
              <strong>Scan this QR Code.</strong>
              <span>Input your ID: {user.id} for your dashboard</span>
            </div>
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-primary result-finish-btn" onClick={onReset}>Finish</button>
      </div>
    </div>
  );
}
