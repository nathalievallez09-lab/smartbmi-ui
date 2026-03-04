import { useEffect, useRef, useState } from "react";

export default function CameraPage({ mode, title, pose, progress, message, onCancel, onNext }) {
  const videoRef = useRef(null);
  const [cameraState, setCameraState] = useState("initializing");
  const [cameraError, setCameraError] = useState("");
  const poseKey = String(pose || "").toLowerCase();
  const poseDirection = poseKey.includes("left")
    ? "left"
    : poseKey.includes("right")
      ? "right"
      : poseKey.includes("up")
        ? "up"
        : poseKey.includes("down")
          ? "down"
          : "center";
  const msg = String(message || "").toLowerCase();
  const isDone = progress >= 100 && (
    msg.includes("saved")
    || msg.includes("match found")
    || msg.includes("face saved")
    || msg.includes("recognized")
  );
  const isIssue = (
    msg.includes("no match")
    || msg.includes("error")
    || msg.includes("denied")
    || msg.includes("not recognized")
    || msg.includes("register")
  );
  const instructionClass = isDone ? "instruction-done" : "instruction-alert";
  const instructionLabel = isDone ? "DONE" : (isIssue ? "INCOMPLETE / NOT REGISTERED" : "INCOMPLETE");

  useEffect(() => {
    let stream;
    async function startCamera() {
      setCameraError("");
      setCameraState("initializing");
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("unsupported");
        setCameraError("Camera API is not supported in this browser.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraState("ready");
          setCameraError("");
        }
      } catch {
        setCameraState("denied");
        setCameraError("Camera access denied. Allow camera permission to continue.");
      }
    }

    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="page-with-actions camera-page">
      <div className="screen-grid single-col">
        <div className="panel panel-large camera-view">
          <h2>{title}</h2>
          <div className="camera-layout">
            <div className="camera-visual-card">
              <div className="camera-box">
                <div className="camera-shade" aria-hidden="true" />
                <div className="camera-target">
                  <div className="camera-lens-wrap">
                    <div className="camera-lens">
                      <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                    </div>
                  </div>
                  <div className="face-ring" />
                  <div className={`face-layout ${mode === "identification" ? "face-layout-identify" : "face-layout-register"}`} aria-hidden="true">
                    <svg viewBox="0 0 220 220" className="face-layout-svg">
                      <ellipse cx="110" cy="110" rx="62" ry="76" className="face-layout-line" />
                      <ellipse cx="86" cy="102" rx="8" ry="6" className="face-layout-line" />
                      <ellipse cx="134" cy="102" rx="8" ry="6" className="face-layout-line" />
                      <path d="M110 110v24" className="face-layout-line" />
                      <path d="M90 144c10 8 30 8 40 0" className="face-layout-line" />
                    </svg>
                  </div>
                  <div className="face-crosshair" />
                  <div className="face-corners" aria-hidden="true">
                    <span className="corner corner-tl" />
                    <span className="corner corner-tr" />
                    <span className="corner corner-bl" />
                    <span className="corner corner-br" />
                  </div>
                </div>
                <div className="camera-status">{cameraState === "ready" ? "Live Camera" : "Camera Preview"}</div>
                {cameraState !== "ready" && cameraError && <p className="camera-error">{cameraError}</p>}
              </div>
              <div className="camera-progress-wrap camera-progress-below">
                <div className="camera-progress-head">
                  <span>Progress</span>
                  <strong>{Math.round(progress)}%</strong>
                </div>
                <div className="camera-progress-track">
                  <div className="camera-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="camera-info-card">
              <div className="camera-status-minimal">
                <div className={`instruction-pill ${instructionClass}`}>{instructionLabel}</div>
                <div className="camera-instruction">
                  <div className="camera-instruction-glow" aria-hidden="true" />
                  <div className="camera-motion-badge" aria-hidden="true">
                    <span className="motion-dot" />
                    <span className="motion-ring ring-a" />
                    <span className="motion-ring ring-b" />
                  </div>
                  <div className="camera-pose">{pose}</div>
                  <div
                    className={`pose-direction-cue pose-${poseDirection}`}
                    role="img"
                    aria-label={`Direction ${poseDirection}`}
                  >
                    <span className={`pose-icon pose-icon-${poseDirection}`} />
                  </div>
                  <p className="camera-message">{message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="actions camera-actions">
        <button className="btn camera-cancel-btn" onClick={onCancel}>Cancel</button>
        {isDone && typeof onNext === "function" && (
          <button className="btn btn-primary camera-next-btn" onClick={onNext}>Next</button>
        )}
      </div>
    </div>
  );
}

