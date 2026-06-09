/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  ChevronRight,
  Settings,
  Percent,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Briefcase,
  Edit,
  Download
} from "lucide-react";
import { Question, Jabatan, Submission } from "../types";
import RegionalHLogo from "./RegionalHLogo";

interface AdminPanelProps {
  questions: Question[];
  jabatanList: Jabatan[];
  submissions: Submission[];
  onAddQuestion: (newQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (updatedQuestion: Question) => void;
  onUpdateJabatanSettings: (updatedJabatanList: Jabatan[]) => void;
  onDeleteSubmission: (id: string) => void;
  onResetAllData: () => void;
  onViewCertificateForSubmission: (sub: Submission) => void;
}

export default function AdminPanel({
  questions,
  jabatanList,
  submissions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onUpdateJabatanSettings,
  onDeleteSubmission,
  onResetAllData,
  onViewCertificateForSubmission
}: AdminPanelProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem("pretest_admin_password") || "admin";
  });
  const [newSandi, setNewSandi] = useState("");
  const [confirmSandi, setConfirmSandi] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "submissions" | "settings">("overview");

  // State for editing question
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // State for adding new question
  const [selectedJabatanForQuestion, setSelectedJabatanForQuestion] = useState<string>(jabatanList[0]?.id || "");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectIdx, setNewQuestionCorrectIdx] = useState<number>(0);
  const [newQuestionPoints, setNewQuestionPoints] = useState<number>(20);
  const [manageSelectedJabatan, setManageSelectedJabatan] = useState<string>(jabatanList[0]?.id || "all");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Sandi Salah! (Gunakan sandi kustom yang telah Anda set, atau sandi default: admin)");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordToSave = newSandi.trim();
    if (!passwordToSave) {
      alert("Kata sandi baru tidak boleh kosong!");
      return;
    }
    if (passwordToSave.length < 3) {
      alert("Kata sandi terlalu pendek! Minimal 3 karakter.");
      return;
    }
    if (newSandi !== confirmSandi) {
      alert("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setAdminPassword(passwordToSave);
    localStorage.setItem("pretest_admin_password", passwordToSave);
    setNewSandi("");
    setConfirmSandi("");
    alert("Sukses! Kata sandi admin berhasil diperbarui secara kustom!");
  };

  // Stats calculation
  const totalSubmissionsCount = submissions.length;
  const passedCount = submissions.filter((s) => s.isPassed).length;
  const averageScore = Math.round(
    submissions.reduce((sum, s) => sum + s.score, 0) / (totalSubmissionsCount || 1)
  );
  const passRate = Math.round((passedCount / (totalSubmissionsCount || 1)) * 100);

  const filteredQuestions = questions.filter(
    (q) => manageSelectedJabatan === "all" || q.jabatanId === manageSelectedJabatan
  );

  const handleCreateQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newQuestionOptions.some((o) => !o.trim())) {
      alert("Harap lengkapi semua isian teks pertanyaan beserta seluruh opsi pilihan jawaban!");
      return;
    }

    if (editingQuestion) {
      const updatedQuestion: Question = {
        id: editingQuestion.id,
        jabatanId: selectedJabatanForQuestion,
        questionText: newQuestionText,
        options: [...newQuestionOptions],
        correctOptionIndex: newQuestionCorrectIdx,
        points: Number(newQuestionPoints) || 20,
      };

      onUpdateQuestion(updatedQuestion);
      setEditingQuestion(null);
      alert("Pertanyaan pre-test berhasil diperbarui!");
    } else {
      const createdQuestion: Question = {
        id: "q_" + Date.now().toString(),
        jabatanId: selectedJabatanForQuestion,
        questionText: newQuestionText,
        options: [...newQuestionOptions],
        correctOptionIndex: newQuestionCorrectIdx,
        points: Number(newQuestionPoints) || 20,
      };

      onAddQuestion(createdQuestion);
      alert("Pertanyaan pre-test berhasil dibuat dan ditambahkan!");
    }

    // Reset form
    setNewQuestionText("");
    setNewQuestionOptions(["", "", "", ""]);
    setNewQuestionCorrectIdx(0);
    setNewQuestionPoints(20);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...newQuestionOptions];
    updated[idx] = val;
    setNewQuestionOptions(updated);
  };

  const updateThresholdSetting = (jabId: string, field: "passingScore" | "timeLimitMinutes", val: number) => {
    const updated = jabatanList.map((j) => {
      if (j.id === jabId) {
        return {
          ...j,
          [field]: val,
        };
      }
      return j;
    });
    onUpdateJabatanSettings(updated);
  };

  const handleExportExcel = () => {
    if (submissions.length === 0) {
      alert("Belum ada data pre-test yang dapat diunduh!");
      return;
    }

    const headers = [
      "NIK",
      "Nama Peserta",
      "Kategori Jabatan",
      "Skor Akhir",
      "Jawaban Benar",
      "Total Soal",
      "Waktu Pengerjaan (Detik)",
      "Durasi Membaca",
      "Kualifikasi Kelulusan",
      "Tanggal Ujian"
    ];

    // Force Excel to understand semicolon separator in different regional environments using sep=;
    let csvContent = "sep=;\r\n";
    csvContent += headers.join(";") + "\r\n";

    submissions.forEach((sub) => {
      const status = sub.isPassed ? "LULUS" : "GAGAL";
      const dateStr = new Date(sub.timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      const duration = `${Math.floor(sub.timeTakenSeconds / 60)} menit ${sub.timeTakenSeconds % 60} detik`;
      const row = [
        `"${sub.nik}"`, // quote NIK to avoid converting long numbers into scientific format or dropping leading zeroes
        `"${sub.name}"`,
        `"${sub.jabatanName}"`,
        sub.score,
        sub.correctAnswersCount,
        sub.totalQuestions,
        sub.timeTakenSeconds,
        `"${duration}"`,
        status,
        `"${dateStr}"`
      ];
      csvContent += row.join(";") + "\r\n";
    });

    try {
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Hasil_PreTest_HRD_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export Excel error", err);
      alert("Gagal mengunduh Excel!");
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div id="admin-login-lock" className="max-w-md mx-auto bg-white rounded-none border border-slate-200 p-6 md:p-8 shadow-xs py-12 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center justify-center mb-1 gap-2">
            <RegionalHLogo size={60} />
            <span className="text-[10px] font-black tracking-widest text-[#009646] font-sans">REGIONAL H</span>
          </div>
          <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight font-sans">Autentikasi Admin</h2>
          <p className="text-xs text-slate-500">
            Panel ini terproteksi untuk keperluan Manajemen HRD/Evaluator. Masukkan kata sandi default untuk melanjutkan.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1.5 uppercase font-mono">KATA SANDI ADMIN</label>
            <input
              type="password"
              placeholder="Masukkan sandi..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono uppercase tracking-wide"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {adminPassword === "admin" ? (
                <span>Hint kata sandi default: <strong className="text-teal-700">admin</strong></span>
              ) : (
                <span className="text-emerald-700 font-semibold font-mono uppercase tracking-tight">Sandi Kustom Aktif</span>
              )}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50/50 text-rose-800 border border-rose-200 rounded-none text-xs font-bold font-mono uppercase">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-center py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-none transition cursor-pointer uppercase tracking-wider"
          >
            Masuk ke Panel Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="admin-authenticated-panel" className="space-y-6">
      {/* Top Banner section */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-none p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Abstract design elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-900/30"></div>

        <div className="relative space-y-1.5 z-10 text-center md:text-left">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-850 border border-teal-800 tracking-wide text-teal-300">
            MODE ADMIN AKTIF
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">Dashboard Kelola Pre-Test REGIONAL H</h2>
          <p className="text-xs text-teal-200">
            Kelola list materi pertanyaan, atur standardisasi nilai kelulusan, dan review partisipasi calon karyawan.
          </p>
        </div>

        <button
          onClick={() => setIsAdminAuthenticated(false)}
          className="no-print relative z-10 inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-750 font-black text-xs text-slate-200 px-4 py-2.5 rounded-none transition cursor-pointer uppercase font-mono tracking-wider"
        >
          Logout Admin
        </button>
      </div>

      {/* Admin Tab Navigation */}
      <div className="no-print flex border-b border-slate-200 overflow-x-auto pb-0.5 whitespace-nowrap">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "overview"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Ikhtisar Analitik
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "questions"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Bank Soal ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "submissions"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Daftar Hasil Pre-Test ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "settings"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Konfigurasi Aturan
        </button>
      </div>

      {/* Grid Content Tabs */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Bento Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-none border border-slate-204 p-5 shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-none text-teal-705">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Peserta</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalSubmissionsCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-none border border-slate-204 p-5 shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-none text-emerald-705">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Peserta Lulus</div>
                <div className="text-2xl font-bold text-emerald-800 mt-0.5">{passedCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-none border border-slate-204 p-5 shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-none text-amber-605">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rata-rata Kelulusan</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{passRate}%</div>
              </div>
            </div>

            <div className="bg-white rounded-none border border-slate-204 p-5 shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-none text-blue-605">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rerata Skor Ujian</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{averageScore}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-none border border-slate-204 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Partisipasi Terbaru Peserta</h3>
              <div className="divide-y divide-slate-100">
                {submissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between text-xs gap-4 hover:bg-slate-50/40 px-2 rounded-none border-b border-dashed border-slate-100 transition">
                    <div>
                      <div className="font-bold text-slate-800">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">NIK: {sub.nik} • {sub.jabatanName}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-slate-755">Skor: {sub.score}</div>
                        <div className="text-[10px] text-slate-400">{sub.correctAnswersCount}/{sub.totalQuestions} Benar</div>
                      </div>
                      {sub.isPassed ? (
                        <span className="px-2 py-0.5 rounded-none text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">LULUS</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-none text-[9px] font-bold bg-rose-50 text-rose-805 border border-rose-200 font-mono">GAGAL</span>
                      )}
                    </div>
                  </div>
                ))}
                {totalSubmissionsCount === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">Belum ada peserta pre-test yang masuk menduduki rekapitulasi.</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-none border border-slate-204 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Spesifikasi Pre-Test</h3>
              <div className="space-y-3">
                {jabatanList.map((jab) => {
                  const qCount = questions.filter((q) => q.jabatanId === jab.id).length;
                  return (
                    <div key={jab.id} className="p-3 bg-slate-50 rounded-none border border-slate-150 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-805">{jab.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Batas: {jab.timeLimitMinutes} Menit • KKM: {jab.passingScore}%</div>
                      </div>
                      <div className="font-mono font-black text-teal-800 bg-teal-100 px-2 py-1 rounded-none border border-teal-200">
                        {qCount} Soal
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Add Question panel card */}
          <div className="xl:col-span-5 bg-white rounded-none border border-slate-200 p-5 shadow-xs space-y-4" id="soal-editor-card">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between pb-2 border-b border-slate-100" id="soal-editor-title">
              <span className="flex items-center gap-1.5">
                {editingQuestion ? <Edit className="w-4 h-4 text-teal-655 animate-pulse" /> : <Plus className="w-4 h-4 text-teal-700" />}
                {editingQuestion ? "Edit Soal / Pertanyaan" : "Buat Pertanyaan Baru"}
              </span>
              {editingQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setNewQuestionText("");
                    setNewQuestionOptions(["", "", "", ""]);
                    setNewQuestionCorrectIdx(0);
                    setNewQuestionPoints(20);
                  }}
                  className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-800 tracking-wider font-mono underline"
                >
                  Batal
                </button>
              )}
            </h3>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">PERTANYAAN (SOAL)</label>
                <textarea
                  placeholder="Ketik deskripsi lengkap kalimat pertanyaan..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none"
                  required
                ></textarea>
              </div>

              {/* Options lists inputs */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-500">OPSI PILIHAN JAWABAN</label>
                {newQuestionOptions.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                    <input
                      type="text"
                      placeholder={`Isi pilihan ke-${oIdx + 1}...`}
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="radio"
                      name="correct-option-radio"
                      checked={newQuestionCorrectIdx === oIdx}
                      onChange={() => setNewQuestionCorrectIdx(oIdx)}
                      title="Set sebagai jawaban benar"
                      className="w-4 h-4 accent-teal-750 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">BOBOT POIN SOAL</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full text-center py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-none transition cursor-pointer uppercase tracking-wider font-mono"
                  >
                    {editingQuestion ? "Simpan Perubahan" : "Simpan Pertanyaan"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of active questions panel */}
          <div className="xl:col-span-7 bg-white rounded-none border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Daftar Soal Tersimpan
              </h3>
            </div>

            {/* List scroll */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, qIndex) => {
                  const targetJob = jabatanList.find((j) => j.id === q.jabatanId);

                  return (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-none border border-slate-200 space-y-2 text-xs hover:border-slate-300 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-none bg-teal-100 text-teal-850 font-black font-mono uppercase tracking-wider text-[9px]">
                              Pre-Test Karyawan
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Poin: {q.points}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs leading-relaxed">
                            {qIndex + 1}. {q.questionText}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setSelectedJabatanForQuestion(q.jabatanId);
                              setNewQuestionText(q.questionText);
                              setNewQuestionOptions([...q.options]);
                              setNewQuestionCorrectIdx(q.correctOptionIndex);
                              setNewQuestionPoints(q.points);
                              document.getElementById("soal-editor-title")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            title="Edit soal"
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 rounded-none transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Hapus soal pre-test ini?")) {
                                if (editingQuestion?.id === q.id) {
                                  setEditingQuestion(null);
                                  setNewQuestionText("");
                                  setNewQuestionOptions(["", "", "", ""]);
                                  setNewQuestionCorrectIdx(0);
                                  setNewQuestionPoints(20);
                                }
                                onDeleteQuestion(q.id);
                              }
                            }}
                            aria-label="Delete question"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pl-4 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded-none border text-[11px] leading-tight flex items-start gap-1 ${
                              oIdx === q.correctOptionIndex
                                ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold"
                                : "bg-white text-slate-500 border-slate-200"
                            }`}
                          >
                            <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Tidak ada soal tertambat pada kualifikasi ini. Silakan tambahkan pertanyaan baru.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="bg-white rounded-none border border-slate-200 p-4 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Log Riwayat Peserta Pre-Test</h3>
              <p className="text-xs text-slate-500">Review lembar jawaban beserta skor ujian dari masing-masing calon pekerja.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-none transition cursor-pointer font-mono uppercase tracking-wider duration-150 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Ms. Excel (.csv)
              </button>

              <button
                onClick={() => {
                  if (confirm("PERINGATAN! Tindakan ini akan menghapus semua log peserta hasil pre-test (bisa untuk persiapan test baru). Lanjutkan?")) {
                    onResetAllData();
                  }
                }}
                className="inline-flex items-center gap-1 bg-rose-50 text-rose-850 hover:bg-rose-100 border border-rose-300 text-xs px-3 py-2.5 rounded-none transition cursor-pointer font-mono uppercase tracking-wide font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Semua Hasil
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-none border border-slate-200 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-650 font-bold border-b border-slate-100">
                  <th className="py-3 px-4">NIK & Nama Peserta</th>
                  <th className="py-3 px-4">Kategori Jabatan</th>
                  <th className="py-3 px-4 text-center">Skor</th>
                  <th className="py-3 px-4 text-center">Waktu Pengerjaan</th>
                  <th className="py-3 px-4 text-center">Kualifikasi</th>
                  <th className="py-3 px-4">Waktu Ujian</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{sub.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIK: {sub.nik}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{sub.jabatanName}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-sm text-slate-850">{sub.score}</div>
                        <div className="text-[9px] text-slate-400">{sub.correctAnswersCount}/{sub.totalQuestions} Benar</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {Math.floor(sub.timeTakenSeconds / 60)}m {sub.timeTakenSeconds % 60}s
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {sub.isPassed ? (
                          <span className="inline-flex px-2 py-0.5 rounded-none text-[9px] font-bold bg-emerald-50 text-emerald-805 border border-emerald-250 font-mono">
                            Passed (Lulus)
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-none text-[9px] font-bold bg-rose-50 text-rose-805 border border-rose-250 font-mono">
                            Failed (Gagal)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {new Date(sub.timestamp).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {sub.isPassed && (
                            <button
                              onClick={() => onViewCertificateForSubmission(sub)}
                              className="px-2.5 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-950 font-black border border-teal-300 rounded-none transition text-[10px] font-mono uppercase tracking-wide"
                            >
                              Sertifikat
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm("Hapus baris hasil peserta ini?")) onDeleteSubmission(sub.id);
                            }}
                            className="p-1.5 text-rose-800 hover:bg-rose-100/50 border border-transparent hover:border-rose-300 rounded-none transition"
                            title="Hapus history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Belum ada calon karyawan yang melakukan pre-test.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-none border border-slate-202 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ubah Konfigurasi Bobot & Batas Waktu</h3>
            <p className="text-xs text-slate-500">Tentukan nilai KKM (kriteria minimal kelulusan) dan limitasi waktu pengerjaan untuk masing-masing jabatan target.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jabatanList.map((jab) => (
              <div key={jab.id} className="p-4 rounded-none border border-slate-200 space-y-4 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-none">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{jab.name}</h4>
                    <p className="text-[10px] text-slate-400">{jab.description.slice(0, 50)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 leading-none uppercase">Limit Waktu (Menit)</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={jab.timeLimitMinutes}
                        onChange={(e) => updateThresholdSetting(jab.id, "timeLimitMinutes", Number(e.target.value))}
                        className="w-full px-3 py-1 bg-white border border-slate-205 rounded-none text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 leading-none uppercase">KKM Minimal (%)</label>
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={jab.passingScore}
                        onChange={(e) => updateThresholdSetting(jab.id, "passingScore", Number(e.target.value))}
                        className="w-full px-3 py-1 bg-white border border-slate-205 rounded-none text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Admin Password Section */}
          <div className="border-t border-slate-200 pt-6 mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#009646]" />
                Kustomisasi Kata Sandi Admin (REGIONAL H)
              </h3>
              <p className="text-xs text-slate-500">Ubah kata sandi default ("admin") dengan kata sandi kustom pilihan Anda sendiri demi meningkatkan keamanan akses panel admin.</p>
            </div>

            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase leading-none font-mono">KATA SANDI BARU</label>
                  <input
                    type="password"
                    placeholder="Masukkan sandi baru..."
                    value={newSandi}
                    onChange={(e) => setNewSandi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase leading-none font-mono">KONFIRMASI KATA SANDI</label>
                  <input
                    type="password"
                    placeholder="Ulangi sandi baru..."
                    value={confirmSandi}
                    onChange={(e) => setConfirmSandi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-[10px] text-slate-400">
                  Kata sandi aktif saat ini: <strong className="text-slate-700 font-mono">{adminPassword}</strong>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-none transition uppercase tracking-wider font-sans cursor-pointer whitespace-nowrap"
                >
                  Simpan Sandi Kustom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
