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
  HelpCircle
} from "lucide-react";

import Leaderboard from "./components/Leaderboard";
import Certificate from "./components/Certificate";
import TestPortal from "./components/TestPortal";
import AdminPanel from "./components/AdminPanel";
import RegionalHLogo from "./components/RegionalHLogo";

import { DEFAULT_JABATAN_LIST, DEFAULT_QUESTIONS, MOCK_SUBMISSIONS } from "./data";
import { Jabatan, Question, Submission, UserSession } from "./types";

export default function App() {
  // Persistence Loading from LocalStorage
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

  // Running State for Exam results
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("pretest_jabatan_list", JSON.stringify(jabatanList));
  }, [jabatanList]);

  useEffect(() => {
    localStorage.setItem("pretest_questions_list", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("pretest_submissions_list", JSON.stringify(submissions));
  }, [submissions]);

  // Migration to single Pre-Test mode and set default selected ID on mount
  useEffect(() => {
    if (jabatanList.length !== 1 || jabatanList[0].id !== "pretest_umum") {
      setJabatanList(DEFAULT_JABATAN_LIST);
      setQuestions(DEFAULT_QUESTIONS);
      setSubmissions(MOCK_SUBMISSIONS);
      setSelectedJabatanId("pretest_umum");
      localStorage.setItem("pretest_jabatan_list", JSON.stringify(DEFAULT_JABATAN_LIST));
      localStorage.setItem("pretest_questions_list", JSON.stringify(DEFAULT_QUESTIONS));
      localStorage.setItem("pretest_submissions_list", JSON.stringify(MOCK_SUBMISSIONS));
    } else {
      setSelectedJabatanId("pretest_umum");
    }
  }, [jabatanList]);

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

    const targetId = selectedJabatanId || "pretest_umum";

    // Set Session
    setUserSession({
      nik: nikInput.trim(),
      name: nameInput.trim(),
      jabatanId: targetId,
      startedAt: Date.now()
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
      answers: answers
    };

    // Add submission
    setSubmissions((prev) => [newSub, ...prev]);
    setActiveSubmission(newSub);
    setCurrentView("result");
  };

  const handleCancelTest = () => {
    setUserSession(null);
    setCurrentView("home");
  };

  const selectedJobObj = jabatanList.find((j) => j.id === selectedJabatanId);
  const selectedJobQuestions = questions.filter((q) => q.jabatanId === selectedJabatanId);

  // Admin Actions Router handlers
  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
  };

  const handleUpdateJabatanSettings = (updated: Jabatan[]) => {
    setJabatanList(updated);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetAllData = () => {
    setSubmissions([]); // Clear list
    localStorage.removeItem("pretest_submissions_list");
  };

  const handleLogOutUser = () => {
    setUserSession(null);
    setNikInput("");
    setNameInput("");
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

          <div className="hidden lg:block pt-6 pb-2">
            <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest px-3 font-mono">Admin Panel</p>
          </div>

          <button
            onClick={() => currentView !== "test" && setCurrentView("admin")}
            disabled={currentView === "test"}
            className={`w-full text-left flex items-center space-x-3 p-3 rounded-none border-l-4 transition-all uppercase tracking-wider text-xs font-bold cursor-pointer disabled:opacity-50 select-none ${
              currentView === "admin"
                ? "bg-slate-800 text-white border-teal-500"
                : "text-slate-400 hover:bg-slate-800 hover:text-white border-transparent"
            }`}
          >
            <span>Kelola Portal</span>
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
            <div className="bg-white border border-slate-200 rounded-none p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 justify-between relative overflow-hidden">
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
              <div className="hidden lg:flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 shadow-sm shrink-0 rounded-none w-36 text-center select-none">
                <RegionalHLogo size={76} />
                <span className="text-[10px] font-black tracking-widest text-[#009646] font-sans mt-2">REGIONAL H</span>
              </div>
            </div>

            {/* Layout Login Gate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input NIK & Pilih Jabatan */}
              <div className="lg:col-span-7 bg-white rounded-none border border-slate-200 p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-black uppercase text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                  <Play className="w-4 h-4 text-teal-600 font-bold" />
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
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-none text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono"
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
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-none text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* General Pre-Test Information Card instead of selection */}
                  {selectedJobObj && (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-none text-left flex items-start gap-4">
                      <div className="p-3 bg-teal-50 border border-teal-150 text-teal-800 rounded-none">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase text-slate-900 tracking-tight font-sans">
                            {selectedJobObj.name}
                          </h4>
                          <span className="bg-teal-100 text-teal-850 text-[10px] font-extrabold px-2.5 py-0.5 rounded-none font-mono">
                            {selectedJobQuestions.length} Soal
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{selectedJobObj.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[10px] text-slate-500 font-bold uppercase font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            Batas Waktu: {selectedJobObj.timeLimitMinutes} Menit
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>KKM Kelulusan: {selectedJobObj.passingScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJobQuestions.length === 0 ? (
                    <div className="p-4 bg-rose-50/50 text-rose-800 rounded-none border border-rose-200 text-xs flex gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Peringatan!</strong> Bank data belum memiliki pertanyaan pre-test aktif. Hubungi Administrator untuk membuat soal baru di Admin Panel.
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full text-center py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-none transition duration-150 cursor-pointer"
                    >
                      Mulai Pre-Test Sekarang
                    </button>
                  )}
                </form>
              </div>

              {/* Side features details info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900 text-white border border-slate-850 rounded-none p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-teal-700/20"></div>

                  <h4 className="text-xs font-bold font-mono text-teal-400 uppercase tracking-widest pb-2 border-b border-slate-800">
                    Alur & Aturan Ujian
                  </h4>

                  <ul className="space-y-4 text-xs text-slate-400 pl-4 list-disc leading-relaxed">
                    <li>Isian nomor <strong className="text-white">NIK</strong> dan <strong className="text-white">Nama</strong> resmi wajib diisi presisi sebagai validitas cetak sertifikat.</li>
                    <li>Waktu ujian berjalan terus (Real-time) di server dan sistem client. Jangan menutup atau merefresh tab browser saat pengerjaan berlangsung.</li>
                    <li>Sistem akan <strong className="text-white font-bold">Auto-Submit otomatis</strong> jika batas waktu berakhir.</li>
                    <li>Peserta dinyatakan LULUS apabila memperoleh nilai di atas ambis KKM minimal jabatan.</li>
                    <li>Peserta yang lulus berhak langsung mengunduh <strong className="text-teal-200">Sertifikat Kelulusan Resmi</strong> (PDF/PNG).</li>
                  </ul>
                </div>

                <div className="bg-white rounded-none border border-slate-200 p-5 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider mb-4 font-mono text-slate-900">Informasi Kelulusan Terbaru</h4>
                  <div className="space-y-3 text-xs">
                    {submissions.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                        <div>
                          <div className="font-black text-slate-900 uppercase font-sans tracking-tight">{sub.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.jabatanName}</div>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-none ${sub.isPassed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
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
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-slate-400 text-xs text-center font-medium">
        <p>© 2026 E-Pretest Karyawan. Hak Cipta Dilindungi. Sistem Manajemen Pengendalian Mutu & HRD Regional.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-350">Platform Mandiri v2.0 • Offline Local Sync</p>
      </footer>
    </div>
  );
}
