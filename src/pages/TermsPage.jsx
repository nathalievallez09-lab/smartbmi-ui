export default function TermsPage({ agree, setAgree, onBack, onNext }) {
  return (
    <>
      <div className="panel panel-large terms-panel">
        <div className="terms-content">
          <h2>Terms and Conditions</h2>
          <p className="terms-paragraph">
            By proceeding, you acknowledge and consent to the collection and processing of biometric and measurement data
            solely for identity verification, BMI computation, and service record management.
          </p>
          <p className="terms-paragraph terms-paragraph-muted">
            All collected information is handled according to applicable privacy and data protection policies.
          </p>
          <label className="checkbox-row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I have read and agree to the Terms and Conditions and consent to secure data processing.</span>
          </label>
        </div>
      </div>
      <div className="actions terms-actions">
        <button className="btn" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!agree} onClick={onNext}>Next</button>
      </div>
    </>
  );
}
