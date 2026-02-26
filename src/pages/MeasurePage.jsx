import { Ruler, ScanLine, Weight } from "lucide-react";
import { motion } from "framer-motion";

export default function MeasurePage({ title, status, label, value, loading, onNext, nextLabel = "Next" }) {
  const isWeight = label.toLowerCase().includes("weight");
  const icon = isWeight ? <Weight /> : <Ruler />;
  const chipText = status;

  return (
    <div className="page-with-actions measure-page">
      <div className="screen-grid single-col">
        <div className="panel panel-large measure-panel">
          <div className="measure-head">
            <h2 className="measure-title">{icon}{title}</h2>
            <span className="measure-chip">{chipText}</span>
          </div>

          <div className={`measure-visual-stage ${isWeight ? "visual-weight" : "visual-height"}`}>
            {isWeight ? (
              <div className="weight-visual">
                <motion.div
                  className="weight-glow"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="weight-platform"
                  animate={{ y: [0, -4, 0], rotateX: [16, 12, 16] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="weight-shadow" />
              </div>
            ) : (
              <div className="height-visual">
                <div className="height-ruler" />
                <motion.div
                  className="height-scan-beam"
                  animate={{ y: [-68, 68] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <div className="height-ticks" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => <span key={i} />)}
                </div>
              </div>
            )}
          </div>

          <div className="meter-wrap measure-meter">
            <div className="measure-metric">
              <span className="meter-label">{label}</span>
              <span className="measure-sub">Auto</span>
            </div>
            <motion.strong
              animate={{ scale: loading ? [1, 1.05, 1] : [1, 1.02, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            >
              {value}
            </motion.strong>
          </div>
          <div className="measure-signal">
            <span><ScanLine /> Signal</span>
            <div className="measure-signal-bars" aria-hidden="true">
              <i className="bar bar-a" />
              <i className="bar bar-b" />
              <i className="bar bar-c" />
              <i className="bar bar-d" />
            </div>
          </div>
        </div>
      </div>

      {!loading && typeof onNext === "function" && (
        <div className="actions measure-actions">
          <button className="btn btn-primary measure-next-btn" onClick={onNext}>{nextLabel}</button>
        </div>
      )}
    </div>
  );
}
