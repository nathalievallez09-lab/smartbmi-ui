export default function FullNamePage({ value, onChange, onBack, onNext }) {
  const valid = value.trim().length > 0;
  return (
    <div className="name-stage">
      <div className="name-glow name-glow-a" aria-hidden="true" />
      <div className="name-glow name-glow-b" aria-hidden="true" />
      <div className="panel panel-large center-page input-step-panel">
        <h2 className="entry-title">Identity Name</h2>
        <input className="kiosk-input kiosk-input-wide name-input" type="text" placeholder="Full Name" value={value} onChange={(e) => onChange(e.target.value)} />
        {!valid && <p className="message-danger name-error">Required</p>}
      </div>
      <div className="actions name-actions">
        <button className="btn" onClick={onBack}>Back</button>
        <button className="btn btn-primary btn-xl name-next-btn" disabled={!valid} onClick={onNext}>Next</button>
      </div>
    </div>
  );
}
