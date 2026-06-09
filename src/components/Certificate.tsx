/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { Award, Printer, Download, ArrowLeft, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { Submission } from "../types";
import RegionalHLogo from "./RegionalHLogo";

interface CertificateProps {
  submission: Submission;
  onBack: () => void;
}

export default function Certificate({ submission, onBack }: CertificateProps) {
  const [downloadingImg, setDownloadingImg] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatDateLong = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generateCertificateImage = () => {
    setDownloadingImg(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setDownloadingImg(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloadingImg(false);
      return;
    }

    // Set dimensions for A4 Landscape High Definition (3508 x 2480 pixels for print)
    const w = 1920;
    const h = 1357;
    canvas.width = w;
    canvas.height = h;

    // 1. Draw premium background
    ctx.fillStyle = "#fafbfd";
    ctx.fillRect(0, 0, w, h);

    // 2. Draw outer border
    ctx.strokeStyle = "#c5a85c"; // gold colour
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // 3. Draw inner border
    ctx.strokeStyle = "#0f766e"; // teal colour
    ctx.lineWidth = 4;
    ctx.strokeRect(52, 52, w - 104, h - 104);

    // 4. Draw corner ornaments
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = "#c5a85c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0);
      ctx.lineTo(80, 20);
      ctx.lineTo(20, 20);
      ctx.lineTo(20, 80);
      ctx.lineTo(0, 80);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };

    drawCorner(70, 70, 0);
    drawCorner(w - 70, 70, Math.PI / 2);
    drawCorner(w - 70, h - 70, Math.PI);
    drawCorner(70, h - 70, -Math.PI / 2);

    // 5. Header Title
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw Regional H Custom Logo on Canvas
    const logoX = w / 2;
    const logoY = 155;

    // Outer green circle
    ctx.fillStyle = "#009646";
    ctx.beginPath();
    ctx.arc(logoX, logoY, 46, 0, 2 * Math.PI);
    ctx.fill();

    // Outermost thin white stroke
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(logoX, logoY, 41, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner white circle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(logoX, logoY, 32, 0, 2 * Math.PI);
    ctx.fill();

    // H character inside white circle
    ctx.fillStyle = "#009646";
    ctx.font = "bold 38px Arial, sans-serif";
    ctx.fillText("H", logoX, logoY + 1.5);

    // Brand title "REGIONAL H" on canvas
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#009646";
    ctx.fillText("REGIONAL H", w / 2, 222);

    // Sub Title
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("PORTAL ASESMEN KOMPETENSI KARYAWAN", w / 2, 260);

    // Main Certificate Text
    ctx.font = "italic 36px Georgia, serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Sertifikat Kelulusan", w / 2, 320);

    ctx.font = "normal 18px Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Nomor Sertifikat: ${submission.certificateId || "CERT/PRE-TEST/2026"}`, w / 2, 370);

    // 6. Statement text
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Diberikan Dengan Hormat Kepada Karyawan:", w / 2, 470);

    // 7. Employee Name (Large and elegant)
    ctx.font = "bold 64px Georgia, serif";
    ctx.fillStyle = "#0f766e";
    ctx.fillText(submission.name.toUpperCase(), w / 2, 540);

    // Bold Underline
    ctx.strokeStyle = "#c5a85c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 250, 585);
    ctx.lineTo(w / 2 + 250, 585);
    ctx.stroke();

    // NIK Info
    ctx.font = "normal 20px Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Nomor Induk Karyawan (NIK): ${submission.nik}`, w / 2, 620);

    // 8. Description Achievement
    ctx.font = "normal 22px Arial, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(
      "Dinyatakan telah berhasil menyelesaikan asesmen awal pembelajaran (Pre-Test) kompetensi",
      w / 2,
      720
    );

    ctx.font = "bold 28px Arial, sans-serif";
    ctx.fillStyle = "#0f766e";
    ctx.fillText(`Kualifikasi Jabatan: "${submission.jabatanName}"`, w / 2, 780);

    ctx.font = "normal 22px Arial, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(
      `Dengan persentase nilai hasil ujian akhir sebesar ${submission.score}% (Lulus KKM)`,
      w / 2,
      835
    );

    // 9. Signatures Area
    const sigY = 1050;

    // Date
    ctx.font = "normal 20px Arial, sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(`Diterbitkan pada: ${formatDateLong(submission.timestamp)}`, w / 2, 940);

    // Left Signature: HRD
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("Manager HRD & Recruitment", 400, sigY - 80);
    // Draw horizontal line for signature
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, sigY);
    ctx.lineTo(550, sigY);
    ctx.stroke();
    // Signature name
    ctx.font = "bold 22.5px Georgia, serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Amanda Kirana, S.Psi.", 400, sigY + 30);
    ctx.font = "normal 16px Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("NIP: 19920412201804", 400, sigY + 55);

    // Right Signature: Director
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("Direktur Operasional", w - 400, sigY - 80);
    // Draw horizontal line for signature
    ctx.beginPath();
    ctx.moveTo(w - 550, sigY);
    ctx.lineTo(w - 250, sigY);
    ctx.stroke();
    // Signature name
    ctx.fillText("Suryo Kusumo, M.B.A.", w - 400, sigY + 30);
    ctx.font = "normal 16px Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("NIP: 19801122200512", w - 400, sigY + 55);

    // 10. Seal Stamp (Deco Circle in Center Bottom)
    ctx.strokeStyle = "rgba(15, 118, 110, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w / 2, sigY - 50, 75, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(15, 118, 110, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, sigY - 50, 68, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillStyle = "rgba(15, 118, 110, 0.6)";
    ctx.fillText("OFFICIAL SEAL", w / 2, sigY - 70);
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("GRADUATED", w / 2, sigY - 50);
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("VERIFIED OK", w / 2, sigY - 30);

    // Generate link download
    try {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Sertifikat_PreTest_${submission.name.replace(/\s+/g, "_")}_${submission.nik}.png`;
      link.href = imgData;
      link.click();
    } catch (_) {
      alert("Gagal mengunduh sertifikat sebagai gambar. Silakan gunakan tombol Cetak PDF (alternatif).");
    } finally {
      setDownloadingImg(false);
    }
  };

  return (
    <div id="certificate-viewer-container" className="space-y-6">
      {/* Action panel no-print */}
      <div className="no-print bg-white rounded-none border border-slate-205 p-4 shadow-xs flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer self-start sm:self-auto font-mono uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-4 py-3 rounded-none transition cursor-pointer uppercase tracking-wider font-mono"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF / Print
          </button>
          <button
            onClick={generateCertificateImage}
            disabled={downloadingImg}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-black text-xs px-4 py-3 rounded-none transition disabled:opacity-50 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Download className="w-4 h-4" />
            {downloadingImg ? "Mengolah..." : "Unduh Gambar (PNG)"}
          </button>
        </div>
      </div>

      {/* Success banner */}
      <div className="no-print bg-emerald-50/50 border border-emerald-200 rounded-none p-5 flex items-start gap-4">
        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-none border border-emerald-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase text-emerald-950 font-mono tracking-tight leading-tight">Selamat, Anda Telah Lulus Ujian Pre-Test!</h4>
          <p className="text-xs text-emerald-700 mt-1">
            Sertifikat ini bernomor resmi dan terverifikasi di database HRD. Anda bisa mengunduhnya sebagai <strong className="font-bold">Gambar PNG</strong> resolusi tinggi atau mencetaknya langsung sebagai berkas dokumen <strong className="font-bold">PDF</strong> guna bukti pelengkap seleksi admin/promosi.
          </p>
        </div>
      </div>

      {/* Certificate Frame Area */}
      <div className="flex justify-center max-w-full overflow-x-auto py-2 custom-scrollbar no-print">
        <div className="w-[841px] h-[595px] min-w-[841px] bg-[#fbfcfd] border-8 border-[#c5a85c] p-6 relative flex flex-col justify-between shadow-lg select-none">
          {/* Inner double border */}
          <div className="absolute inset-2 border-2 border-teal-800 pointer-events-none"></div>

          {/* Golden ornaments */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#c5a85c]"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#c5a85c]"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#c5a85c]"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#c5a85c]"></div>

          {/* Certificate Header Info */}
          <div className="text-center pt-3 relative">
            <div className="flex flex-col items-center justify-center mb-2 gap-1">
              <RegionalHLogo size={60} />
              <div className="text-[11px] font-black tracking-widest text-[#009646] font-sans mt-0.5">REGIONAL H</div>
            </div>
            <h1 className="text-[9px] font-bold tracking-widest text-slate-500 font-mono uppercase">
              PORTAL ASESMEN KOMPETENSI KARYAWAN
            </h1>
            <h2 className="text-2xl font-serif font-black text-slate-850 mt-1">
              Sertifikat Kelulusan
            </h2>
            <p className="text-[9px] text-slate-400 font-mono tracking-wide mt-1">
              Nomor Sertifikat: {submission.certificateId || "CERT/PRE-TEST/2026/01"}
            </p>
          </div>

          {/* Certificate Main Body */}
          <div className="text-center px-8">
            <p className="text-xs text-slate-500 italic font-serif">Diberikan dengan hormat kepada:</p>
            <h3 className="text-2xl font-serif font-bold text-teal-900 border-b-2 border-[#c5a85c] pb-1.5 mt-2 inline-block px-12 uppercase tracking-wide">
              {submission.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">NOMOR INDUK KARYAWAN: {submission.nik}</p>

            <p className="text-xs text-slate-750 leading-relaxed max-w-xl mx-auto mt-4">
              Dinyatakan telah <strong className="text-emerald-700 font-bold">LULUS</strong> asesmen penilaian kompetensi dasar (<strong className="font-semibold">Pre-Test</strong>) pemetaan kualifikasi jabatan operasional untuk posisi pekerjaan:
            </p>
            <h4 className="text-sm font-bold text-teal-800 mt-1 font-display">
              {submission.jabatanName}
            </h4>
            <p className="text-[11px] text-slate-500 mt-2">
              Ujian diselesaikan pada <strong className="text-slate-700">{formatDateLong(submission.timestamp)}</strong> dengan hasil persentase nilai akhir <strong className="text-emerald-700 font-bold">{submission.score}%</strong>.
            </p>
          </div>

          {/* Certificate Signatures Section */}
          <div className="flex justify-between items-end px-10 pb-4 relative">
            {/* Stamp Logo Center Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center text-center">
              <div className="relative w-16 h-16 rounded-full border border-teal-700/30 flex items-center justify-center p-1 bg-white/80">
                <div className="absolute inset-0.5 rounded-full border border-dashed border-teal-700/20"></div>
                <RegionalHLogo size={36} className="opacity-90 grayscale contrast-125" />
              </div>
              <span className="text-[7px] font-black text-teal-850/60 mt-1 font-mono tracking-widest uppercase">REGIONAL H</span>
            </div>

            {/* Signature HRD */}
            <div className="text-center w-48">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Manager HRD</p>
              <div className="h-10 flex items-center justify-center">
                {/* Simulated Signature */}
                <span className="font-serif italic text-sm text-[#c5a85c]/80 pr-4 select-none pointer-events-none tracking-widest leading-none">
                  Amanda K.
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-800 border-t border-slate-300 pt-0.5 font-serif">
                Amanda Kirana, S.Psi.
              </p>
              <p className="text-[8px] text-slate-400 font-mono">NIP. 19920412201804</p>
            </div>

            {/* Signature Director */}
            <div className="text-center w-48">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Direktur Operasional</p>
              <div className="h-10 flex items-center justify-center">
                {/* Simulated Signature */}
                <span className="font-serif italic text-sm text-teal-700/60 pl-4 select-none pointer-events-none tracking-wider leading-none">
                  Suryo K.
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-800 border-t border-slate-300 pt-0.5 font-serif">
                Suryo Kusumo, M.B.A.
              </p>
              <p className="text-[8px] text-slate-400 font-mono">NIP. 19801122200512</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden high-res print-only element utilizing media query printing */}
      <div className="print-only hidden">
        <div className="certificate-print-area w-[1122px] h-[793px] bg-white border-16 border-[#c5a85c] p-10 relative flex flex-col justify-between select-none">
          {/* Inner double border */}
          <div className="absolute inset-4 border-4 border-teal-800 pointer-events-none"></div>

          {/* Golden ornaments */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#c5a85c]"></div>
          <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#c5a85c]"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#c5a85c]"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#c5a85c]"></div>

          <div className="text-center pt-6">
            <div className="flex flex-col items-center justify-center mb-3">
              <RegionalHLogo size={72} />
              <div className="text-sm font-black tracking-widest text-[#009646] font-sans mt-0.5">REGIONAL H</div>
            </div>
            <h1 className="text-[10px] font-bold tracking-widest text-slate-500 font-mono uppercase">
              PORTAL ASESMEN KOMPETENSI KARYAWAN
            </h1>
            <h2 className="text-3xl font-serif font-black text-slate-850 mt-1">
              Sertifikat Kelulusan
            </h2>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide mt-1">
              Nomor Sertifikat: {submission.certificateId || "CERT/PRE-TEST/2026/01"}
            </p>
          </div>

          <div className="text-center px-12">
            <p className="text-sm text-slate-500 italic font-serif">Diberikan dengan hormat kepada:</p>
            <h3 className="text-3xl font-serif font-bold text-teal-900 border-b-4 border-[#c5a85c] pb-2 mt-3 inline-block px-16 uppercase tracking-wider">
              {submission.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">NOMOR INDUK KARYAWAN: {submission.nik}</p>

            <p className="text-sm text-slate-755 leading-relaxed max-w-xl mx-auto mt-6 font-sans">
              Dinyatakan telah <strong className="text-emerald-700 font-bold">LULUS</strong> asesmen penilaian kompetensi dasar (Pre-Test) pemetaan kualifikasi jabatan operasional untuk posisi pekerjaan:
            </p>
            <h4 className="text-base font-bold text-teal-850 mt-1 font-display">
              {submission.jabatanName}
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Ujian diselesaikan pada <strong className="text-slate-700">{formatDateLong(submission.timestamp)}</strong> dengan hasil persentase nilai akhir <strong className="text-emerald-700 font-bold">{submission.score}%</strong>.
            </p>
          </div>

          <div className="flex justify-between items-end px-16 pb-8 relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center text-center">
              <div className="relative w-20 h-20 rounded-full border border-teal-700/30 flex items-center justify-center p-1 bg-white/80">
                <div className="absolute inset-1 rounded-full border border-dashed border-teal-750/30"></div>
                <RegionalHLogo size={46} className="opacity-90 grayscale contrast-125" />
              </div>
              <span className="text-[8px] font-black text-teal-850/60 mt-1 font-mono tracking-widest uppercase">REGIONAL H</span>
            </div>

            <div className="text-center w-56">
              <p className="text-xs font-bold text-slate-400 uppercase">Manager HRD</p>
              <div className="h-10"></div>
              <p className="text-xs font-bold text-slate-800 border-t border-slate-300 pt-1 font-serif">
                Amanda Kirana, S.Psi.
              </p>
              <p className="text-[9px] text-slate-400 font-mono">NIP. 19920412201804</p>
            </div>

            <div className="text-center w-56">
              <p className="text-xs font-bold text-slate-400 uppercase">Direktur Operasional</p>
              <div className="h-10"></div>
              <p className="text-xs font-bold text-slate-800 border-t border-slate-300 pt-1 font-serif">
                Suryo Kusumo, M.B.A.
              </p>
              <p className="text-[9px] text-slate-400 font-mono">NIP. 19801122200512</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden HTML5 Canvas object used exclusively for rendering the downloadable image */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}
