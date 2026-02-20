import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🔹 Crea o aggiorna un utente in una collezione Firestore.
 * @param {string} collectionName - Nome della collezione (es. "TravelLevel").
 * @param {string} uid - UID dell'utente.
 * @param {object} options - Dati aggiuntivi (es. { score, email }).
 */
export async function addUser(collectionName, uid, options = {}) {
  const userRef = doc(db, collectionName, uid);

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      await setDoc(
        userRef,
        {
          percentage: Number(options.score ?? 0),
          lastUpdate: serverTimestamp(),
          time: options.time ?? "",
          Totalclicks: Number(options.Totalclicks ?? 0),
          bugLetter: !!options.bugLetter,
          bugDecimal: !!options.bugDecimal,
          bugEmpty: !!options.bugEmpty,
          bugToInfinity: !!options.bugToInfinity,
          bugSymbols: !!options.bugSymbols,
          bugWrongDate: !!options.bugWrongDate,
          bugEmptyColoumn: !!options.bugEmptyColoumn,
          bugTooManyTasks: !!options.bugTooManyTasks,
          bugDuplicateTodo: !!options.bugDuplicateTodo
        },
        { merge: true }
      );
      console.log(`✅ Utente aggiornato in ${collectionName}`);
    } else {
      await setDoc(userRef, {
        id: uid,
        nick: options.email ?? "",
        percentage: Number(options.score ?? 0),
        time: options.time ?? "",
        Totalclicks: Number(options.Totalclicks ?? 0),
        bugLetter: !!options.bugLetter,
        bugDecimal: !!options.bugDecimal,
        bugEmpty: !!options.bugEmpty,
        bugToInfinity: !!options.bugToInfinity,
        bugSymbols: !!options.bugSymbols,
        createdAt: serverTimestamp(),
        lastUpdate: serverTimestamp(),
      });
      console.log(`🆕 Nuovo utente creato in ${collectionName}`);
    }
  } catch (error) {
    console.error("❌ Errore durante il salvataggio:", error);
    throw error;
  }
}