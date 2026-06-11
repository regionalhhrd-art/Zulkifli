/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Download,
  Key,
  ShieldCheck,
  AlertCircle,
  RefreshCw
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
  onRefreshSubmissions: () => Promise<void>;
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
  onRefreshSubmissions
}: AdminPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
  const [selectedJabatanForQuestion, setSelectedJabatanForQuestion] = useState<string>("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectIdx, setNewQuestionCorrectIdx] = useState<number>(0);
  const [newQuestionPoints, setNewQuestionPoints] = useState<number>(20);
  const [manageSelectedJabatan, setManageSelectedJabatan] = useState<string>("all");

  // State elements for adding new Quiz (Judul Kuis)
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [newQuizTime, setNewQuizTime] = useState<number>(15);
  const [newQuizKKM, setNewQuizKKM] = useState<number>(70);
  const [newQuizSandi, setNewQuizSandi] = useState(""); // 2 digits maximum passcode

  // Synchronize default selected jabatan when list loads
  useEffect(() => {
    if (jabatanList.length > 0) {
      if (!selectedJabatanForQuestion) {
        setSelectedJabatanForQuestion(jabatanList[0].id);
      }
    }
  }, [jabatanList, selectedJabatanForQuestion]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Sandi Salah! Silakan hubungi administrator.");
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
    alert("Sukses! Kata sandi panel admin berhasil diperbarui!");
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

    const currentJabatanId = selectedJabatanForQuestion || jabatanList[0]?.id || "pretest_umum";

    if (editingQuestion) {
      const updatedQuestion: Question = {
        id: editingQuestion.id,
        jabatanId: currentJabatanId,
        questionText: newQuestionText,
        options: [...newQuestionOptions],
        correctOptionIndex: newQuestionCorrectIdx,
        points: Number(newQuestionPoints) || 20,
      };

      onUpdateQuestion(updatedQuestion);
      setEditingQuestion(null);
      alert("Pertanyaan berhasil diperbarui!");
    } else {
      const createdQuestion: Question = {
        id: "q_" + Date.now().toString(),
        jabatanId: currentJabatanId,
        questionText: newQuestionText,
        options: [...newQuestionOptions],
        correctOptionIndex: newQuestionCorrectIdx,
        points: Number(newQuestionPoints) || 20,
      };

      onAddQuestion(createdQuestion);
      alert("Pertanyaan pre-test baru berhasil ditambahkan!");
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

  // Quiz update handler
  const updateQuizField = (quizId: string, field: keyof Jabatan, val: any) => {
    let finalVal = val;
    if (field === "sandi") {
      // Clean non-digits and slice to 2 characters max
      finalVal = String(val).replace(/\D/g, "").slice(0, 2);
    }
    
    // Save to global list
    const updated = jabatanList.map((j) => {
      if (j.id === quizId) {
        return {
          ...j,
          [field]: finalVal,
        };
      }
      return j;
    });
    onUpdateJabatanSettings(updated);
  };

  // Save new Quiz Title (Judul Kuis)
  const handleAddNewQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizName.trim() || !newQuizDesc.trim()) {
      alert("Mohon isi Nama Kuis dan Deskripsi Kuis secara lengkap!");
      return;
    }

    const cleanSandi = newQuizSandi.replace(/\D/g, "").slice(0, 2);
    if (!cleanSandi) {
      alert("Sandi akses wajib berupa angka (maksimal 2 digit, contoh: 88 atau 07)!");
      return;
    }

    const newQuizId = "quiz_" + Date.now().toString().slice(-6);
    const newQuizObj: Jabatan = {
      id: newQuizId,
      name: newQuizName.trim(),
      description: newQuizDesc.trim(),
      timeLimitMinutes: Number(newQuizTime) || 15,
      passingScore: Number(newQuizKKM) || 70,
      sandi: cleanSandi
    };

    onUpdateJabatanSettings([...jabatanList, newQuizObj]);
    
    // Reset Form
    setNewQuizName("");
    setNewQuizDesc("");
    setNewQuizTime(15);
    setNewQuizKKM(70);
    setNewQuizSandi("");
    
    // Select this newly created Quiz Category automatically in question selector
    setSelectedJabatanForQuestion(newQuizId);
    
    alert(`Sukses menambahkan kuis baru: "${newQuizObj.name}" dengan Sandi Akses: "${cleanSandi}"!`);
  };

  // Delete a Quiz Title category
  const handleDeleteQuiz = (id: string, name: string) => {
    if (jabatanList.length <= 1) {
      alert("Gagal menghapus! Paling sedikit harus tersisa 1 judul kuis aktif.");
      return;
    }
    
    const countRelated = questions.filter(q => q.jabatanId === id).length;
    const msg = `Apakah Anda yakin ingin menghapus judul kuis "${name}"?\nSandi akses dan seluruh pengaturannya akan ditiadakan.\nJumlah soal terkait: ${countRelated} soal.`;
    
    if (confirm(msg)) {
      const updatedList = jabatanList.filter(j => j.id !== id);
      onUpdateJabatanSettings(updatedList);
      
      // Auto adjust selection
      if (selectedJabatanForQuestion === id) {
        setSelectedJabatanForQuestion(updatedList[0].id);
      }
      if (manageSelectedJabatan === id) {
        setManageSelectedJabatan("all");
      }
      alert(`Kuis "${name}" berhasil dihapus.`);
    }
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
        `"${sub.nik}"`,
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
          <p className="text-xs text-slate-500 leading-relaxed">
            Materi & sandi bank soal diproteksi demi integritas ujian karyawan. Masukkan kata sandi hak akses administrator untuk melanjutkan kelola portal.
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
              <span>Gunakan kata sandi hak akses administrator kustom Anda.</span>
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-850 border border-teal-800 tracking-wide text-teal-300 font-mono">
            MODE MANAJEMEN SOAL & KUIS
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-none">Menejemen Bank Soal & Sandi Kuis</h2>
          <p className="text-xs text-teal-200">
            Kustomisasi katalog judul ujian, kelola kunci jawaban bank soal, dan tentukan sandi rahasia maksimal 2 angka.
          </p>
        </div>

        <button
          onClick={() => setIsAdminAuthenticated(false)}
          className="no-print relative z-10 inline-flex items-center gap-1.5 bg-slate-1000 hover:bg-slate-850 text-teal-400 border border-teal-905 hover:text-white font-black text-[10px] px-4 py-2.5 rounded-none transition cursor-pointer uppercase font-mono tracking-wider"
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
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "settings"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Kelola Kuis & Sandi ({jabatanList.length})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer font-mono uppercase tracking-wider ${
            activeTab === "submissions"
              ? "border-teal-500 text-teal-600 font-black"
              : "border-transparent text-slate-550 hover:text-slate-800 font-bold"
          }`}
        >
          Hasil Pre-Test ({submissions.length})
        </button>
      </div>

      {/* Grid Content Tabs */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Bento Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Presentase Lulus</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{passRate}%</div>
              </div>
            </div>

            <div className="bg-white rounded-none border border-slate-204 p-5 shadow-xs flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-none text-blue-605">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Rerata Nilai</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{averageScore}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-none border border-slate-204 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 font-sans">Aktivitas Ujian Terbaru Karyawan</h3>
              <div className="divide-y divide-slate-100">
                {submissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between text-xs gap-4 hover:bg-slate-50/40 px-2 rounded-none border-b border-dashed border-slate-100 transition">
                    <div className="flex items-center gap-3">
                      {sub.photo ? (
                        <img
                          src={sub.photo}
                          alt={sub.name}
                          className="w-8 h-8 rounded-none object-cover border border-slate-205 bg-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-none border border-dashed border-slate-250 flex items-center justify-center text-slate-350 text-[8px] font-mono shrink-0 bg-slate-100">
                          N/A
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-800 uppercase font-sans">{sub.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">NIK: {sub.nik} • {sub.jabatanName}</div>
                      </div>
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
                  <div className="text-center py-12 text-slate-400 text-xs">Belum ada riwayat pengerjaan pre-test masuk ke server.</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-none border border-slate-204 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight font-sans">Katalog Kuis & Sandi Akses</h3>
              <div className="space-y-3">
                {jabatanList.map((jab) => {
                  const qCount = questions.filter((q) => q.jabatanId === jab.id).length;
                  return (
                    <div key={jab.id} className="p-3 bg-slate-50 rounded-none border border-slate-150 flex items-center justify-between text-xs hover:bg-slate-100/50 transition">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-805 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                          <span>{jab.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2">
                          <span>KKM: {jab.passingScore}%</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1">PIN: {jab.sandi}</span>
                        </div>
                      </div>
                      <div className="font-mono font-black text-teal-850 bg-teal-100 px-2 py-1 border border-teal-200 shrink-0 text-[10px]">
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Add Question panel card */}
          <div className="xl:col-span-5 bg-white rounded-none border border-slate-200 p-5 shadow-xs space-y-4 font-sans" id="soal-editor-card">
            <h3 className="text-sm font-bold text-slate-850 flex items-center justify-between pb-2 border-b border-slate-100" id="soal-editor-title">
              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                {editingQuestion ? <Edit className="w-4 h-4 text-teal-655" /> : <Plus className="w-4 h-4 text-teal-700" />}
                {editingQuestion ? "Edit Pertanyaan Bank Soal" : "Buat Soal Pre-Test Baru"}
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
                  className="text-[10px] uppercase font-black text-rose-700 hover:text-rose-900 tracking-wider font-mono cursor-pointer"
                >
                  Batal Sunting
                </button>
              )}
            </h3>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4 text-xs">
              {/* Category Dropdown Selection */}
              <div>
                <label className="block font-bold text-slate-500 mb-1 font-mono uppercase text-[10px]">Pilih Kategori Judul Kuis</label>
                <select
                  value={selectedJabatanForQuestion}
                  onChange={(e) => setSelectedJabatanForQuestion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-none font-bold text-xs cursor-pointer focus:border-teal-555 focus:bg-white focus:outline-none"
                >
                  {jabatanList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name} (Sandi: {j.sandi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 font-mono uppercase text-[10px]">Deskripsi Kalimat Pertanyaan</label>
                <textarea
                  placeholder="Ketik kalimat soal ujian..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none text-xs"
                  required
                ></textarea>
              </div>

              {/* Options lists inputs */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-500 font-mono text-[10px] uppercase">Opsi Alternatif Jawaban & Kunci Benar (Radio)</label>
                {newQuestionOptions.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-400 w-4 font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                    <input
                      type="text"
                      placeholder={`Opsi pilihan ${String.fromCharCode(65 + oIdx)}...`}
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none text-xs"
                      required
                    />
                    <input
                      type="radio"
                      name="correct-option-radio"
                      checked={newQuestionCorrectIdx === oIdx}
                      onChange={() => setNewQuestionCorrectIdx(oIdx)}
                      title="Tandai opsi ini sebagai kunci jawaban yang benar"
                      className="w-4 h-4 accent-teal-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-505 mb-1 font-mono uppercase text-[10px]">Bobot Poin Soal</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-none focus:border-teal-550 focus:bg-white focus:outline-none text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full text-center py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-none transition cursor-pointer uppercase tracking-wider font-mono shadow-xs"
                  >
                    {editingQuestion ? "Simpan Perubahan" : "Tambahkan Soal"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of active questions panel */}
          <div className="xl:col-span-7 bg-white rounded-none border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase font-sans">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Daftar Pertanyaan Tersimpan
              </h3>
              
              {/* Filter Select Tab */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filter Kuis:</span>
                <select
                  value={manageSelectedJabatan}
                  onChange={(e) => setManageSelectedJabatan(e.target.value)}
                  className="px-2 py-1 border border-slate-250 bg-slate-50 rounded-none text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Judul Kuis</option>
                  {jabatanList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name} ({questions.filter(q => q.jabatanId === j.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List scroll */}
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 text-xs">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, qIndex) => {
                  const targetJob = jabatanList.find((j) => j.id === q.jabatanId);

                  return (
                    <div key={q.id} className="p-4 bg-slate-50/75 rounded-none border border-slate-200 space-y-2 text-xs hover:border-slate-350 hover:bg-white transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-none bg-teal-50 text-teal-850 font-black font-mono uppercase tracking-wider text-[9px] border border-teal-200">
                              {targetJob?.name || "Kategori Terhapus"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 px-1">Poin: {q.points}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs leading-relaxed pt-1 font-sans">
                            {qIndex + 1}. {q.questionText}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
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
                            title="Edit pertanyaan ini"
                            className="p-1 px-2 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-650 transition cursor-pointer font-mono uppercase text-[9px] font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Hapus soal ini dari database kelola pre-test?")) {
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
                            aria-label="Remove question"
                            className="p-1 px-2 bg-white border border-rose-200 hover:border-rose-450 hover:text-rose-700 text-slate-600 transition cursor-pointer font-mono uppercase text-[9px] font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1 font-sans">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5.5 px-2.5 rounded-none border text-[11px] leading-snug flex items-start gap-1.5 ${
                              oIdx === q.correctOptionIndex
                                ? "bg-emerald-50 text-emerald-805 border-emerald-250 font-bold"
                                : "bg-white text-slate-550 border-slate-200"
                            }`}
                          >
                            <span className="font-black font-mono text-[10px] text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                            <span className="flex-1">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-400 bg-slate-50 border border-slate-150 rounded-none">
                  <p className="font-bold uppercase tracking-wide text-[10px] font-mono mb-1">Bank Soal Kosong</p>
                  <p className="text-[11px]">Belum ada soal terdaftar pada kategori kuis pilihan ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in text-xs font-sans">
          {/* Main Layout containing both Add Quiz and List Quiz */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Add Quiz Title section */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100 uppercase tracking-wide">
                <Plus className="w-4 h-4 text-emerald-650" />
                Tambah Kuis / Paket Baru
              </h3>
              
              <form onSubmit={handleAddNewQuizSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 font-mono uppercase text-[10px]">Nama / Judul Paket Kuis</label>
                  <input
                    type="text"
                    placeholder="Contoh: Teknis Operator Traksi..."
                    value={newQuizName}
                    onChange={(e) => setNewQuizName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 focus:border-teal-550 focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1 font-mono uppercase text-[10px]">Deskripsi Singkat Kuis</label>
                  <textarea
                    placeholder="Contoh: Evaluasi khusus penguasaan pemecahan kerusakan mekanis traktor di lapangan..."
                    value={newQuizDesc}
                    onChange={(e) => setNewQuizDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 focus:border-teal-555 focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-505 mb-1 font-mono uppercase text-[10px]">KKM Minimal (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newQuizKKM}
                      onChange={(e) => setNewQuizKKM(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 text-center font-bold font-mono focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-505 mb-1 font-mono uppercase text-[10px]">Durasi Ujian (Menit)</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={newQuizTime}
                      onChange={(e) => setNewQuizTime(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-205 text-center font-bold font-mono focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password / Access Sandi constraint max 2 digits check */}
                <div>
                  <label className="block font-black text-rose-800 mb-1 font-mono uppercase text-[10px] tracking-wide flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-rose-700" />
                    Sandi Akses Portal (Maks 2 Angka Pin)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Contoh: 18"
                    value={newQuizSandi}
                    onChange={(e) => setNewQuizSandi(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 placeholder-rose-300 focus:border-rose-500 focus:bg-white focus:outline-none font-bold text-lg font-mono text-center tracking-widest text-slate-800"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                     Peserta wajib memasukkan kunci/PIN 1-2 digit angka yang sama persis ini sebelum dapat memulai pre-test.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black hover:text-white uppercase tracking-wider font-mono cursor-pointer transition shadow-xs"
                >
                  Tambah & Publikasikan Paket Ujian
                </button>
              </form>
            </div>

            {/* Right: List and Edit existing quizzes */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-850 pb-2 border-b border-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-teal-700" />
                Daftar & Konfigurasi Sandi Judul Kuis
              </h3>

              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {jabatanList.map((jab) => {
                  const qCount = questions.filter(q => q.jabatanId === jab.id).length;
                  return (
                    <div key={jab.id} className="p-4 rounded-none border border-slate-200 space-y-3 bg-slate-50 relative group">
                      
                      {/* Delete and share button absolutely positioned inside item */}
                      <div className="absolute top-3 right-3 select-none flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const shareUrl = `${window.location.origin}${window.location.pathname}?kuis=${jab.id}`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => alert(`Tautan kuis "${jab.name}" berhasil disalin! Silakan bagikan tautan ini ke karyawan.`))
                              .catch(() => alert("Gagal menyalin link."));
                          }}
                          className="px-2 py-1 bg-white border border-teal-200 hover:bg-teal-50 text-[10px] font-black uppercase text-teal-700 font-mono tracking-wider transition cursor-pointer"
                          title="Salin Tautan Kuis Spesifik Ini"
                        >
                          Salin Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuiz(jab.id, jab.name)}
                          className="px-2 py-1 bg-white border border-rose-200 hover:bg-rose-100 text-[10px] font-black uppercase text-rose-700 font-mono tracking-wider transition cursor-pointer"
                          title="Hapus kuis ini dari bank soal"
                        >
                          Hapus Kuis
                        </button>
                      </div>

                      <div className="space-y-1 pr-20">
                        <div className="flex items-center gap-2">
                          <span className="p-1 px-1.5 font-mono text-[9px] bg-teal-100 border border-teal-200 text-teal-850 font-extrabold uppercase">
                            ID: {jab.id}
                          </span>
                          <span className="font-mono text-[9px] bg-slate-200 text-slate-705 font-bold uppercase px-1.5 px-0.5">
                            {qCount} Soal Tertaut
                          </span>
                        </div>
                        <input
                          type="text"
                          value={jab.name}
                          onChange={(e) => updateQuizField(jab.id, "name", e.target.value)}
                          className="w-full font-bold text-slate-855 text-sm bg-transparent hover:bg-white border-b border-transparent focus:border-teal-500 py-0.5 focus:bg-white focus:outline-none focus:px-1.5 transition font-sans"
                        />
                        <textarea
                          value={jab.description}
                          onChange={(e) => updateQuizField(jab.id, "description", e.target.value)}
                          rows={2}
                          className="w-full text-xs text-slate-500 bg-transparent hover:bg-white border-b border-transparent focus:border-teal-500 py-0.5 focus:bg-white focus:outline-none focus:px-1.5 transition leading-snug mt-1"
                        />
                      </div>

                      {/* Edit threshold options and Sandi PIN code */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-dashed border-slate-200">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Batas Waktu (Menit)</label>
                          <input
                            type="number"
                            min="1"
                            max="180"
                            value={jab.timeLimitMinutes}
                            onChange={(e) => updateQuizField(jab.id, "timeLimitMinutes", Number(e.target.value))}
                            className="w-full mt-1 px-2 py-1 bg-white border border-slate-250 text-xs text-center font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">KKM Minimal (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={jab.passingScore}
                            onChange={(e) => updateQuizField(jab.id, "passingScore", Number(e.target.value))}
                            className="w-full mt-1 px-2 py-1 bg-white border border-slate-250 text-xs text-center font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-rose-750 uppercase font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-700" />
                            Sandi (PIN 1-2 Digit)
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="Contoh: 15"
                            value={jab.sandi}
                            onChange={(e) => updateQuizField(jab.id, "sandi", e.target.value)}
                            className="w-full mt-1 px-2 py-1 bg-rose-50 border border-rose-200 text-xs text-center font-bold font-mono text-rose-800 focus:outline-none"
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>

          {/* Custom Admin Password Section */}
          <div className="bg-white rounded-none border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#009646]" />
                Kustomisasi Kata Sandi Admin (REGIONAL H)
              </h3>
              <p className="text-xs text-slate-500">Ubah kata sandi default ("admin") dengan kata sandi kustom pilihan Anda sendiri demi meningkatkan keamanan akses panel admin.</p>
            </div>

            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase leading-none font-mono">KATA SANDI BARU</label>
                  <input
                    type="password"
                    placeholder="Masukkan sandi baru..."
                    value={newSandi}
                    onChange={(e) => setNewSandi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
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

      {activeTab === "submissions" && (
        <div className="bg-white rounded-none border border-slate-200 p-4 md:p-6 shadow-xs space-y-4 animate-fade-in text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Log Riwayat Peserta Pre-Test</h3>
              <p className="text-xs text-slate-500">Review lembar jawaban beserta skor ujian dari masing-masing calon pekerja.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 border border-teal-700 text-white text-xs font-black px-4 py-2.5 rounded-none transition cursor-pointer font-mono uppercase tracking-wider duration-150 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Memuat..." : "Refresh Data"}
              </button>

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
                        <div className="flex items-center gap-2.5">
                          {sub.photo ? (
                            <img
                              src={sub.photo}
                              alt={sub.name}
                              className="w-9 h-11 object-cover border border-slate-205 bg-slate-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-11 border border-dashed border-slate-250 flex items-center justify-center text-slate-350 text-[8px] shrink-0 bg-slate-50 font-mono">
                              No Pic
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-805 uppercase font-sans">{sub.name}</div>
                            <div className="text-[10px] text-slate-450 font-mono">NIK: {sub.nik}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-750">{sub.jabatanName}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-sm text-slate-900">{sub.score}</div>
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
                          <button
                            onClick={() => {
                              if (confirm("Hapus baris hasil peserta ini?")) onDeleteSubmission(sub.id);
                            }}
                            className="p-1.5 text-rose-800 hover:bg-rose-100/50 border border-transparent hover:border-rose-350 rounded-none transition"
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
    </div>
  );
}
