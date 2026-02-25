import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";

const Account = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const [progress1, setProgress1] = useState(0); // Inizializzato a 0
  const [progress2, setProgress2] = useState(0); // Inizializzato a 0
  const [progress3, setProgress3] = useState(0); // Inizializzato a 0
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Funzione per il logout
  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.clear();
      navigate("/");
    } catch (e) {
      console.log(e.message);
    }
  };

  // Toggle del menu utente
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Funzione per ottenere il punteggio dal DB
  const handleSearchUserScore = async (raccolta) => {
    try {

      const docRef = doc(db, raccolta, user.uid); // Usando l'uid per identificare il documento
      const docSnap = await getDoc(docRef); // Recupero del documento

      if (docSnap.exists()) {
        if (raccolta == "TextBox")
          setProgress1(docSnap.data()?.score);
        if (raccolta == "Todo")
          setProgress3(docSnap.data()?.score);
        if (raccolta == "Ecommerce")
          setProgress2(docSnap.data()?.score); // Imposto il punteggio di progress1
      } else {
        console.log("Il documento non esiste!");
      }
    } catch (e) {
      console.log("Errore nel recupero del documento: " + e.message);
    }
  };


  // Recupero dei dati dal DB al caricamento della pagina
  useEffect(() => {
    sessionStorage.clear();
    handleSearchUserScore("TextBox");
    handleSearchUserScore("Ecommerce");
    handleSearchUserScore("Todo");
  }, []); // Questo useEffect si attiva solo una volta al caricamento del componente

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col overflow-hidden">
      {/* Topbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-purple-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between">
          <span className="text-lg md:text-xl text-slate-600">
            <strong className="text-slate-700">Bentornato</strong>,{" "}
            <span className="text-purple-800 font-semibold">
              {user && user.email.split("@")[0]}
            </span>{" "}
            <span className="hidden sm:inline">— pronto per una nuova sfida? 💪</span>
          </span>

          <div className="relative">
            <button
              type="button"
              className="rounded-full p-1.5 bg-purple-200 hover:bg-purple-300 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <FaUserCircle className="text-purple-800 text-3xl" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10"
              >
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header card */}
            <div className="bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white py-4 px-6">
              <h2 className="text-xl font-semibold tracking-tight">Testing</h2>
            </div>

            {/* Body card */}
            <div className="p-5 sm:p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Benvenuto!</h3>
                <p className="text-sm text-slate-600">
                  Completa i test per imparare qualcosa sul mondo del Testing.
                </p>
              </div>

              <div>
                <h4 className="text-md font-semibold text-slate-800 mb-4">Test</h4>
                <ul className="space-y-4">
                  {/* Test 1 */}
                  <li className="bg-slate-50 rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                        1
                      </span>
                      <span className="font-medium text-slate-800">Test TextBox</span>
                    </div>

                    <div className="flex items-center gap-3 sm:min-w-[260px]">
                      {/* Progress bar */}
                      <div className="w-28 sm:w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-700"
                          style={{ width: `${progress1}%` }}
                          aria-label="Progresso TextBox"
                          aria-valuenow={progress1}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          role="progressbar"
                        />
                      </div>
                      <span className="text-sm text-slate-600 tabular-nums">{progress1}%</span>
                      <button
                        className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                        onClick={() => navigate("/textbox")}
                      >
                        Inizia il Test
                      </button>
                    </div>
                  </li>

                  {/* Test 2 */}
                  <li className="bg-slate-50 rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
                        2
                      </span>
                      <span className="font-medium text-slate-800">Test e-commerce</span>
                    </div>

                    <div className="flex items-center gap-3 sm:min-w-[260px]">
                      <div className="w-28 sm:w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-700"
                          style={{ width: `${progress2}%` }}
                          aria-label="Progresso e-commerce"
                          aria-valuenow={progress2}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          role="progressbar"
                        />
                      </div>
                      <span className="text-sm text-slate-600 tabular-nums">{progress2}%</span>
                      <button
                        className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                        onClick={() => navigate("/ecommerce")}
                      >
                        Inizia il Test
                      </button>
                    </div>
                  </li>

                  {/* Test 3 */}
                  <li className="bg-slate-50 rounded-xl py-3 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-sm font-semibold">
                        3
                      </span>
                      <span className="font-medium text-slate-800">Test task</span>
                    </div>

                    <div className="flex items-center gap-3 sm:min-w-[260px]">
                      <div className="w-28 sm:w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-700"
                          style={{ width: `${progress3}%` }}
                          aria-label="Progresso task"
                          aria-valuenow={progress3}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          role="progressbar"
                        />
                      </div>
                      <span className="text-sm text-slate-600 tabular-nums">{progress3}%</span>
                      <button
                        className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                        onClick={() => navigate("/todo")}
                      >
                        Inizia il Test
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer card */}
            <div className="bg-slate-100 py-3 px-6 text-slate-500 text-sm flex justify-between rounded-b-2xl">
              <span>© 2024 Testing</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

};

export default Account;
