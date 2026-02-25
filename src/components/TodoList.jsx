import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { addUser } from "./FirestoreFunction.js";
import EndTimer from "./EndTimer.jsx";
import { useRef } from "react";

function TodoList() {
  const nextId = useRef(0);
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [oldText, setOldText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popUpError, setpopUpError] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [bugWrongDate, setbugWrongDate] = useState(false);
  const [bugEmptyColoumn, setbugEmptyColoumn] = useState(false);
  const [bugTooManyTasks, setbugTooManyTasks] = useState(false);
  const [bugDuplicateTodo, setbugDuplicateTodo] = useState(false);
  const [bugWrongText, setbugWrongText] = useState(false);
  const [score, setscore] = useState(0);
  const [showModal, setshowModal] = useState(false);
  const [ShowEmoji, setShowEmoji] = useState(false);
  const navigate = useNavigate();
  const { user } = UserAuth();
  const DURATION = 20 * 60;
  const [seconds, setseconds] = useState(() => {
    const saved = sessionStorage.getItem("timer");
    return saved ? Number(saved) : DURATION;
  });
  const [clicks, setClicks] = useState(() => {
    const saved = sessionStorage.getItem("clicks");
    return saved ? JSON.parse(saved) : 0;
  });
  const [finishedTime, setFinishedTimer] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === 4
            ? { ...todo, text: "Testo modificato automaticamente" }
            : todo,
        ),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [oldText]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const elapsed = DURATION - seconds;
  const formatTime = useCallback(() => {
    const minutes = Math.floor(elapsed / 60);
    const Seconds = elapsed % 60;
    return `${String(minutes).padStart(2, "0")}:${String(Seconds).padStart(2, "0")}`;
  }, [elapsed]);

  const CloseModal = () => {
    setshowModal(false);
    navigate("/account");
  };

  const addTodo = () => {
    incrementClicks();
    if (!text.trim()) return;
    const newTodo = {
      id: nextId.current,
      text: text,
      dueDate: new Date(),
    };
    nextId.current += 1;
    if ((todos.length + 1) % 3 === 0 && todos.length > 0) {
      const DaysInThePast = Math.floor(Math.random() * 30) + 1;
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - DaysInThePast);
      newTodo.dueDate = pastDate;
    }
    if (newTodo.id == 4) {
      setOldText(newTodo.text);
    }
    setTodos([...todos, newTodo]);
    setText("");
    setShowPopup(false);
  };

  const removeAll = () => {
    incrementClicks();
    if (todos.length === 0 && !bugEmptyColoumn) {
      setpopUpError(true);
      setErrorMessage(
        "🧹 Ben fatto! Hai individuato un bug di validazione UI (interfaccia utente). Il pulsante “Elimina tutto” resta cliccabile anche quando non ci sono task, permettendo un’azione senza senso. Si tratta di un errore di validazione dello stato: l’app non controlla che la lista sia vuota prima di abilitare l’azione. Questo tipo di bug compromette la coerenza dell’interfaccia e può confondere l’utente.",
      );
      setbugEmptyColoumn(true);
    } else {
      setTodos([]);
    }
  };

  const resetError = () => {
    setpopUpError(false);
    setErrorMessage("");
    if (bugTooManyTasks) {
      setTodos([]);
      setShowEmoji(false);
    }
  };

  const HandleClickDate = (todo) => {
    incrementClicks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateTodo = new Date(todo.dueDate);
    dateTodo.setHours(0, 0, 0, 0);

    if (dateTodo < today && !bugWrongDate) {
      setErrorMessage(
        "🎉 Congratulazioni! Hai scoperto un bug logico. Ogni volta che aggiungi tre task, il terzo viene salvato con una data sbagliata. In pratica, l’applicazione sovrascrive la data in modo errato invece di usare quella scelta dall’utente. Questo è un esempio tipico di bug logico (off-by-one), in cui la logica del programma produce un comportamento non coerente con l’intenzione.",
      );
      setpopUpError(true);
      setbugWrongDate(true);
    } else if (bugWrongDate) {
      setErrorMessage("Questo bug è già stato trovato!!! Cerca ancora");
      setpopUpError(true);
    }
    return;
  };

  const removeTodo = (index) => {
    incrementClicks();
    setTodos(todos.filter((_, i) => i !== index));
  };

  useEffect(() => {
    let currentScore = 0;
    if (bugEmptyColoumn) currentScore += 20;
    if (bugWrongDate) currentScore += 20;
    if (bugTooManyTasks) currentScore += 20;
    if (bugDuplicateTodo) currentScore += 20;
    if(bugWrongText) currentScore += 20;
    setscore(currentScore);
  }, [bugEmptyColoumn, bugWrongDate, bugTooManyTasks, bugDuplicateTodo, bugWrongText]);

  useEffect(() => {
    if (score === 100) {
      setshowModal(true);
    }
  }, [score]);

  useEffect(() => {
    (async () => {
      if (user) {
        await addUser("Todo", user.uid, {
          score,
          email: user.email,
          time: formatTime(),
          Totalclicks: clicks,
          bugs: {
          bugDuplicateTodo: bugDuplicateTodo,
          bugEmptyColoumn: bugEmptyColoumn,
          bugTooManyTasks: bugTooManyTasks,
          bugWrongDate: bugWrongDate,
          bugWrongText: bugWrongText},
         
        });
      }
    })();
  }, [
    score,
    user,
    formatTime,
    bugDuplicateTodo,
    bugEmptyColoumn,
    bugTooManyTasks,
    bugWrongDate,
    bugWrongText,
    clicks,
  ]);

  useEffect(() => {
    if (todos.length >= 7) {
      if (!bugTooManyTasks) {
        setErrorMessage(
          "🌀 Ottimo lavoro! Hai trovato un 🐢 Bug di prestazioni/stabilità: compaiono quando l’app viene “stressata” (molti elementi, molte operazioni) e diventa lenta o instabile per gestione inefficiente di stato o rendering. Qui superata una certa quantità di task l’app mostra comportamenti anomali e non regge il carico.",
        );
        setbugTooManyTasks(true);
      } else {
        setErrorMessage("Hai già trovato questo bug !!!");
      }
      setpopUpError(true);
      setShowEmoji(true);
      setTodos([]);
    }
  }, [todos, bugTooManyTasks]);

  const CheckDuplicate = (todo) => {
    incrementClicks();
    const isDup = todos.some(
      (t) =>
        t !== todo &&
        t.text.trim().toLowerCase() === todo.text.trim().toLowerCase(),
    );

    if (isDup) {
      if (!bugDuplicateTodo) {
        setErrorMessage(
          "🌀 Ottimo lavoro! Hai trovato un 🧾 Bug di validazione dati: succede quando l’app non controlla bene ciò che l’utente inserisce, creando dati sporchi o incoerenti. Qui è possibile aggiungere task duplicati, quindi la lista può contenere elementi uguali e diventare confusionaria.",
        );
        setbugDuplicateTodo(true);
      } else {
        setErrorMessage("Hai già trovato questo bug !!!");
      }
      setpopUpError(true);
      return;
    }
  };

  const CheckTodo = (todo) => {
    incrementClicks();
    if (todo.id != 4) {
      const isDup = todos.some(
        (t) =>
          t !== todo &&
          t.text.trim().toLowerCase() === todo.text.trim().toLowerCase(),
      );

      if (isDup) {
        if (!bugDuplicateTodo) {
          setErrorMessage(
          "🌀 Ottimo lavoro! Hai trovato un 🧾 Bug di validazione dati: succede quando l’app non controlla bene ciò che l’utente inserisce, creando dati sporchi o incoerenti. Qui è possibile aggiungere task duplicati, quindi la lista può contenere elementi uguali e diventare confusionaria.",
        );
          setbugDuplicateTodo(true);
        } else {
          setErrorMessage("Hai già trovato questo bug !!!");
        }
        setpopUpError(true);
        return;
      }
    } else {
      if (todo.text != oldText) {
        if (!bugWrongText) {
          setErrorMessage(
            "🌀 Ottimo lavoro! Hai trovato un ✍️ Bug da side effect: accade quando qualcosa modifica i dati “da solo” senza un’azione diretta dell’utente (timer, effetti, aggiornamenti automatici). Qui un task cambia testo automaticamente dopo poco tempo, alterando l’informazione inserita dall’utente.",
          );
          setbugWrongText(true);
        } else {
          setErrorMessage("Hai già trovato questo bug !!!");
        }
        setpopUpError(true);
        return;
      }
    }
  };

  function incrementClicks() {
    setClicks((prev) => {
      const next = prev + 1;
      sessionStorage.setItem("clicks", JSON.stringify(next));
      return next; // importante restituire il nuovo valore
    });
  }

  return (
    <div className="bg-slate-50 overflow-hidden min-h-screen flex flex-col">
      {/* Topbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-purple-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between">
          {/* Sinistra: saluto */}
          <span className="text-lg md:text-xl text-slate-600">
            <span
              onClick={incrementClicks}
              className="text-purple-800 font-semibold"
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

      {/* Modale completamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h3 className="text-2xl font-semibold mb-3 text-purple-700">
              Ottimo lavoro!
            </h3>
            <p className="mb-6 text-slate-700">
              Hai trovato tutti i bug! Puoi passare al prossimo gruppo di test!
            </p>
            <button
              onClick={CloseModal}
              className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold transition"
            >
              Ok, torna alla Home
            </button>
          </div>
        </div>
      )}
      {finishedTime && <EndTimer />}

      {/* Contenuto */}
      <div className="flex-grow">
        <div className="max-w-[1200px] mx-auto px-5 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonna sinistra (Popup Errore) */}
            <div className="flex items-start justify-center">
              {popUpError && (
                <div className="relative w-full max-w-sm bg-red-50 border border-red-300 text-red-800 rounded-xl shadow-md p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <strong className="block mb-1">Errore</strong>
                      <p className="text-sm leading-5">{ErrorMessage}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetError}
                    className="absolute top-2 right-2 text-red-700 hover:text-red-900 font-bold"
                    aria-label="Chiudi avviso"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>

            {/* Colonna centrale (Lista dei Task) */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-bold text-slate-900"
                  onClick={incrementClicks}
                >
                  📋 Task
                </h2>
                <span
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold"
                  onClick={incrementClicks}
                >
                  {todos.length} attivi
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {todos.length > 0 && todos.length < 7
                  ? todos.map((todo, index) => (
                      <div
                        key={index}
                        className="group bg-slate-100/80 hover:bg-slate-100 transition-colors p-3 rounded-xl flex items-center gap-3 shadow-sm"
                      >
                        <span
                          className="flex-1 text-slate-800"
                          onClick={() => CheckTodo(todo)}
                        >
                          {todo.text}
                        </span>

                        <button
                          className="text-xs text-slate-500 hover:text-purple-700 bg-white border border-slate-200 rounded-lg px-2 py-1 transition"
                          onClick={() => HandleClickDate(todo)}
                          title="Data scadenza"
                        >
                          {todo.dueDate
                            ? new Date(todo.dueDate).toLocaleDateString()
                            : "Data"}
                        </button>

                        <button
                          onClick={() => removeTodo(index)}
                          className="shrink-0 inline-flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 text-sm transition"
                          aria-label="Rimuovi task"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  : ShowEmoji && (
                      <div className="text-2xl mt-2 leading-6 break-words">
                        {"😱".repeat(300)}
                      </div>
                    )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  className="bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-semibold transition disabled:opacity-50"
                  onClick={() => setShowPopup(true)}
                  disabled={popUpError}
                >
                  Aggiungi
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-semibold transition disabled:opacity-50"
                  onClick={removeAll}
                  disabled={popUpError}
                >
                  Elimina tutto
                </button>
              </div>
            </div>

            {/* Colonna destra (Punti e Bug) */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-5">
              <h3
                className="text-lg font-semibold text-slate-900"
                onClick={incrementClicks}
              >
                Punti
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold text-purple-700 tabular-nums"
                  onClick={incrementClicks}
                >
                  {score}
                </span>
                <span
                  className="text-sm text-slate-500"
                  onClick={incrementClicks}
                >
                  / 100
                </span>
              </div>

              {/* Barra progresso */}
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all"
                  style={{ width: `${Math.min(score, 100)}%` }}
                  onClick={incrementClicks}
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-700">
                  Bug trovati
                </p>
                <div className="text-2xl mt-1">
                  {"🪲".repeat(Math.floor(score / 25)) || "💤"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup: Aggiunta Task */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2
              className="text-xl font-bold mb-4 text-slate-900"
              onClick={incrementClicks}
            >
              Inserisci un'attività
            </h2>

            <input
              type="text"
              placeholder="Scrivi qui..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-4 focus:ring-purple-200"
              onClick={incrementClicks}
            />

            <p
              onClick={incrementClicks}
              className="text-sm text-slate-500 mb-5"
            >
              Inserisci la descrizione del tuo task.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-300 transition"
              >
                Annulla
              </button>
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold transition"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;
