import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Heart, Scale } from "lucide-react";
import IntroPage from "./pages/IntroPage";
import RemindersPage from "./pages/RemindersPage";
import TermsPage from "./pages/TermsPage";
import MenuPage from "./pages/MenuPage";
import FullNamePage from "./pages/FullNamePage";
import AgePage from "./pages/AgePage";
import SexPage from "./pages/SexPage";
import CameraPage from "./pages/CameraPage";
import IdentityConfirmPage from "./pages/IdentityConfirmPage";
import MeasurePage from "./pages/MeasurePage";
import SavingPage from "./pages/SavingPage";
import ResultPage from "./pages/ResultPage";

function randomUser() {
  return {
    id: String(Math.floor(10000 + Math.random() * 90000)),
    name: "Guest User",
    age: 24,
    sex: Math.random() > 0.5 ? "Male" : "Female",
    weightKg: null,
    heightCm: null,
    bmi: null,
    category: null,
  };
}

function computeBmi(weightKg, heightCm) {
  const meters = heightCm / 100;
  const bmi = weightKg / (meters * meters);
  let category = "Obese";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  return { bmi: Number(bmi.toFixed(1)), category };
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [user, setUser] = useState(randomUser);
  const [newUserForm, setNewUserForm] = useState({ fullName: "", age: "", sex: "" });
  const [cameraAttempts, setCameraAttempts] = useState(0);
  const [mode, setMode] = useState("registration");
  const [cameraMessage, setCameraMessage] = useState("Align face in frame.");
  const [cameraProgress, setCameraProgress] = useState(0);
  const [cameraPose, setCameraPose] = useState("Align face in frame");
  const [weightStatus, setWeightStatus] = useState("Scale booting...");
  const [heightStatus, setHeightStatus] = useState("Height scan booting...");
  const [saveMessage, setSaveMessage] = useState("Syncing to cloud...");
  const [connection, setConnection] = useState("online");
  const [timerBadge, setTimerBadge] = useState("Session Active");
  const [footerHint, setFooterHint] = useState("Touchscreen enabled");
  const autoTimersRef = useRef([]);

  const clearTimers = () => {
    autoTimersRef.current.forEach(clearTimeout);
    autoTimersRef.current = [];
  };
  const queue = (fn, ms) => {
    const id = setTimeout(fn, ms);
    autoTimersRef.current.push(id);
  };

  const reset = () => {
    clearTimers();
    setScreen("welcome");
    setAgreeTerms(false);
    setUser(randomUser());
    setNewUserForm({ fullName: "", age: "", sex: "" });
    setCameraAttempts(0);
    setCameraProgress(0);
    setCameraPose("Align face in frame");
    setConnection("online");
    setTimerBadge("Session Active");
    setFooterHint("Touchscreen enabled");
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (screen === "welcome") setFooterHint("Tap Start");
    if (screen === "reminders") setFooterHint("Quick prep");
    if (screen === "terms") setFooterHint("Consent needed");
    if (screen === "menu") setFooterHint("Choose mode");
    if (screen === "full-name") setFooterHint("Enter name");
    if (screen === "age") setFooterHint("Enter age");
    if (screen === "sex") setFooterHint("Choose profile");
    if (screen === "identity-confirm") setFooterHint("Confirm profile");
  }, [screen]);

  useEffect(() => {
    if (screen !== "registration" && screen !== "identification") return;
    clearTimers();
    setFooterHint(screen === "registration" ? "Registering face" : "Identifying face");
    if (screen === "registration") {
      setCameraProgress(8);
      setCameraPose("Look straight");
      setCameraMessage("Face centered.");
      queue(() => { setCameraPose("Look left"); setCameraProgress(24); setCameraMessage("Turn left."); }, 900);
      queue(() => { setCameraPose("Look right"); setCameraProgress(42); setCameraMessage("Turn right."); }, 1800);
      queue(() => { setCameraPose("Look up"); setCameraProgress(62); setCameraMessage("Look up."); }, 2700);
      queue(() => { setCameraPose("Look down"); setCameraProgress(80); setCameraMessage("Look down."); }, 3600);
      queue(() => {
        setCameraPose("Hold still");
        setCameraProgress(100);
        setCameraMessage("Face saved.");
        queue(() => setScreen("weight"), 10000);
      }, 4600);
      return clearTimers;
    }

    setCameraProgress(10);
    setCameraPose("Hold still");
    setCameraMessage("Face centered.");
    queue(() => { setCameraProgress(35); setCameraMessage("Scanning landmarks..."); }, 900);
    queue(() => { setCameraProgress(68); setCameraMessage("Matching profile..."); }, 1800);
    queue(() => {
      const fail = Math.random() < 0.35;
      setCameraProgress(100);
      if (!fail) {
        setCameraMessage("Match found.");
        setCameraAttempts(0);
        queue(() => setScreen("identity-confirm"), 10000);
        return;
      }
      setCameraAttempts((prev) => {
        const next = prev + 1;
        setCameraMessage("No match. Register new user.");
        if (next >= 3) queue(() => { setScreen("menu"); setCameraAttempts(0); }, 1200);
        else queue(() => setScreen("identification"), 1200);
        return next;
      });
    }, 3000);
    return clearTimers;
  }, [screen]);

  useEffect(() => {
    if (screen !== "weight") return;
    clearTimers();
    setFooterHint("Scale sensor active");
    setWeightStatus("Calibrating...");
    queue(() => setWeightStatus("Step onto platform."), 900);
    queue(() => setWeightStatus("Measuring weight..."), 1800);
    queue(() => setWeightStatus("Hold still."), 3000);
    queue(() => {
      if (Math.random() < 0.08) {
        setWeightStatus("Scale error. Returning to menu.");
        queue(() => setScreen("menu"), 1200);
        return;
      }
      const weightKg = Number((58 + Math.random() * 20).toFixed(1));
      setUser((u) => ({ ...u, weightKg }));
      setWeightStatus("Weight captured.");
      queue(() => setScreen("height"), 10000);
    }, 4200);
    return clearTimers;
  }, [screen]);

  useEffect(() => {
    if (screen !== "height") return;
    clearTimers();
    setFooterHint("Height sensor active");
    setHeightStatus("Calibrating...");
    queue(() => setHeightStatus("Stand under sensor."), 1000);
    queue(() => setHeightStatus("Hold still."), 2200);
    queue(() => {
      if (Math.random() < 0.08) {
        setHeightStatus("Height sensor error. Returning to menu.");
        queue(() => setScreen("menu"), 1200);
        return;
      }
      const heightCm = 160 + Math.floor(Math.random() * 20);
      setUser((u) => {
        const next = { ...u, heightCm };
        const bmiData = computeBmi(next.weightKg, heightCm);
        return { ...next, ...bmiData };
      });
      setHeightStatus("Height captured.");
      queue(() => setScreen("saving"), 10000);
    }, 3600);
    return clearTimers;
  }, [screen]);

  useEffect(() => {
    if (screen !== "saving") return;
    clearTimers();
    setFooterHint("Saving record");
    const roll = Math.random();
    if (roll < 0.15) {
      setConnection("offline");
      setSaveMessage("Offline. Saved locally.");
    } else if (roll < 0.4) {
      setConnection("online");
      setSaveMessage("Local save. Upload queued.");
    } else {
      setConnection("online");
      setSaveMessage("Cloud save complete.");
    }
    queue(() => setScreen("result"), 1400);
    return clearTimers;
  }, [screen]);

  useEffect(() => {
    if (screen !== "result") return;
    setFooterHint("Session complete");
    setTimerBadge("Auto reset in 2 mins");
    const id1 = setTimeout(() => setFooterHint("Auto reset in 2 mins"), 5000);
    const id2 = setTimeout(() => {
      setTimerBadge("Resetting");
      reset();
    }, 120000);
    return () => { clearTimeout(id1); clearTimeout(id2); };
  }, [screen]);

  const page = useMemo(() => {
    if (screen === "welcome") return <IntroPage onStart={() => setScreen("reminders")} />;
    if (screen === "reminders") return <RemindersPage onNext={() => setScreen("terms")} />;
    if (screen === "terms") return <TermsPage agree={agreeTerms} setAgree={setAgreeTerms} onBack={() => setScreen("reminders")} onNext={() => setScreen("menu")} />;

    if (screen === "menu") return <MenuPage onNewUser={() => { setNewUserForm({ fullName: "", age: "", sex: "" }); setScreen("full-name"); }} onExistingUser={() => { setUser((u) => ({ ...u, name: "Nathalie Vallez", age: 21, sex: "Female" })); setMode("identify"); setScreen("identification"); }} />;
    if (screen === "full-name") return <FullNamePage value={newUserForm.fullName} onChange={(v) => setNewUserForm((f) => ({ ...f, fullName: v }))} onBack={() => setScreen("menu")} onNext={() => setScreen("age")} />;
    if (screen === "age") return <AgePage value={newUserForm.age} onChange={(v) => setNewUserForm((f) => ({ ...f, age: v }))} onBack={() => setScreen("full-name")} onNext={() => setScreen("sex")} />;
    if (screen === "sex") return <SexPage sex={newUserForm.sex} setSex={(v) => setNewUserForm((f) => ({ ...f, sex: v }))} onBack={() => setScreen("age")} onNext={() => { setUser((u) => ({ ...u, name: newUserForm.fullName, age: Number(newUserForm.age), sex: newUserForm.sex })); setMode("registration"); setScreen("registration"); }} />;
    if (screen === "registration") return <CameraPage mode="registration" title="Facial Registration" pose={cameraPose} progress={cameraProgress} message={cameraMessage} onCancel={() => setScreen("menu")} onNext={() => setScreen("weight")} />;
    if (screen === "identification") return <CameraPage mode="identification" title="Facial Identification" pose={cameraPose} progress={cameraProgress} message={cameraMessage} onCancel={() => setScreen("menu")} onNext={() => setScreen("identity-confirm")} />;
    if (screen === "identity-confirm") return <IdentityConfirmPage user={user} onYes={() => setScreen("weight")} onNo={() => setScreen("menu")} />;
    if (screen === "weight") return <MeasurePage title="Weight Measurement" status={weightStatus} label="Weight" loading={user.weightKg == null} value={user.weightKg ? `${user.weightKg} kg` : "--.- kg"} onNext={() => setScreen("height")} nextLabel="Next" />;
    if (screen === "height") return <MeasurePage title="Height Measurement" status={heightStatus} label="Height" loading={user.heightCm == null} value={user.heightCm ? `${user.heightCm} cm` : "--- cm"} onNext={() => setScreen("saving")} nextLabel="Next" />;
    if (screen === "saving") return <SavingPage message={saveMessage} />;
    if (screen === "result") return <ResultPage user={user} onReset={reset} />;
    return <MenuPage onNewUser={() => setScreen("full-name")} onExistingUser={() => setScreen("identification")} />;
  }, [screen, agreeTerms, newUserForm, user, cameraMessage, cameraPose, cameraProgress, weightStatus, heightStatus, saveMessage]);

  return (
    <>
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-a" />
        <div className="ambient-orb orb-b" />
      </div>
      <main className="kiosk-shell tech-surface">
        <section className="tablet-frame">
          <header className="topbar">
            <div className="brand">
              <span className="brand-logo" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="28" height="28">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(167,235,242,.35)" strokeWidth="2" />
                  <path d="M10 25h8l3-8 5 15 4-11h8" fill="none" stroke="#a7ebf2" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h1>Smart BMI System</h1>
            </div>
            <div className="status-row">
              <span className={`badge ${connection === "online" ? "badge-online" : "badge-offline"}`}>{connection === "online" ? "Online" : "Offline"}</span>
              <span className="badge">{timerBadge}</span>
            </div>
          </header>
          <section className="screen">
            <div className="intro-animated-bg" aria-hidden="true">
              <div className="intro-gradient" />
              <div className="intro-orb intro-orb-a" />
              <div className="intro-orb intro-orb-b" />
              <div className="intro-orb intro-orb-c" />
              <motion.div
                className="intro-float intro-float-heart"
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="intro-icon" />
              </motion.div>
              <motion.div
                className="intro-float intro-float-activity"
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Activity className="intro-icon" />
              </motion.div>
              <motion.div
                className="intro-float intro-float-scale"
                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <Scale className="intro-icon" />
              </motion.div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                className={`page-wrap ${
                  screen === "welcome" || screen === "reminders" || screen === "saving"
                    ? "page-wrap-centered"
                    : ""
                } ${
                  screen === "registration" || screen === "identification" || screen === "result"
                    ? "page-wrap-fit"
                    : ""
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {page}
              </motion.div>
            </AnimatePresence>
          </section>
        </section>
      </main>
    </>
  );
}
