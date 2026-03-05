import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function assertUser(user) {
  if (!user || !user.id) {
    throw new Error("Missing user ID");
  }
}

export async function upsertUserProfile(user) {
  assertUser(user);
  const userRef = doc(db, "users", String(user.id));
  await setDoc(
    userRef,
    {
      fullName: user.name ?? "",
      age: Number(user.age) || null,
      sex: user.sex ?? "",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveMeasurement(user) {
  assertUser(user);
  const measurementsRef = collection(db, "users", String(user.id), "measurements");
  await addDoc(measurementsRef, {
    weightKg: Number(user.weightKg) || null,
    heightCm: Number(user.heightCm) || null,
    bmi: Number(user.bmi) || null,
    category: user.category ?? "",
    capturedAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId) {
  const userRef = doc(db, "users", String(userId));
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: String(userId),
    name: data.fullName ?? "",
    age: data.age ?? null,
    sex: data.sex ?? "",
  };
}
