import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { addUser } from "./FirestoreFunction.js";
import { UserAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import EndTimer from "./EndTimer.jsx";
const TestTextBox = () => {
  const DURATION = 10 * 60;
  const [seconds, setseconds] = useState(() => {
    const saved = sessionStorage.getItem("timer");
    return saved ? Number(saved) : DURATION;
  });
  const [finishedTime, setFinishedTimer] = useState(false);
  const [input, setInput] = useState("");
  const [result, setresult] = useState(null);
  const [error, seterror] = useState(false);
  const [errorMessage, seterrorMessage] = useState("");
  const [bugLetter, setbugLetter] = useState(false);
  const [bugSymbols, setbugSymbols] = useState(false);
  const [bugEmpty, setbugEmpty] = useState(false);
  const [bugDecimal, setBugDecimal] = useState(false);
  const [bugToInfinity, setBugToInfinity] = useState(false);
  const [hadComa, setHadComa] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = UserAuth();
  const [score, setScore] = useState(0);
  const [clicks, setClicks] = useState(() => {
    const saved = sessionStorage.getItem("clicks");
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    if (seconds <= 0) {
      setFinishedTimer(true);
      return;
    }

    const id = setInterval(() => {
      setseconds((prev) => {
        const next = prev - 1;
        sessionStorage.setItem("timer", next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const elapsed = DURATION - seconds;
  const formatTime = useCallback(() => {
    const minutes = Math.floor(elapsed / 60);
    const Seconds = elapsed % 60;
    return `${String(minutes).padStart(2, "0")}:${String(Seconds).padStart(2, "0")}`;
  }, [elapsed]);

  const calculate = (e) => {
    e.preventDefault();
    incrementClicks();
    try {
      const expr = input; // per chiarezza

      // BUG virgola: tronca la parte decimale (es: 9,6 -> 9)
      const hasCommaNow = expr.includes(",");
      const cleanedInput = expr.replace(/(\d+),\d+/g, "$1");

      // salvo nello state per il click sul result (checkErrorComa)
      setHadComa(hasCommaNow);

      // --- BUG 1: lettere ---
      if (/[a-zA-Z]/.test(expr)) {
        setresult(null);
        if (!bugLetter) {
          setbugLetter(true);
          seterror(true);
          seterrorMessage(
            "🔤 Congratulazioni! Hai trovato il Bug di validazione input: Un bug di validazione è un errore nel software che avviene quando il programma non controlla correttamente i dati o le condizioni prima di accettarli o usarli. Qui la calcolatrice non gestisce correttamente le lettere dentro l’espressione e va in errore invece di bloccarle o spiegare chiaramente cosa non va.",
          );
        } else {
          seterror(true);
          seterrorMessage("Hai già trovato il bug delle lettere!");
        }
        return;
      }

      // --- BUG 2: simboli speciali ---
      if (/[#?&$£!_]/.test(expr)) {
        setresult(null);

        if (!bugSymbols) {
          setbugSymbols(true);
          seterror(true);
          seterrorMessage(
            "❌ Ottimo lavoro! Hai individuato il Bug di validazione input: Un bug di validazione è un errore nel software che avviene quando il programma non controlla correttamente i dati o le condizioni prima di accettarli o usarli. Qui inserendo simboli speciali l’app non li tratta correttamente e genera un errore invece di impedirli o segnalarli in modo chiaro.",
          );
        } else {
          seterror(true);
          seterrorMessage(
            "Hai già trovato il bug del simbolo non accettabile!",
          );
        }
        return;
      }

      // --- BUG 3: input vuoto ---
      if (expr === "") {
        setresult(null);

        if (!bugEmpty) {
          setbugEmpty(true);
          seterror(true);
          seterrorMessage(
            "⚠️ Ben fatto! Hai scoperto il Bug di caso limite: questi bug succedono quando l’app non gestisce bene situazioni semplici ma frequenti. Qui se premi “calcola” con input vuoto l’app va in errore invece di chiederti di inserire un’espressione valida.",
          );
        } else {
          seterror(true);
          seterrorMessage("Hai già trovato il bug dell'input vuoto!");
        }
        return;
      }
      const preparedInput = convertPowers(cleanedInput);
      let res = eval(preparedInput);
      if (hasCommaNow) {
        res = Math.floor(res);
      }

      // --- BUG Infinity / NaN ---
      if (!Number.isFinite(res)) {
        setresult(null);

        if (!bugToInfinity) {
          setBugToInfinity(true);
          seterror(true);
          seterrorMessage(
            "♾️ hai trovato un Bug di robustezza del calcolo: questi bug compaiono quando l’app non gestisce risultati matematici non validi (Infinity o NaN). Qui alcune operazioni producono un valore infinito/non numerico e l’app non lo gestisce come dovrebbe.",
          );
        } else {
          seterror(true);
          seterrorMessage("Hai già trovato il bug di Infinity/NaN!");
        }
        return;
      }

      // tutto ok
      seterror(false);
      seterrorMessage("");
      setresult(res);
    } catch (error) {
      seterror(true);
      seterrorMessage(
        "Errore: non puoi fare questa azione" || "errore sconosciuto",
      );
      setresult(null);
    }
  };

  function checkErrorComa() {
    incrementClicks();
    if (hadComa && !bugDecimal) {
      setBugDecimal(true);
      seterror(true);
      seterrorMessage(
        "⚠️ Ben fatto! Hai scoperto un 🧮 Bug di formattazione numerica (virgola/punto): questi bug succedono quando l’app interpreta male i numeri in base al formato locale. Qui la calcolatrice accetta numeri con la virgola, ma poi tronca la parte decimale e mostra un risultato sbagliato.",
      );
    } else if (hadComa && bugDecimal) {
      seterror(true);
      seterrorMessage("Hai già trovato il bug della virgola");
    }
  }

  useEffect(() => {
    let currentScore = 0;
    if (bugLetter) currentScore += 20;
    if (bugSymbols) currentScore += 20;
    if (bugEmpty) currentScore += 20;
    if (bugDecimal) currentScore += 20;
    if (bugToInfinity) currentScore += 20;
    setScore(currentScore);
  }, [bugLetter, bugSymbols, bugEmpty, bugDecimal, bugToInfinity]);

  useEffect(() => {
    (async () => {
      if (user) {
        await addUser("TextBox", user.uid, {
          score,
          email: user.email,
          time: formatTime(),
          seconds:elapsed,
          Totalclicks: clicks,
          bugs: {
            bugLetter: bugLetter,
            bugDecimal: bugDecimal,
            bugEmpty: bugEmpty,
            bugToInfinity: bugToInfinity,
            bugSymbols: bugSymbols,
          },
        });
      }
    })();
  }, [
    score,
    user,
    formatTime,
    seconds,
    clicks,
    bugDecimal,
    bugEmpty,
    bugLetter,
    bugSymbols,
    bugToInfinity,
  ]);

  useEffect(() => {
    if (score === 100) {
      const timer = setTimeout(() => {
        setModalVisible(true);
      }, 4000); // 4 secondi

      return () => clearTimeout(timer); // cleanup importante
    }
  }, [score]);

  const resettaerror = () => {
    seterror(false);
    seterrorMessage("");
    setInput("");
    setresult("");
    setHadComa(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    navigate("/account");
  };

  function convertPowers(str) {
    // sostituisce "numero ^ numero" (con eventuali spazi) con "numero ** numero"
    // Esempi: "2^3" -> "2**3", "2 ^ 3" -> "2**3", "12^10" -> "12**10"
    return str.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, "$1**$2");
  }

  function incrementClicks() {
    setClicks((prev) => {
      const next = prev + 1;
      sessionStorage.setItem("clicks", JSON.stringify(next));
      return next; // importante restituire il nuovo valore
    });
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Topbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-purple-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between">
          {/* Sinistra: saluto */}
          <span className="text-lg md:text-xl text-slate-600">
            <span className="text-lg md:text-xl text-slate-600">
              <span
                className="text-purple-800 font-semibold"
                onClick={incrementClicks}
              >
                Ciao, {user?.email?.split("@")[0] || "utente"}
              </span>

              {/* ✅ TIMER BADGE */}
              <div
                className={[
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold shadow-sm",
                  "tabular-nums tracking-tight",
                  seconds <= 30
                    ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                    : seconds <= 60
                      ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
                  "ml-3 mt-1", // ✅ aggiunto
                ].join(" ")}
                aria-live="polite"
                title="Tempo rimanente"
              >
                <span
                  className="hidden sm:inline text-xs uppercase"
                  onClick={incrementClicks}
                >
                  Timer
                </span>
                <span className="font-mono text-base" onClick={incrementClicks}>
                  {minutes}:{remainingSeconds.toString().padStart(2, "0")}
                </span>

                <span
                  className={[
                    "ml-1 inline-block size-2 rounded-full",
                    seconds <= 30
                      ? "bg-red-500 animate-pulse"
                      : seconds <= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  ].join(" ")}
                  aria-hidden
                />
              </div>
            </span>
          </span>

          {/* Destra: chip punteggio + icona account */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold shadow-sm"
              aria-live="polite"
              title="Punteggio"
            >
              <span className="text-sm" onClick={incrementClicks}>
                Punteggio
              </span>
              <span
                className="text-base tabular-nums"
                onClick={incrementClicks}
              >
                {score}
              </span>
            </div>

            <button
              type="button"
              className="rounded-full p-1.5 bg-purple-200 hover:bg-purple-300 transition-colors"
              aria-label="Vai al profilo"
              onClick={() => navigate("/account")}
            >
              <FaUserCircle className="text-purple-800 text-3xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenuto principale */}
      <div className="flex-1">
        <div className="max-w-[1200px] mx-auto px-5 py-8">
          <div className="mx-auto w-full max-w-md">
            {/* Card calculatetrice */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Header viola */}
              <div className="bg-gradient-to-r from-purple-700 to-fuchsia-600 py-4 px-6">
                <h2
                  className="text-center text-xl font-semibold text-white tracking-tight"
                  onClick={incrementClicks}
                >
                  Mini calcolatrice
                </h2>
              </div>

              <div className="px-6 py-5">
                {/* Barra “bug”/progress emojii */}
                <div
                  className="mb-5 text-center text-2xl"
                  onClick={incrementClicks}
                >
                  {"🪲".repeat(Math.floor(score / 20))}
                </div>

                {/* Form */}
                <form onSubmit={calculate} className="space-y-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setresult(null);
                    }}
                    placeholder="Scrivi un'espressione (es: 3+5)"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white placeholder-slate-400
                    focus:outline-none focus:ring-4 focus:ring-purple-200 transition
                    ${error ? "border-red-400 bg-slate-50 text-slate-500 cursor-not-allowed" : "border-slate-300"}
                  `}
                    disabled={error}
                    aria-invalid={!!error}
                  />

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-lg text-white font-semibold transition
                    focus:outline-none focus:ring-4
                    ${
                      error
                        ? "bg-slate-400 cursor-not-allowed focus:ring-slate-300"
                        : "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300"
                    }`}
                    disabled={error}
                  >
                    calcola
                  </button>
                </form>

                {/* Messaggi */}
                {error && (
                  <div
                    className="mt-5 p-4 bg-purple-50 border border-purple-300 text-purple-800 rounded-xl relative"
                    role="alert"
                  >
                    <strong className="font-semibold">error: </strong>
                    {errorMessage}
                    <button
                      onClick={resettaerror}
                      className="absolute top-2.5 right-3 text-purple-700 hover:text-red-700 font-bold"
                      aria-label="Chiudi error"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {result !== null && !error && (
                  <div
                    className="mt-5 p-4 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl"
                    aria-live="polite"
                  >
                    <p
                      className="text-lg font-semibold"
                      onClick={checkErrorComa}
                    >
                      risultato: <span className="tabular-nums">{result}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal di completamento */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h3 className="text-2xl font-semibold mb-3 text-purple-700">
              Ottimo lavoro!
            </h3>
            <p className="mb-6 text-slate-700">
              Hai trovato tutti i bug! Puoi passare al prossimo gruppo di test!
            </p>
            <button
              onClick={closeModal}
              className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold transition"
            >
              Ok, torna alla Home
            </button>
          </div>
        </div>
      )}
      {finishedTime && <EndTimer />}
    </div>
  );
};

export default TestTextBox;
