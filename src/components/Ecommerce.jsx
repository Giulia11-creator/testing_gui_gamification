import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";
import { FaUserCircle } from 'react-icons/fa';
import { addUser } from "./FirestoreFunction.js";
import EndTimer from "./EndTimer.jsx";
const Ecommerce = () => {
  const navigate = useNavigate();
  const secondClickedDuringSleep = useRef(false);
  const isSleeping = useRef(false);
  const productToSave = useRef(null);
  const DURATION = 20 * 60;
  const [seconds, setseconds] = useState(() => {
    const saved = sessionStorage.getItem("timer");
    return saved ? Number(saved) : DURATION;
  });
  const [finishedTime, setFinishedTimer] = useState(false);

  let length = JSON.parse(sessionStorage.getItem("products") || "[]").length;

  const [messaggioErrore, setmessaggioErrore] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [popVisible, setpopVisible] = useState(false);
  const [product, setprouduct] = useState("HUAWEI MateBook X Pro U7-155H 32GB +1TB Morandi Blue Windows 11 Pro");
  const [bugNoObject, setbugNoObject] = useState(() => {
    const saved = sessionStorage.getItem('bugNoObject');
    return saved ? JSON.parse(saved) : false;
  });

  const [bugWrongProduct, setbugWrongProduct] = useState(() => {
    const saved = sessionStorage.getItem('bugWrongProduct');
    return saved ? JSON.parse(saved) : false;
  });
  const [score, setscore] = useState(() => {
    const saved = sessionStorage.getItem('score');
    return saved ? JSON.parse(saved) : 0;
  });

  const { user } = UserAuth();

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

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
    const timer = setTimeout(() => {
      setprouduct("Macbook Pro, M5 2024 13 pollici");
    }, randomDelay);
    return () => clearTimeout(timer);
  }, [product]);

  useEffect(() => {
    if (bugNoObject) {
      const flag = sessionStorage.getItem('scoreSetForBugNoObject');
      if (!flag) {
        const newScore = score + 25;
        setscore(newScore);
        sessionStorage.setItem('score', JSON.stringify(newScore));
        sessionStorage.setItem('scoreSetForBugNoObject', 'true');
        sessionStorage.setItem('bugNoObject', JSON.stringify(true));
        setmessaggioErrore("🧹 Congratulazioni! Hai trovato un bug logico di stato. L’applicazione permette di rimuovere un prodotto dal carrello anche se non è mai stato aggiunto. Questo accade perché il programma non verifica la presenza dell’oggetto nella lista prima di tentare la rimozione. Si tratta di un bug logico, legato alla gestione errata dello stato: il sistema non controlla la coerenza tra l’azione (rimuovere) e la situazione attuale (lista vuota o prodotto inesistente). In un contesto reale, questo potrebbe portare a errori di sincronizzazione dei dati o a comportamenti incoerenti nell’interfaccia.");
        setpopVisible(true);
      }
    }
  }, [bugNoObject]);


  useEffect(() => {
    if (bugWrongProduct) {
      const flag = sessionStorage.getItem('scoreSetForbugWrongProduct');
      if (!flag) {
        const newScore = score + 25;
        setscore(newScore);
        sessionStorage.setItem('score', JSON.stringify(newScore));
        sessionStorage.setItem('scoreSetForbugWrongProduct', 'true');
        sessionStorage.setItem('bugWrongProduct', JSON.stringify(true));
        setmessaggioErrore("🛍️ Ben fatto! Hai individuato un bug di coerenza dei dati (data inconsistency). Durante la navigazione, uno dei prodotti può cambiare nome da solo, anche senza alcuna interazione. Questo tipo di bug si verifica quando i dati condivisi tra più componenti o funzioni vengono modificati in modo non controllato, oppure quando un riferimento a oggetti in memoria viene riutilizzato o sovrascritto per errore. È un bug logico di gestione dello stato, perché il codice non garantisce l’integrità dei dati mostrati. In un’app reale, questo potrebbe portare a descrizioni errate, ordini sbagliati o confusione per l’utente finale.");
        setpopVisible(true);

      }
    }
  }, [bugWrongProduct]);

  // Persist score
  useEffect(() => {
    sessionStorage.setItem('score', JSON.stringify(score));
  }, [score]);

  // Fine gioco
  useEffect(() => {
    if (score === 100) setModalVisible(true);
  }, [score]);

  // Salva score su Firestore
  useEffect(() => {
    (async () => {
      if (user) {
        await addUser("Ecommerce", user.uid, { score, email: user.email, time: formatTime() });
      }
    })();
  }, [score, user, formatTime, seconds]);

  const handleFirstClick = (titleP, priceP, photoP) => {
    isSleeping.current = true;
    secondClickedDuringSleep.current = false;
    productToSave.current = { sku: titleP, title: titleP, price: priceP, photo: photoP };

    setTimeout(() => {
      if (!secondClickedDuringSleep.current) {
        sessionStorage.setItem("count", length + 1);
        saveProduct(productToSave.current.sku, productToSave.current.title, productToSave.current.price, productToSave.current.photo);
        isSleeping.current = false;
      } else {
        secondClickedDuringSleep.current = false;
        isSleeping.current = false;
      }
    }, 4000);
  };

  const RemoveItem = (sku) => {
    const raw = sessionStorage.getItem("products");
    const list = raw ? JSON.parse(raw) : [];

    const exists = list.some((p) => p.sku === sku);

    if (!exists && !bugNoObject) {
      setbugNoObject(true);
      return;
    }

    const filtered = list.filter((p) => p.sku !== sku);
    sessionStorage.setItem("products", JSON.stringify(filtered));
    sessionStorage.setItem("count", filtered.length);
  };



  const handleSecondClick = () => {
    if (isSleeping.current) {
      secondClickedDuringSleep.current = true;
      sessionStorage.setItem("count", length + 1);
      navigate("/cart");
      productToSave.current = null;
    } else {
      navigate("/cart");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    navigate("/account");
  };

  function saveProduct(sku, titleId, priceId, photoId) {
    const titleText = document.getElementById(titleId)?.textContent ?? "";
    const priceText = document.getElementById(priceId)?.textContent ?? "";
    const photoSrc = document.getElementById(photoId)?.src ?? "";

    let productObj;

    if (sku === "ipadTitle") {
      productObj = {
        sku,
        title: titleText,
        price: "$6200,00", // prezzo volutamente sbagliato
        rightPrice: priceText,
        photo: photoSrc,
      };
    } else {
      productObj = {
        sku,
        title: titleText,
        price: priceText,
        photo: photoSrc,
      };
    }

    let products = sessionStorage.getItem("products");
    products = products ? JSON.parse(products) : [];
    products.push(productObj);
    sessionStorage.setItem("products", JSON.stringify(products));
  }


  useEffect(() => {
    let length = JSON.parse(sessionStorage.getItem("products") || "[]").length;
    sessionStorage.setItem("count", length);
  }, []);

  const resettaErrore = () => {
    setpopVisible(false);
    setmessaggioErrore('');
  };

  function handleClickTitle() {
    if (product == "HUAWEI MateBook X Pro U7-155H 32GB +1TB Morandi Blue Windows 11 Pro") return;
    setbugWrongProduct(true);

  };

  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Topbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-purple-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between">
          {/* Sinistra: saluto */}
          <span className="text-lg md:text-xl text-slate-600">
            <span className="text-purple-800 font-semibold">
              Ciao, {user?.email?.split('@')[0] || 'utente'}
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
                "ml-3 mt-1"   // ✅ aggiunto
              ].join(" ")}
              aria-live="polite"
              title="Tempo rimanente"
            >
              <span className="hidden sm:inline text-xs uppercase">Timer</span>
              <span className="font-mono text-base">
                {minutes}:{remainingSeconds.toString().padStart(2, "0")}
              </span>

              <span
                className={[
                  "ml-1 inline-block size-2 rounded-full",
                  seconds <= 30 ? "bg-red-500 animate-pulse" :
                    seconds <= 60 ? "bg-amber-500" : "bg-emerald-500",
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
              <span className="text-sm">Punteggio</span>
              <span className="text-base tabular-nums">{score}</span>
            </div>

            <button
              type="button"
              className="rounded-full p-1.5 bg-purple-200 hover:bg-purple-300 transition-colors"
              aria-label="Vai al profilo"
              onClick={() => navigate('/account')}
            >
              <FaUserCircle className="text-purple-800 text-3xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenuto */}
      <div className="flex-1">
        <div className="max-w-[1200px] mx-auto px-5 mt-8">
          {/* Header + punteggio + CTA carrello */}
          <div className="mb-6 md:mb-8">
            <div className="w-full p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Negozio</h1>
              <div className="flex items-center gap-4">
                <span aria-label="bug-score" className="text-2xl">
                  {'🪲'.repeat(Math.floor(score / 25))}
                </span>
                <button
                  onClick={handleSecondClick}
                  className="h-10 px-4 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition"
                >
                  Carrello
                </button>
              </div>
            </div>
          </div>

          {/* Cards grid (auto-fit) */}
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-5 md:mb-10">
            {/* iMac */}
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-56 w-full flex items-center justify-center bg-white">
                <a href="#" className="block">
                  <img id="imacPhoto" className="mx-auto h-full max-h-52 object-contain" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg" alt="Apple iMac" />
                </a>
              </div>
              <div className="pt-6 px-6 pb-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                      </svg>
                    ))}
                  </div>
                  <a href="#" id="imacTitle" className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                    Apple iMac 27", 1TB HDD, Retina 5K Display, M3 Max
                  </a>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={`imac-${i}`} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-900">5.0</p>
                    <p className="text-sm font-medium text-slate-900">(455)</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p id="imacPrice" className="text-2xl font-extrabold leading-tight text-slate-900">$1699,00</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-300 active:shadow-inner transition"
                      onClick={() => handleFirstClick("imacTitle", "imacPrice", "imacPhoto")}
                    >
                      <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" />
                      </svg>
                      Acquista
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-300 active:shadow-inner transition"
                      onClick={() =>
                        RemoveItem("imacTitle")}
                    >
                      ✕ Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MateBook */}
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-56 w-full flex items-center justify-center bg-white">
                <a href="#" className="block">
                  <img id="matebookPhoto" className="mx-auto h-full max-h-52 object-contain" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/macbook-pro-dark.svg" alt="HUAWEI MateBook X Pro" />
                </a>
              </div>
              <div className="pt-6 px-6 pb-6 flex-grow flex flex-col justify-between">
                <div>
                  <a onClick={handleClickTitle} id="matebookTitle" href="#" className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                    {product}
                  </a>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={`mate-${i}`} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-900">5.0</p>
                    <p className="text-sm font-medium text-slate-900">(1000)</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p id="matebookPrice" className="text-2xl font-extrabold leading-tight text-slate-900">$1400,00</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-300 active:shadow-inner transition"
                      onClick={() => handleFirstClick("matebookTitle", "matebookPrice", "matebookPhoto")}
                    >
                      <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" />
                      </svg>
                      Acquista
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-300 active:shadow-inner transition"
                      onClick={() =>
                        RemoveItem("matebookTitle")}
                    >
                      ✕ Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Watch */}
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-56 w-full flex items-center justify-center bg-white">
                <a href="#" className="block">
                  <img id="watchPhoto" className="mx-auto h-full max-h-52 object-contain" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/apple-watch-dark.svg" alt="Apple Watch Series 9" />
                </a>
              </div>
              <div className="pt-6 px-6 pb-6 flex-grow flex flex-col justify-between">
                <div>
                  <a href="#" id="watchTitle" className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                    Apple Watch Series 9 GPS 41mm Smartwatch con cassa in alluminio color mezzanotte e Cinturino Sport mezzanotte
                  </a>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={`watch-${i}`} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-900">5.0</p>
                    <p className="text-sm font-medium text-slate-900">(333)</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p id="watchPrice" className="text-2xl font-extrabold leading-tight text-slate-900">$500,00</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-300 active:shadow-inner transition"
                      onClick={() => handleFirstClick("watchTitle", "watchPrice", "watchPhoto")}
                    >
                      <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" />
                      </svg>
                      Acquista
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-300 active:shadow-inner transition"
                      onClick={() =>
                        RemoveItem("watchTitle")}
                    >
                      ✕ Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* iPad */}
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-56 w-full flex items-center justify-center bg-white">
                <a href="#" className="block">
                  <img id="ipadPhoto" className="mx-auto h-full max-h-52 object-contain" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/ipad-keyboard-dark.svg" alt="Apple iPad Pro" />
                </a>
              </div>
              <div className="pt-6 px-6 pb-6 flex-grow flex flex-col justify-between">
                <div>
                  <a href="#" id="ipadTitle" className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                    Apple iPad Pro 11'': Chip M4 Progettato per Apple Intelligence, display Ultra Retina XDR, 256GB
                  </a>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={`ipad-${i}`} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-900">5.0</p>
                    <p className="text-sm font-medium text-slate-900">(1355)</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p id="ipadPrice" className="text-2xl font-extrabold leading-tight text-slate-900">$1200,00</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-300 active:shadow-inner transition"
                      onClick={() => handleFirstClick("ipadTitle", "ipadPrice", "ipadPhoto")}
                    >
                      <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" />
                      </svg>
                      Acquista
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-300 active:shadow-inner transition"
                      onClick={() =>
                        RemoveItem("ipadTitle")}
                    >
                      ✕ Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PS5 */}
            <div className="flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
              <div className="h-56 w-full flex items-center justify-center bg-white">
                <a href="#" className="block">
                  <img id="ps5Photo" className="mx-auto h-full max-h-52 object-contain" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/ps5-dark.svg" alt="Playstation 5" />
                </a>
              </div>
              <div className="pt-6 px-6 pb-6 flex-grow flex flex-col justify-between">
                <div>
                  <a href="#" id="ps5Title" className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                    Playstation 5 Console Edizione Digital Slim
                  </a>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={`ps5-${i}`} className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-slate-900">5.0</p>
                    <p className="text-sm font-medium text-slate-900">(455)</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p id="ps5Price" className="text-2xl font-extrabold leading-tight text-slate-900">$412,00</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-300 active:shadow-inner transition"
                      onClick={() => handleFirstClick("ps5Title", "ps5Price", "ps5Photo")}
                    >
                      <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" />
                      </svg>
                      Acquista
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-rose-300 active:shadow-inner transition"
                      onClick={() =>
                        RemoveItem("ps5Title")}
                    >
                      ✕ Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modale success */}
          {modalVisible && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <h3 className="text-2xl font-semibold mb-3 text-purple-700">Ottimo lavoro!</h3>
                <p className="mb-6 text-slate-700">Hai trovato tutti i bug! Puoi passare al prossimo gruppo di test!</p>
                <button
                  onClick={closeModal}
                  className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold transition"
                >
                  Ok, torna alla Home
                </button>
              </div>
            </div>
          )}

          {/* Popup errore */}
          {popVisible && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="relative p-4 bg-purple-50 border border-purple-300 text-purple-800 rounded-2xl w-full max-w-md shadow-2xl">
                <strong className="block mb-1">Errore:</strong> {messaggioErrore}
                <button
                  onClick={resettaErrore}
                  className="absolute top-2 right-2 text-purple-700 hover:text-rose-700 font-bold"
                  aria-label="Chiudi messaggio di errore"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
          {finishedTime && (<EndTimer />)}
        </div>
      </div>
    </section>
  );

};

export default Ecommerce;