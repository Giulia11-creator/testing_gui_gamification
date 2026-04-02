import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function addUser(collectionName, uid, options = {}) {
  const userRef = doc(db, collectionName, uid);

  await setDoc(
    userRef,
    {
      id: uid,
      nick: options.email ?? "",
      score: Number(options.score ?? 0),
      time: options.time ?? "",
      seconds: options.seconds ?? "",
      Totalclicks: Number(options.Totalclicks ?? 0),
      lastUpdate: serverTimestamp(),

      // 👇 scrive solo i bug che passi
      ...options.bugs,
    },
    { merge: true }
  );

  console.log(`✅ Utente aggiornato in ${collectionName}`);
}