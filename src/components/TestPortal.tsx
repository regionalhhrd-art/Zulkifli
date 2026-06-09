/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Timer, AlertTriangle, ChevronRight, ChevronLeft, Send, CheckCircle2, FileText, User } from "lucide-react";
import { Question, Jabatan, UserSession } from "../types";

interface TestPortalProps {
  userSession: UserSession;
  questions: Question[];
  jabatan: Jabatan;
  onSubmit: (answers: { [qId: string]: number }, score: number, timeSpentSeconds: number) => void;
  onCancel: () => void;
}

export default function TestPortal({ userSession, questions, jabatan, onSubmit, onCancel }: TestPortalProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(jabatan.timeLimitMinutes * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Countdown clock timer logic
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleForceAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [jabatan.id]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleForceAutoSubmit = () => {
    // Determine score
    let pointsEarned = 0;
    let correctCount = 0;
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        pointsEarned += q.points;
        correctCount++;
      }
    });

    const finalPercentageScore = Math.round((pointsEarned / (totalPossiblePoints || 100)) * 100);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Cleanup timer
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(answers, finalPercentageScore, timeSpentSeconds);
  };

  const calculateResultsAndSubmit = () => {
    let pointsEarned = 0;
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        pointsEarned += q.points;
      }
    });

    const finalPercentageScore = Math.round((pointsEarned / (totalPossiblePoints || 100)) * 100);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(answers, finalPercentageScore, timeSpentSeconds);
  };

  const formatTimerString = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const isLowTime = secondsRemaining <= 60; // Less than 1 minute

  return (
    <div id="test-portal-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Question Content View Area */}
      <div className="lg:col-span-8 space-y-6">
        {/* Top Info Hub */}
        <div className="bg-white rounded-none border border-slate-200 p-4 md:p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Materi Pre-Test</div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight">{jabatan.name}</h3>
            </div>
          </div>

          {/* Time Countdown Timer Badge */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none border font-mono font-bold text-sm transition transition-all ${
              isLowTime
                ? "bg-rose-50 text-rose-800 border-rose-300 animate-pulse ring-1 ring-rose-300"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <Timer className={`w-4 h-4 ${isLowTime ? "text-rose-600" : "text-slate-400"}`} />
            <span>{isLowTime ? `WAKTU TIPIS: ` : ``}{formatTimerString(secondsRemaining)}</span>
          </div>
        </div>

        {/* Current Question Canvas Card */}
        {currentQuestion ? (
          <div className="bg-white rounded-none border border-slate-200 p-6 md:p-8 shadow-xs space-y-6 animate-scale-up">
            {/* Header: Question Number & Points */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider font-mono text-teal-805 bg-teal-100 px-2.5 py-1 rounded-none">
                Pertanyaan ke {currentIdx + 1} dari {totalQuestions}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Poin: {currentQuestion.points}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-lg font-bold text-slate-800 leading-relaxed font-sans">
              {currentQuestion.questionText}
            </h4>

            {/* Options list */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oIdx) => {
                const optLetter = String.fromCharCode(65 + oIdx); // A, B, C, D...
                const isSelected = answers[currentQuestion.id] === oIdx;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                    className={`w-full text-left p-4 rounded-none border text-sm font-medium transition duration-150 cursor-pointer flex items-start gap-3.5 group ${
                      isSelected
                        ? "bg-teal-50/20 text-slate-900 border-teal-500 ring-1 shadow-xs font-semibold"
                        : "bg-slate-50 hover:bg-slate-100/70 border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {/* Index Bullet (A, B, C, D...) */}
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-none text-xs font-black flex items-center justify-center transition ${
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-550 border border-slate-200 group-hover:bg-slate-100"
                      }`}
                    >
                      {optLetter}
                    </span>
                    {/* Value */}
                    <span className="pt-0.5 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIdx((n) => Math.max(0, n - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-205 rounded-none text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer font-mono"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIdx((n) => Math.min(totalQuestions - 1, n + 1))}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-none transition cursor-pointer uppercase tracking-wider font-mono"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-none transition cursor-pointer uppercase tracking-widest"
                >
                  Selesai & Kirim
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
            Pertanyaan tidak ditemukan.
          </div>
        )}
      </div>

      {/* Sidebar Info & Navigator Grid */}
      <div className="lg:col-span-4 space-y-6">
        {/* candidate session card */}
        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-black uppercase tracking-wider mb-3 font-mono text-slate-900">Peserta Pre-Test</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-slate-900 font-sans">{userSession.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">NIK: {userSession.nik}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Status Pengisian</span>
            <span className="text-teal-700 font-bold">{answeredCount} dari {totalQuestions} Soal</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-none mt-2 overflow-hidden border border-slate-200">
            <div
              className="bg-teal-500 h-1.5 rounded-none transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Navigator buttons map panel */}
        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-black uppercase tracking-wider mb-4 font-mono text-slate-900">Navigasi Soal</h4>
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = idx === currentIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-11 rounded-none text-xs font-black flex items-center justify-center transition border cursor-pointer ${
                    isActive
                      ? "bg-teal-505 bg-teal-500 text-slate-950 border-teal-600 font-black"
                      : isAnswered
                      ? "bg-emerald-50 text-emerald-850 border-emerald-300 rounded-none font-bold"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded-none bg-teal-500 border border-teal-600 inline-block"></span>
              <span>Soal Sedang Aktif</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded-none bg-emerald-50 border border-emerald-300 inline-block"></span>
              <span>Telah Dijawab</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded-none bg-slate-50 border border-slate-200 inline-block"></span>
              <span>Belum Dijawab</span>
            </div>
          </div>
        </div>

        {/* Exit Exam Danger Button */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="w-full text-center py-3.5 border border-rose-200 bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold transition cursor-pointer rounded-none uppercase font-mono tracking-wider"
        >
          Keluar / Batalkan Pre-Test
        </button>
      </div>

      {/* Confirmation Submit Modal popup */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full shadow-lg space-y-4 animate-scale-up">
            <div className="p-3 bg-teal-50 rounded-full text-teal-700 w-12 h-12 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Kirim Jawaban Ujian?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menyelesaikan pre-test ini? Anda telah menjawab {answeredCount} dari {totalQuestions} pertanyaan yang ada.
              </p>
              {answeredCount < totalQuestions && (
                <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold mt-2.5 border border-amber-200 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Peringatan: Ada beberapa pertanyaan belum dijawab!</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Kembali Periksa
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  calculateResultsAndSubmit();
                }}
                className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-950 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Ya, Submit!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Exam Confirmation Modal popup */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full shadow-lg space-y-4 animate-scale-up">
            <div className="p-3 bg-rose-50 rounded-full text-rose-700 w-12 h-12 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Batalkan Pre-Test Anda?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda benar-benar yakin ingin keluar dari pre-test? Semua progres lembar jawaban pengerjaan aktif akan hilang sepenuhnya.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Lanjutkan Ujian
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onCancel();
                }}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-850 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Ya, Batalkan!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
