/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search, Trophy, Medal, Award, Calendar, Timer, BookOpen } from "lucide-react";
import { Submission, Jabatan } from "../types";

interface LeaderboardProps {
  submissions: Submission[];
  jabatanList: Jabatan[];
}

export default function Leaderboard({ submissions, jabatanList }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJabatanFilter, setSelectedJabatanFilter] = useState("all");

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        const matchesSearch =
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.nik.includes(searchTerm);
        const matchesJabatan =
          selectedJabatanFilter === "all" || sub.jabatanId === selectedJabatanFilter;
        return matchesSearch && matchesJabatan;
      })
      // Sort primarily by Score (descending), then by Time Taken (ascending, faster is better)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeTakenSeconds - b.timeTakenSeconds;
      });
  }, [submissions, searchTerm, selectedJabatanFilter]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div id="leaderboard-section" className="bg-white rounded-none border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-none text-teal-800 border border-teal-200">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">Papan Ranking & Juara</h2>
            <p className="text-xs text-slate-500 mt-0.5">Urutan peringkat karyawan berdasarkan nilai tertinggi dan durasi tercepat</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Cari berdasarkan Nama atau nomor NIK..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-205 rounded-none text-xs focus:outline-none focus:border-teal-500 focus:bg-white transition font-mono uppercase tracking-wide"
        />
      </div>

      {/* Leaderboard Table Container */}
      <div className="overflow-x-auto rounded-none border border-slate-200 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 text-slate-500 font-bold text-xs border-b border-slate-100 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-16">Peringkat</th>
              <th className="py-3.5 px-4">Nama Lengkap & NIK</th>
              <th className="py-3.5 px-4 text-center">Skor Akhir</th>
              <th className="py-3.5 px-4 text-center">Durasi</th>
              <th className="py-3.5 px-4 text-center">Keterangan</th>
              <th className="py-3.5 px-4">Tanggal Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub, index) => {
                const rank = index + 1;
                let rankWidget;

                if (rank === 1) {
                  rankWidget = (
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-none bg-amber-500 text-slate-950 font-black shadow-none relative" title="Juara 1">
                        1
                        <Medal className="absolute -top-1 -right-1 w-4 h-4 text-amber-200 fill-amber-600" />
                      </span>
                    </div>
                  );
                } else if (rank === 2) {
                  rankWidget = (
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-none bg-slate-350 text-slate-900 font-black border border-slate-300 shadow-none relative" title="Juara 2">
                        2
                        <Medal className="absolute -top-1 -right-1 w-4 h-4 text-slate-100 fill-slate-400" />
                      </span>
                    </div>
                  );
                } else if (rank === 3) {
                  rankWidget = (
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-none bg-amber-700 text-amber-50 font-black shadow-none relative" title="Juara 3">
                        3
                        <Medal className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 fill-amber-800" />
                      </span>
                    </div>
                  );
                } else {
                  rankWidget = (
                    <div className="text-center font-semibold text-slate-500 font-mono text-xs">
                      #{rank}
                    </div>
                  );
                }

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-50/50 transition duration-150 ${
                      rank === 1
                        ? "bg-amber-500/5 font-medium"
                        : rank === 2
                        ? "bg-slate-500/5"
                        : rank === 3
                        ? "bg-amber-700/5"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-4 whitespace-nowrap">{rankWidget}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {/* Custom Medal Themed Photo Frame */}
                        {rank === 1 ? (
                          <div className="relative flex-shrink-0">
                            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 opacity-75 blur-[2px] animate-pulse"></span>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs bg-white">
                              {sub.photo ? (
                                <img
                                  src={sub.photo}
                                  alt={sub.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-700 font-bold font-mono text-sm uppercase">
                                  {sub.name.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-amber-505 text-slate-950 rounded-full p-0.5 border border-white shadow-xs flex items-center justify-center">
                              <Award className="w-3 h-3 text-white fill-amber-700" />
                            </span>
                          </div>
                        ) : rank === 2 ? (
                          <div className="relative flex-shrink-0">
                            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-slate-350 to-slate-250 opacity-75 blur-[2px]"></span>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-300 shadow-xs bg-white">
                              {sub.photo ? (
                                <img
                                  src={sub.photo}
                                  alt={sub.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold font-mono text-sm uppercase">
                                  {sub.name.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 border border-white shadow-xs flex items-center justify-center">
                              <Award className="w-3 h-3 text-white fill-slate-300" />
                            </span>
                          </div>
                        ) : rank === 3 ? (
                          <div className="relative flex-shrink-0">
                            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 opacity-60 blur-[2px]"></span>
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600 shadow-xs bg-white">
                              {sub.photo ? (
                                <img
                                  src={sub.photo}
                                  alt={sub.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-800 font-bold font-mono text-sm uppercase">
                                  {sub.name.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white rounded-full p-0.5 border border-white shadow-xs flex items-center justify-center">
                              <Award className="w-3 h-3 text-white fill-amber-300" />
                            </span>
                          </div>
                        ) : (
                          <div className="relative flex-shrink-0">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-xs bg-white">
                              {sub.photo ? (
                                <img
                                  src={sub.photo}
                                  alt={sub.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold font-mono text-xs uppercase">
                                  {sub.name.slice(0, 2)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="font-bold text-slate-850 flex items-center gap-2">
                            <span>{sub.name}</span>
                            {rank <= 3 && (
                              <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-xs select-none tracking-wider ${
                                rank === 1 ? "bg-amber-100 text-amber-800 border border-amber-300 animate-bounce" :
                                rank === 2 ? "bg-slate-100 text-slate-700 border border-slate-300" :
                                "bg-amber-50 text-amber-900 border border-amber-500/20"
                              }`}>
                                {rank === 1 ? "JUARA 1" : rank === 2 ? "JUARA 2" : "JUARA 3"}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 tracking-wider">
                            NIK: {sub.nik} • <span className="text-teal-700 font-black uppercase text-[10px]">{sub.jabatanName || "Umum"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`font-mono font-extrabold text-base ${sub.score >= 80 ? "text-emerald-700" : sub.score >= 70 ? "text-teal-700" : "text-rose-600"}`}>
                        {sub.score}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Koreksi: {sub.correctAnswersCount}/{sub.totalQuestions}</span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-xs text-slate-600">
                      <div className="flex items-center justify-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-slate-400" />
                        {formatTime(sub.timeTakenSeconds)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {sub.isPassed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          LULUS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          BELUM LULUS
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {formatDate(sub.timestamp)}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                    <span>Tidak ada data ranking yang sesuai dengan pencarian Anda</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
