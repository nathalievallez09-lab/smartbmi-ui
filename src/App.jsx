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
import { readHeightCm, readWeightKg } from "./services/sensors";
import { saveMeasurement, upsertUserProfile } from "./services/firestore";

function randomUser() {
  return {
    id: String(Math.floor(10000 + Math.random() * 90000)),
    name: "",
    age: null,
    sex: "",
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
  const RETURN_TO_MENU_SECONDS = 10;
  const [screen, setScreen] = useState("welcome");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [user, setUser] = useState(randomUser);
  const [newUserForm, setNewUserForm] = useState({ fullName: "", age: "", sex: "" });
  const [cameraAttempts, setCameraAttempts] = useState(0);
  const [mode, setMode] = useState("registration");
  const [cameraMessage, setCameraMessage] = useState("Align face in frame.");
  const [cameraProgress, setCameraProgress] = useState(0);
  const [cameraPose, setCameraPose] = useState("Align face in frame");
  const [cameraReturnMessage, setCameraReturnMessage] = useState("");
  const [weightStatus, setWeightStatus] = useState("Scale booting...");
  const [weightStatusType, setWeightStatusType] = useState("incomplete");
  const [weightStatusLabel, setWeightStatusLabel] = useState("INCOMPLETE");
  const [weightReturnMessage, setWeightReturnMessage] = useState("");
  const [heightStatus, setHeightStatus] = useState("Height scan booting...");
  const [heightStatusType, setHeightStatusType] = useState("incomplete");
  const [heightStatusLabel, setHeightStatusLabel] = useState("INCOMPLETE");
  const [heightReturnMessage, setHeightReturnMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("Syncing to cloud...");
  const [connection, setConnection] = useState("online");
  const [timerBadge, setTimerBadge] = useState("Session Active");
  const [footerHint, setFooterHint] = useState("Touchscreen enabled");
  const autoTimersRef = useRef([]);
  const weightRequestAbortRef = useRef(null);
  const heightRequestAbortRef = useRef(null);

  const clearTimers = () => {
    autoTimersRef.current.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    autoTimersRef.current = [];
  };
  const queue = (fn, ms) => {
    const id = setTimeout(fn, ms);
    autoTimersRef.current.push(id);
  };

  const startReturnToMenuCountdown = (kind) => {
    let seconds = RETURN_TO_MENU_SECONDS;
    const setMessage = (remaining) => {
      const text = `Returning to menu in ${remaining} seconds`;
      if (kind === "Weight") setWeightReturnMessage(text);
      else setHeightReturnMessage(text);
    };

    setMessage(seconds);
    const intervalId = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(intervalId);
        setScreen("menu");
        return;
      }
      setMessage(seconds);
    }, 1000);
    autoTimersRef.current.push(intervalId);
  };

  const startCameraReturnToMenuCountdown = () => {
    let seconds = RETURN_TO_MENU_SECONDS;
    setCameraReturnMessage(`Returning to menu in ${seconds} seconds`);
    const intervalId = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(intervalId);
        setCameraAttempts(0);
        setScreen("menu");
        return;
      }
      setCameraReturnMessage(`Returning to menu in ${seconds} seconds`);
    }, 1000);
    autoTimersRef.current.push(intervalId);
  };

  const getSensorErrorTag = (error) => {
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("timed out")) return "TIMEOUT";
    if (msg.includes("connect")) return "CONNECTION";
    if (msg.includes("http")) return "SENSOR API";
    return "SENSOR";
  };

  const reset = () => {
    clearTimers();
    weightRequestAbortRef.current?.abort();
    heightRequestAbortRef.current?.abort();
    weightRequestAbortRef.current = null;
    heightRequestAbortRef.current = null;
    setScreen("welcome");
    setAgreeTerms(false);
    setUser(randomUser());
    setNewUserForm({ fullName: "", age: "", sex: "" });
    setCameraAttempts(0);
    setCameraProgress(0);
    setCameraPose("Align face in frame");
    setCameraReturnMessage("");
    setWeightStatusType("incomplete");
    setWeightStatusLabel("INCOMPLETE");
    setWeightReturnMessage("");
    setHeightStatusType("incomplete");
    setHeightStatusLabel("INCOMPLETE");
    setHeightReturnMessage("");
    setConnection("online");
    setTimerBadge("Session Active");
    setFooterHint("Touchscreen enabled");
  };

  useEffect(() => () => {
    clearTimers();
    weightRequestAbortRef.current?.abort();
    heightRequestAbortRef.current?.abort();
  }, []);

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
    setCameraReturnMessage("");
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
      setCameraProgress(100);
      setCameraAttempts((prev) => prev + 1);
      setCameraMessage("No match. Register new user.");
      startCameraReturnToMenuCountdown();
    }, 3000);
    return clearTimers;
  }, [screen]);

  useEffect(() => {
    if (screen !== "weight") return;
    clearTimers();
    setFooterHint("Scale sensor active");
    setUser((u) => ({ ...u, weightKg: null }));
    setWeightStatusType("incomplete");
    setWeightStatusLabel("INCOMPLETE");
    setWeightReturnMessage("");
    setWeightStatus("Calibrating...");
    queue(() => setWeightStatus("Step onto platform."), 700);
    queue(() => setWeightStatus("Requesting load cell reading..."), 1400);
    queue(() => setWeightStatus("Measuring weight..."), 2100);

    const controller = new AbortController();
    weightRequestAbortRef.current = controller;

    queue(async () => {
      try {
        const weightKg = await readWeightKg(controller.signal);
        if (controller.signal.aborted) return;
        setConnection("online");
        setUser((u) => ({ ...u, weightKg }));
        setWeightStatusType("done");
        setWeightStatusLabel("DONE");
        setWeightStatus("Weight captured.");
        queue(() => setScreen("height"), 10000);
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnection("offline");
        setWeightStatusType("error");
        setWeightStatusLabel(`INCOMPLETE | ${getSensorErrorTag(error)}`);
        setWeightStatus("Weight measurement failed.");
        startReturnToMenuCountdown("Weight");
      }
    }, 2300);

    return () => {
      clearTimers();
      controller.abort();
      if (weightRequestAbortRef.current === controller) {
        weightRequestAbortRef.current = null;
      }
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "height") return;
    clearTimers();
    setFooterHint("Height sensor active");
    setUser((u) => ({ ...u, heightCm: null }));
    setHeightStatusType("incomplete");
    setHeightStatusLabel("INCOMPLETE");
    setHeightReturnMessage("");
    setHeightStatus("Calibrating...");
    queue(() => setHeightStatus("Stand under sensor."), 700);
    queue(() => setHeightStatus("Requesting ToF reading..."), 1400);
    queue(() => setHeightStatus("Hold still."), 2100);

    const controller = new AbortController();
    heightRequestAbortRef.current = controller;

    queue(async () => {
      try {
        const heightCm = await readHeightCm(controller.signal);
        if (controller.signal.aborted) return;
        setConnection("online");
        setUser((u) => {
          const next = { ...u, heightCm };
          const bmiData = computeBmi(next.weightKg, heightCm);
          return { ...next, ...bmiData };
        });
        setHeightStatusType("done");
        setHeightStatusLabel("DONE");
        setHeightStatus("Height captured.");
        queue(() => setScreen("saving"), 10000);
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnection("offline");
        setHeightStatusType("error");
        setHeightStatusLabel(`INCOMPLETE | ${getSensorErrorTag(error)}`);
        setHeightStatus("Height measurement failed.");
        startReturnToMenuCountdown("Height");
      }
    }, 2300);

    return () => {
      clearTimers();
      controller.abort();
      if (heightRequestAbortRef.current === controller) {
        heightRequestAbortRef.current = null;
      }
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "saving") return;
    clearTimers();
    setFooterHint("Saving record");
    setSaveMessage("Saving to Firebase...");

    let cancelled = false;
    (async () => {
      try {
        await upsertUserProfile(user);
        await saveMeasurement(user);
        if (cancelled) return;
        setConnection("online");
        setSaveMessage("Cloud save complete.");
      } catch {
        if (cancelled) return;
        setConnection("offline");
        setSaveMessage("Save failed (offline/permission). Showing result only.");
      } finally {
        if (!cancelled) queue(() => setScreen("result"), 1400);
      }
    })();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [screen, user]);

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

    if (screen === "menu") return <MenuPage onNewUser={() => { setNewUserForm({ fullName: "", age: "", sex: "" }); setScreen("full-name"); }} onExistingUser={() => { setMode("identify"); setScreen("identification"); }} />;
    if (screen === "full-name") return <FullNamePage value={newUserForm.fullName} onChange={(v) => setNewUserForm((f) => ({ ...f, fullName: v }))} onBack={() => setScreen("menu")} onNext={() => setScreen("age")} />;
    if (screen === "age") return <AgePage value={newUserForm.age} onChange={(v) => setNewUserForm((f) => ({ ...f, age: v }))} onBack={() => setScreen("full-name")} onNext={() => setScreen("sex")} />;
    if (screen === "sex") return <SexPage sex={newUserForm.sex} setSex={(v) => setNewUserForm((f) => ({ ...f, sex: v }))} onBack={() => setScreen("age")} onNext={() => { setUser((u) => ({ ...u, name: newUserForm.fullName, age: Number(newUserForm.age), sex: newUserForm.sex })); setMode("registration"); setScreen("registration"); }} />;
    if (screen === "registration") return <CameraPage mode="registration" title="Facial Registration" pose={cameraPose} progress={cameraProgress} message={cameraMessage} returnMessage={cameraReturnMessage} onCancel={() => setScreen("menu")} onNext={() => setScreen("weight")} />;
    if (screen === "identification") return <CameraPage mode="identification" title="Facial Identification" pose={cameraPose} progress={cameraProgress} message={cameraMessage} returnMessage={cameraReturnMessage} onCancel={() => setScreen("menu")} onNext={() => setScreen("identity-confirm")} />;
    if (screen === "identity-confirm") return <IdentityConfirmPage user={user} onYes={() => setScreen("weight")} onNo={() => setScreen("menu")} />;
    if (screen === "weight") return <MeasurePage title="Weight Measurement" status={weightStatus} statusType={weightStatusType} statusLabel={weightStatusLabel} returnMessage={weightReturnMessage} label="Weight" loading={user.weightKg == null} value={user.weightKg ? `${user.weightKg} kg` : "--.- kg"} onBackToMenu={() => setScreen("menu")} onNext={() => setScreen("height")} nextLabel="Next" />;
    if (screen === "height") return <MeasurePage title="Height Measurement" status={heightStatus} statusType={heightStatusType} statusLabel={heightStatusLabel} returnMessage={heightReturnMessage} label="Height" loading={user.heightCm == null} value={user.heightCm ? `${user.heightCm} cm` : "--- cm"} onBackToMenu={() => setScreen("menu")} onNext={() => setScreen("saving")} nextLabel="Next" />;
    if (screen === "saving") return <SavingPage message={saveMessage} />;
    if (screen === "result") return <ResultPage user={user} onReset={reset} />;
    return <MenuPage onNewUser={() => setScreen("full-name")} onExistingUser={() => setScreen("identification")} />;
  }, [screen, agreeTerms, newUserForm, user, cameraMessage, cameraPose, cameraProgress, cameraReturnMessage, weightStatus, weightStatusType, weightStatusLabel, weightReturnMessage, heightStatus, heightStatusType, heightStatusLabel, heightReturnMessage, saveMessage]);

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
                  screen === "welcome" || screen === "reminders" || screen === "saving" || screen === "terms" || screen === "result"
                    ? "page-wrap-centered"
                    : ""
                } ${
                  screen === "registration" || screen === "identification"
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
