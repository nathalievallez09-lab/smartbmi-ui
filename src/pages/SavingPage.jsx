import { CloudUpload, DatabaseZap } from "lucide-react";
import { motion } from "framer-motion";

export default function SavingPage({ message }) {
  return (
    <div className="saving-stage">
      <div className="panel center saving-panel">
        <h2 className="saving-title"><DatabaseZap /> Syncing</h2>
        <motion.div
          className="saving-orbital"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <span className="saving-ring" />
          <span className="saving-ring saving-ring-2" />
          <CloudUpload className="saving-cloud" />
        </motion.div>
        <p className="lead saving-message">{message}</p>
      </div>
    </div>
  );
}
