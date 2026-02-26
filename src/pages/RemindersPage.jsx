import { Footprints, PersonStanding, ScanFace, ShieldCheck } from "lucide-react";

export default function RemindersPage({ onNext }) {
  return (
    <div className="reminders-page reminders-page-minimal">
      <div className="screen-grid reminders-grid">
        <div className="panel reminder-panel-modern">
          <h3>Guidelines</h3>
          <div className="reminder-list">
            <div className="reminder-item">
              <ScanFace className="reminder-icon" />
              <p>Face camera</p>
            </div>
            <div className="reminder-item">
              <PersonStanding className="reminder-icon" />
              <p>Stand straight</p>
            </div>
            <div className="reminder-item">
              <Footprints className="reminder-icon" />
              <p>Stay still</p>
            </div>
          </div>
          <div className="notice reminder-note">
            <ShieldCheck className="reminder-note-icon" />
            Dry feet only
          </div>
        </div>
        <div className="panel reminder-panel-modern reminder-restrictions-panel">
          <h3>Reminders</h3>
          <div className="icon-grid icon-grid-images">
            {[
              ["remove-shoes.svg", "No Shoes"],
              ["remove-cap.svg", "No Cap"],
              ["remove-glasses.svg", "No Glasses"],
              ["remove-mask.svg", "No Mask"],
              ["remove-backpack.svg", "No Bag"],
              ["remove-heavy.svg", "No Heavy Item"],
            ].map(([src, label]) => (
              <div className="restriction-card" key={src}>
                <img src={`/restrictions/${src}`} alt={label} />
                <span className="icon-tag">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="actions reminders-actions">
        <button className="btn btn-primary btn-xl" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}
