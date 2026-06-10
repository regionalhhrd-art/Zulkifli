/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Award,
  Trophy,
  Users,
  Settings,
  Play,
  LogOut,
  Smartphone,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Lock
} from "lucide-react";

import Leaderboard from "./components/Leaderboard";
import Certificate from "./components/Certificate";
import TestPortal from "./components/TestPortal";
import AdminPanel from "./components/AdminPanel";
import RegionalHLogo from "./components/RegionalHLogo";
import PhotoCapture from "./components/PhotoCapture";

import { DEFAULT_JABATAN_LIST, DEFAULT_QUESTIONS, MOCK_SUBMISSIONS } from "./data";
import { Jabatan, Question, Submission, UserSession } from "./types";

export default function App() {
  // Sync flag to track database state loads from final-authorized server
  const [isLoadingSync, setIsLoadingSync] = useState(true);

  // Persistence Loading from LocalStorage (fast fallback)
  const [jabatanList, setJabatanList] = useState<Jabatan[]>(() => {
    const saved = localStorage.getItem("pretest_jabatan_list");
    return saved ? JSON.parse(saved) : DEFAULT_JABATAN_LIST;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem("pretest_questions_list");
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem("pretest_submissions_list");
    return saved ? JSON.parse(saved) : MOCK_SUBMISSIONS;
  });

  // State
  const [currentView, setCurrentView] = useState<"home" | "test" | "result" | "certificate" | "leaderboard" | "admin">("home");
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Form Inputs
  const [nikInput, setNikInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [selectedJabatanId, setSelectedJabatanId] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [sandiInput, setSandiInput] = useState("");

  // Running State for Exam results
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  // helper to push master state directly to the server (only called during designated admin edits)
  const syncDatabaseToServer = (jList: Jabatan[], qList: Question[], sList: Submission[]) => {
    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jabatanList: jList, questions: qList, submissions: sList }),
    }).catch((e) => console.error("Database master sync error:", e));
  };

  // 1. Initial Load of centralized database on application startup
  useEffect(() => {
    async function fetchCentralDatabase() {
      try {
        // Appending a timestamp (cache bust) ensures browsers always download fresh questions
        const res = await fetch(`/api/data?t=${Date.now()}`);
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.status === "success" && resJson.data) {
            const { jabatanList: serverJ, questions: serverQ, submissions: serverS } = resJson.data;
            if (serverJ && serverJ.length > 0) {
              setJabatanList(serverJ);
            }
            if (serverQ && serverQ.length > 0) {
              setQuestions(serverQ);
            }
            if (serverS) {
              setSubmissions(serverS);
            }
          } else if (resJson.status === "empty") {
            // First run on new platform deployment - seed server with client datasets
            await fetch("/api/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jabatanList, questions, submissions }),
            });
          }
        }
      } catch (err) {
        console.warn("Could not load central server db, using client defaults:", err);
      } finally {
        setIsLoadingSync(false);
      }
    }
    fetchCentralDatabase();
  }, []);

  // 2. LocalStorage triggers (no automatic, ambient background POST saves to avoid data overwrites)
  useEffect(() => {
    localStorage.setItem("pretest_jabatan_list", JSON.stringify(jabatanList));
  }, [jabatanList]);

  useEffect(() => {
    localStorage.setItem("pretest_questions_list", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("pretest_submissions_list", JSON.stringify(submissions));
  }, [submissions]);

  // Handle multi-quiz catalog initialization & sync fallback
  useEffect(() => {
    // Only run initialization safety checks and selections after initial server fetch concludes
    if (isLoadingSync) return;

    const hasSandi = jabatanList.length > 0 && "sandi" in jabatanList[0];
    if (jabatanList.length === 0 || !hasSandi) {
      setJabatanList(DEFAULT_JABATAN_LIST);
      setQuestions(DEFAULT_QUESTIONS);
      setSubmissions(MOCK_SUBMISSIONS);
      
      const params = new URLSearchParams(window.location.search);
      const kuisParam = params.get("kuis") || params.get("id");
      const initialId = kuisParam && DEFAULT_JABATAN_LIST.some(j => j.id === kuisParam) 
        ? kuisParam 
        : DEFAULT_JABATAN_LIST[0].id;
      setSelectedJabatanId(initialId);
    } else if (!selectedJabatanId && jabatanList.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const kuisParam = params.get("kuis") || params.get("id");
      const initialId = kuisParam && jabatanList.some(j => j.id === kuisParam) 
        ? kuisParam 
        : jabatanList[0].id;
      setSelectedJabatanId(initialId);
    }
  }, [jabatanList, selectedJabatanId, isLoadingSync]);

  // Synchronize current selectedJabatanId to browser URL query parameter so the URL in details matches active quiz selection
  useEffect(() => {
    if (selectedJabatanId && !isLoadingSync) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("kuis") !== selectedJabatanId) {
        url.searchParams.set("kuis", selectedJabatanId);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [selectedJabatanId, isLoadingSync]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikInput.trim() || nikInput.length < 5) {
      alert("Harap masukkan nomor NIK Karyawan yang valid (minimal 5 karakter/digit)!");
      return;
    }
    if (!nameInput.trim()) {
      alert("Harap isi Nama Lengkap Anda!");
      return;
    }
    if (!photoInput) {
      alert("Harap ambil foto wajah lewat webcam atau unggah foto Anda sebelum memulai pre-test!");
      return;
    }

    const targetId = selectedJabatanId || jabatanList[0]?.id;
    const targetJob = jabatanList.find(j => j.id === targetId);
    if (!targetJob) {
      alert("Harap pilih kuis dari dasbor bank soal terlebih dahulu!");
      return;
    }

    // Verify 1-2 digit PIN sandi
    if (sandiInput.trim() !== targetJob.sandi) {
      alert(`Sandi Akses Salah! Paket kuis "${targetJob.name}" terproteksi demi ketertiban pengerjaan ujian. Harap hubungi Pengawas / HRD untuk mendapatkan 2 digit sandi kuis ini.`);
      return;
    }

    // Set Session
    setUserSession({
      nik: nikInput.trim(),
      name: nameInput.trim(),
      jabatanId: targetId,
      startedAt: Date.now(),
      photo: photoInput || undefined
    });

    setCurrentView("test");
  };

  const handleTestSubmit = (answers: { [qId: string]: number }, finalScore: number, timeSpentSeconds: number) => {
    if (!userSession) return;

    const chosenJabatan = jabatanList.find((j) => j.id === userSession.jabatanId)!;
    const isPassed = finalScore >= chosenJabatan.passingScore;
    const certNum = isPassed
      ? `CERT-${chosenJabatan.id.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`
      : undefined;

    const queryForJabatan = questions.filter((q) => q.jabatanId === userSession.jabatanId);
    let correctCount = 0;
    queryForJabatan.forEach((q) => {
      const ansSelected = answers[q.id];
      if (ansSelected !== undefined && ansSelected === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const newSub: Submission = {
      id: "sub_" + Date.now().toString(),
      nik: userSession.nik,
      name: userSession.name,
      jabatanId: userSession.jabatanId,
      jabatanName: chosenJabatan.name,
      score: finalScore,
      totalQuestions: queryForJabatan.length,
      correctAnswersCount: correctCount,
      timeTakenSeconds: timeSpentSeconds,
      timestamp: Date.now(),
      certificateId: certNum,
      isPassed: isPassed,
      answers: answers,
      photo: userSession.photo
    };

    // Add submission locally
    setSubmissions((prev) => [newSub, ...prev]);
    setActiveSubmission(newSub);
    setCurrentView("result");

    // Persist single submission to server safely (this preserves admin edits on other browsers simultaneously)
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission: newSub })
    }).catch(e => console.error("Error submitting test results:", e));
  };

  const handleCancelTest = () => {
    setUserSession(null);
    setCurrentView("home");
  };

  const selectedJobObj = jabatanList.find((j) => j.id === selectedJabatanId);
  const selectedJobQuestions = questions.filter((q) => q.jabatanId === selectedJabatanId);

  // Admin Actions Router handlers
  const handleAddQuestion = (newQ: Question) => {
    const updated = [...questions, newQ];
    setQuestions(updated);
    syncDatabaseToServer(jabatanList, updated, submissions);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    syncDatabaseToServer(jabatanList, updated, submissions);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    const updated = questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    setQuestions(updated);
    syncDatabaseToServer(jabatanList, updated, submissions);
  };

  const handleUpdateJabatanSettings = (updated: Jabatan[]) => {
    setJabatanList(updated);
    syncDatabaseToServer(updated, questions, submissions);
  };

  const handleDeleteSubmission = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    syncDatabaseToServer(jabatanList, questions, updated);
  };

  const handleResetAllData = () => {
    setSubmissions([]); // Clear list
    localStorage.removeItem("pretest_submissions_list");
    syncDatabaseToServer(jabatanList, questions, []);
  };

  const handleLogOutUser = () => {
    setUserSession(null);
    setNikInput("");
    setNameInput("");
    setPhotoInput("");
    setCurrentView("home");
  };

  return (
    <div id="app-root-shell" className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      
      {/* Sidebar Navigation - Left Panel */}
      <aside className="no-print w-full lg:w-64 bg-slate-900 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
        <div className="p-6 lg:p-6 shrink-0 border-b border-slate-800 bg-slate-1000/20">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start select-none">
            <div className="flex items-center gap-3">
              <RegionalHLogo size={42} className="lg:mb-1" />
              <div className="lg:hidden">
                <h1 className="text-white font-black tracking-wider text-base uppercase leading-tight font-sans">
                  REGIONAL H
                </h1>
                <p className="text-teal-400 text-[9px] uppercase tracking-widest font-mono font-bold">
                  PRE-TEST PORTAL
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-white font-black tracking-wider text-xl uppercase leading-tight font-sans">
                REGIONAL H
              </h1>
              <p className="text-teal-400 text-[10px] uppercase tracking-widest mt-0.5 font-mono font-bold">
                PRE-TEST PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-grow px-4 pb-4 lg:py-2 space-y-2 flex flex-col sm:flex-row lg:flex-col sm:space-y-0 lg:space-y-2 sm:gap-2 lg:gap-0">
          <button
            onClick={() => currentView !== "test" && setCurrentView("home")}
            disabled={currentView === "test"}
            className={`w-full text-left flex items-center space-x-3 p-3 rounded-none border-l-4 transition-all uppercase tracking-wider text-xs font-bold cursor-pointer disabled:opacity-50 select-none ${
              currentView === "home" || currentView === "result"
                ? "bg-slate-800 text-white border-teal-500"
                : "text-slate-400 hover:bg-slate-800 hover:text-white border-transparent"
            }`}
          >
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => currentView !== "test" && setCurrentView("leaderboard")}
            disabled={currentView === "test"}
            className={`w-full text-left flex items-center space-x-3 p-3 rounded-none border-l-4 transition-all uppercase tracking-wider text-xs font-bold cursor-pointer disabled:opacity-50 select-none ${
              currentView === "leaderboard"
                ? "bg-slate-800 text-white border-teal-500"
                : "text-slate-400 hover:bg-slate-800 hover:text-white border-transparent"
            }`}
          >
            <span>Papan Juara</span>
          </button>
        </nav>

        {/* Bottom Profile Details Section */}
        <div className="p-6 border-t border-slate-800 mt-auto hidden lg:block select-none bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-700 rounded-none flex items-center justify-center text-white font-mono text-xs font-extrabold shadow-xs uppercase shrink-0">
              {nameInput ? nameInput.substring(0, 2) : "BD"}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate font-mono">
                {nikInput ? `NIK: ${nikInput}` : "NIK: 1994021102"}
              </p>
              <p className="text-slate-450 text-[10px] uppercase truncate">
                {nameInput || "Budi Darmawan"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Center & Right Panels */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Header / Utility Bar */}
        <header className="no-print h-20 bg-white border-b border-slate-205 flex items-center justify-between px-6 sm:px-10 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-teal-500"></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono">
              {currentView === "test" ? "Status: Ujian Guna Kualifikasi" : "Status: Terhubung"}
            </span>
          </div>
          <div className="flex space-x-4">
            {userSession && (
              <button
                onClick={handleLogOutUser}
                className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 rounded-none transition"
              >
                Keluar
              </button>
            )}
          </div>
        </header>

        {/* Main Workspace Frame container */}
        <div className="p-6 sm:p-10 flex-grow flex flex-col">
        {/* Core Home Navigation */}
        {currentView === "home" && (
          <div className="space-y-8 animate-fade-in flex-grow flex flex-col justify-between">
            {/* Landing Banner */}
            <div className="bg-white border-2 border-slate-900 rounded-none p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 justify-between relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
              <div className="space-y-2 lg:max-w-2xl text-center lg:text-left">
                <span className="inline-flex px-2.5 py-1 rounded-none text-[10px] font-black bg-teal-100 text-teal-800 tracking-widest font-mono">
                  REGIONAL H • ASESMEN KOMPETENSI MANDIRI 2026
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 leading-none col-span-2">
                  Uji Kompetensi & Kualifikasi Dasar Karyawan REGIONAL H
                </h2>
                <p className="text-xs md:text-sm text-slate-550 leading-relaxed">
                  Selamat datang di portal asesmen pembelajaran mandiri. Silakan masukkan nomor identitas NIK, pilih klasifikasi jabatan kerja Anda, dan selesaikan soal ujian guna penerbitan Sertifikat Uji Kompetensi Dasar untuk verifikasi HRD.
                </p>
              </div>

              {/* Brand Logo Accent */}
              <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 shrink-0 rounded-none w-36 text-center select-none">
                <RegionalHLogo size={76} />
                <span className="text-[10px] font-black tracking-widest text-[#009646] font-sans mt-2">REGIONAL H</span>
              </div>
            </div>

            {/* Alur & Aturan Ujian - Moved to second position before Starting Pre-Test Form */}
            <div className="bg-slate-950 text-white border-2 border-slate-900 rounded-none p-6 space-y-4 relative overflow-hidden animate-fade-in shadow-[6px_6px_0px_0px_rgba(13,148,136,0.35)] hover:shadow-[8px_8px_0px_0px_rgba(13,148,136,0.45)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-teal-700/20 pointer-events-none text-teal-400"></div>

              <h4 className="text-xs font-bold font-mono text-teal-400 uppercase tracking-widest pb-2 border-b border-teal-950 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Alur & Aturan Ujian
              </h4>

              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-xs text-slate-300 list-disc pl-5 leading-relaxed">
                <li>Isian nomor <strong className="text-white">NIK</strong> dan <strong className="text-white font-bold">Nama</strong> resmi wajib diisi presisi sebagai validitas cetak sertifikat.</li>
                <li>Waktu ujian berjalan terus (Real-time) di server dan sistem client. Jangan menutup atau merefresh tab browser saat pengerjaan berlangsung.</li>
                <li>Sistem akan <strong className="text-white font-bold">Auto-Submit otomatis</strong> jika batas waktu berakhir.</li>
                <li>Peserta dinyatakan LULUS apabila memperoleh nilai di atas ambang batas (KKM) jabatan.</li>
                <li className="md:col-span-2 lg:col-span-1">Peserta yang lulus berhak langsung mengunduh <strong className="text-teal-300 font-bold">Sertifikat Kelulusan Resmi</strong> (PDF/PNG).</li>
              </ul>
            </div>

            {/* Layout Login Gate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input NIK & Pilih Jabatan */}
              <div className="lg:col-span-7 bg-white rounded-none border-2 border-slate-900 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-lg font-black uppercase text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                  <Play className="w-4 h-4 text-teal-605 font-bold animate-pulse" />
                  Mulai Lembar Jawaban Pre-Test
                </h3>

                <form onSubmit={handleStartExam} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1.5 uppercase font-mono">NOMOR INDUK KARYAWAN (NIK)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 317201090..."
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-none text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1.5 uppercase font-mono">NAMA LENGKAP PESERTA</label>
                      <input
                        type="text"
                        placeholder="Contoh: Andi Wijaya"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-none text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-sans shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Photo Capture & Upload Widget */}
                  <div className="pt-2">
                    <PhotoCapture photo={photoInput} onChange={setPhotoInput} />
                  </div>

                  {/* Dasbor Bank Soal (Quiz Catalog Dashboard) */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      DASBOR BANK SOAL / DAFTAR PILIHAN KUIS ({jabatanList.length})
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jabatanList.map((jab) => {
                        const isSelected = selectedJabatanId === jab.id;
                        const jobQCount = questions.filter((q) => q.jabatanId === jab.id).length;
                        return (
                          <div
                            key={jab.id}
                            onClick={() => {
                              setSelectedJabatanId(jab.id);
                              setSandiInput(""); // Clear PIN entry when changing quiz
                            }}
                            className={`p-4 text-left cursor-pointer transition-all duration-150 rounded-none relative overflow-hidden flex flex-col justify-between h-36 ${
                              isSelected
                                ? "bg-teal-50/70 border-2 border-teal-600 shadow-[4px_4px_0px_0px_#0d9488] -translate-x-0.5 -translate-y-0.5"
                                : "bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-black uppercase text-slate-900 tracking-tight leading-snug">
                                  {jab.name}
                                </h4>
                                {isSelected ? (
                                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const shareUrl = `${window.location.origin}${window.location.pathname}?kuis=${jab.id}`;
                                        navigator.clipboard.writeText(shareUrl)
                                          .then(() => alert(`Tautan kuis "${jab.name}" berhasil disalin! Kirimkan link ini ke calon peserta.`))
                                          .catch(() => alert("Gagal menyalin link."));
                                      }}
                                      className="px-1.5 py-0.5 text-[8px] font-bold bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 rounded-none cursor-pointer"
                                      title="Salin Tautan Kuis"
                                    >
                                      BAGIKAN
                                    </button>
                                    <span className="bg-teal-500 border border-slate-900 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-none font-mono">
                                      AKTIF
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const shareUrl = `${window.location.origin}${window.location.pathname}?kuis=${jab.id}`;
                                        navigator.clipboard.writeText(shareUrl)
                                          .then(() => alert(`Tautan kuis "${jab.name}" berhasil disalin!`))
                                          .catch(() => alert("Gagal menyalin link."));
                                      }}
                                      className="px-1.5 py-0.5 text-[8px] font-medium bg-slate-100 hover:bg-slate-200 border border-slate-205 text-slate-600 rounded-none cursor-pointer"
                                      title="Salin Tautan Kuis"
                                    >
                                      BAGIKAN
                                    </button>
                                    <span className="bg-slate-100 border border-slate-205 text-slate-600 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-none flex items-center gap-0.5">
                                      SECURE
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-snug font-sans">
                                {jab.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] text-slate-500 font-bold uppercase font-mono mt-1">
                              <span className="text-teal-700 font-extrabold">{jobQCount} Soal</span>
                              <span>•</span>
                              <span>{jab.timeLimitMinutes} Menit</span>
                              <span>•</span>
                              <span>KKM: {jab.passingScore}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Digit Passcode / Sandi Entry Widget */}
                  {selectedJobObj && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-500 shadow-[4px_4px_0px_0px_#f59e0b] rounded-none space-y-2.5 animate-fade-in text-left">
                      <div className="flex items-center gap-1.5 text-amber-900 font-extrabold font-mono text-[10px] uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5 text-amber-720" />
                        Akses Kunci Kuis "{selectedJobObj.name}"
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="text"
                          maxLength={2}
                          value={sandiInput}
                          placeholder="PIN.."
                          onChange={(e) => setSandiInput(e.target.value.replace(/\D/g, "").slice(0, 2))}
                          className="px-3 py-2 bg-white border-2 border-amber-400 text-slate-800 text-center font-black font-mono tracking-widest text-lg w-full sm:w-28 rounded-none outline-none focus:border-amber-600 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                          required
                        />
                        <span className="text-[10px] text-amber-800 leading-snug">
                          *Materi kuis terproteksi sandi pengawas. Masukkan 1-2 digit pin kuis untuk konfirmasi verifikasi pengerjaan.
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedJobQuestions.length === 0 ? (
                    <div className="p-4 bg-rose-50 text-rose-850 rounded-none border-2 border-rose-500 text-xs flex gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Peringatan!</strong> Kuis pilihan Anda tidak memiliki pertanyaan aktif di bank soal. Silakan hubungi Administrator.
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full text-center py-4 bg-teal-500 hover:bg-teal-400 border-2 border-slate-900 text-slate-950 font-black text-xs uppercase tracking-wider rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                    >
                      Mulai Pre-Test Sekarang
                    </button>
                  )}
                </form>
              </div>

              {/* Side features details info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-none border-2 border-slate-900 p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
                  <h4 className="text-xs font-black uppercase tracking-wider mb-4 font-mono text-slate-900">Informasi Kelulusan Terbaru</h4>
                  <div className="space-y-3 text-xs">
                    {submissions.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                        <div>
                          <div className="font-black text-slate-900 uppercase font-sans tracking-tight">{sub.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.jabatanName}</div>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-none border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] ${sub.isPassed ? "bg-emerald-55 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                            Skor: {sub.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Pre-Test Portal View */}
        {currentView === "test" && userSession && selectedJobObj && (
          <TestPortal
            userSession={userSession}
            questions={selectedJobQuestions}
            jabatan={selectedJobObj}
            onSubmit={handleTestSubmit}
            onCancel={handleCancelTest}
          />
        )}

        {/* Results Scoring Panel */}
        {currentView === "result" && activeSubmission && (
          <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-md text-center space-y-6">
              <div className="flex justify-center flex-col items-center">
                {activeSubmission.isPassed ? (
                  <div className="p-4 bg-emerald-100 text-emerald-800 rounded-full w-20 h-20 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="p-4 bg-rose-100 text-rose-800 rounded-full w-20 h-20 flex items-center justify-center mb-3">
                    <XCircle className="w-12 h-12" />
                  </div>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Pre-Test Selesai Dievaluasi
                </span>
                <h2 className="text-2xl font-bold font-display text-slate-800 mt-2">Daftar Rekapitulasi Penilaian</h2>
                <p className="text-xs text-slate-405">
                  NIK: {activeSubmission.nik} • Nama: {activeSubmission.name}
                </p>
              </div>

              {/* Central radial / giant score board */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-6 max-w-sm mx-auto flex items-center justify-around gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKOR AKHIR</div>
                  <div className="text-5xl font-extrabold font-mono text-teal-850 leading-none">
                    {activeSubmission.score}%
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200"></div>

                <div className="text-left py-1 text-xs space-y-1 text-slate-600">
                  <div>Status: <strong className={activeSubmission.isPassed ? "text-emerald-700" : "text-rose-600"}>{activeSubmission.isPassed ? "LULUS" : "BELUM LULUS"}</strong></div>
                  <div>Jawaban Benar: <strong className="text-slate-800">{activeSubmission.correctAnswersCount} / {activeSubmission.totalQuestions}</strong></div>
                  <div>Waktu: <strong className="text-slate-800">{Math.floor(activeSubmission.timeTakenSeconds / 60)}m {activeSubmission.timeTakenSeconds % 60}s</strong></div>
                </div>
              </div>

              {/* Status helper text & Next Action buttons */}
              <div className="space-y-4">
                {activeSubmission.isPassed ? (
                  <div className="text-xs text-slate-500 max-w-lg mx-auto">
                    Keren! Anda telah berhasil mencapai kriteria batas kelulusan (KKM). Silakan klik <strong className="text-slate-850">Cetak Sertifikat</strong> di bawah guna mencetak berkas sertifikat kelulusan formal Anda.
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 max-w-lg mx-auto">
                    Sayang sekali, skor Anda belum melampaui kriteria lulus minimum (KKM) yang dipersyaratkan. Silakan kembali melatih kemampuan, mintalah materi ke evaluator, dan klik tombol pengerjaan ulang guna mengulang pre-test.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleLogOutUser}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-705 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Halaman Utama (Logout)
                  </button>

                  <button
                    onClick={() => setCurrentView("leaderboard")}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-705 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Lihat Papan Juara / Ranking
                  </button>

                  {activeSubmission.isPassed && (
                    <button
                      onClick={() => setCurrentView("certificate")}
                      className="px-5 py-2.5 bg-teal-800 hover:bg-teal-950 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4 text-amber-350" />
                      Cetak Sertifikat Kelulusan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Answer audit review breakdown */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-850">Koreksi Lembar Jawaban</h3>
              <p className="text-xs text-slate-400">Tinjau koreksi pengerjaan kesalahan dan kebenaran untuk pembelajaran mandiri.</p>

              <div className="space-y-4 pt-2">
                {questions
                  .filter((q) => q.jabatanId === activeSubmission.jabatanId)
                  .map((q, idx) => {
                    const chosenIdx = activeSubmission.answers[q.id];
                    const isCorrect = chosenIdx === q.correctOptionIndex;

                    return (
                      <div key={q.id} className="p-4 rounded-2xl border text-xs space-y-3 bg-slate-50/50">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 leading-normal">
                            {idx + 1}. {q.questionText}
                          </h4>
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              Benar (+{q.points} Poin)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                              Salah (0 Poin)
                            </span>
                          )}
                        </div>

                        {/* Options breakdown */}
                        <div className="space-y-2 pl-2">
                          {q.options.map((opt, oIdx) => {
                            const isChosenByMe = chosenIdx === oIdx;
                            const isRealCorrect = oIdx === q.correctOptionIndex;

                            let optBorder = "border-slate-205 bg-white";
                            let checkWidget = null;

                            if (isRealCorrect) {
                              optBorder = "border-emerald-3D0 bg-emerald-50 text-emerald-990 font-semibold";
                              checkWidget = <span className="text-[9px] uppercase font-bold text-emerald-700">(Kunci Jawaban Correct)</span>;
                            } else if (isChosenByMe && !isCorrect) {
                              optBorder = "border-rose-300 bg-rose-50 text-rose-900";
                              checkWidget = <span className="text-[9px] uppercase font-bold text-rose-700">(Pilihan Anda yang Salah)</span>;
                            }

                            return (
                              <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-4 text-[11px] ${optBorder}`}>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span>{opt}</span>
                                </div>
                                {checkWidget}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Section View only */}
        {currentView === "certificate" && activeSubmission && (
          <Certificate
            submission={activeSubmission}
            onBack={() => {
              setCurrentView("home");
            }}
          />
        )}

        {/* Leaderboards Peringkat board */}
        {currentView === "leaderboard" && (
          <div className="space-y-6">
            <Leaderboard submissions={submissions} jabatanList={jabatanList} />
          </div>
        )}

        {/* Admin Configurations Panels */}
        {currentView === "admin" && (
          <AdminPanel
            questions={questions}
            jabatanList={jabatanList}
            submissions={submissions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onUpdateJabatanSettings={handleUpdateJabatanSettings}
            onDeleteSubmission={handleDeleteSubmission}
            onResetAllData={handleResetAllData}
            onViewCertificateForSubmission={(sub) => {
              setActiveSubmission(sub);
              setCurrentView("certificate");
            }}
          />
        )}
        </div>
      </main>

      {/* Corporate footer info */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-slate-400 text-xs text-center font-medium relative">
        <p>© 2026 E-Pretest Karyawan. Hak Cipta Dilindungi. Sistem Manajemen Pengendalian Mutu & HRD Regional.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-350">Platform Mandiri v2.0 • Offline Local Sync</p>
      </footer>

      {/* Small floating admin button at the bottom corner - Restyled to be clean, white, visible, yet subtle and low-profile */}
      {currentView !== "test" && (
        <button
          id="floating-admin-trigger"
          onClick={() => setCurrentView(currentView === "admin" ? "home" : "admin")}
          className="no-print fixed bottom-4 right-4 z-50 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 flex items-center justify-center w-8 h-8 shadow-sm transition duration-150 cursor-pointer select-none rounded-md outline-none"
          title="Confidential Panel Access"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
