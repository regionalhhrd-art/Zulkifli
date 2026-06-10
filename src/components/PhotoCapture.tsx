import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, RefreshCw, AlertCircle, Check, Trash2 } from "lucide-react";

interface PhotoCaptureProps {
  photo: string;
  onChange: (base64Photo: string) => void;
}

export default function PhotoCapture({ photo, onChange }: PhotoCaptureProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraStarting(true);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Give helpful instructions based on common permission problems
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          "Akses kamera ditolak. Harap izinkan permissions kamera pada browser Anda atau unggah file foto secara manual."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("Kamera tidak ditemukan pada perangkat Anda. Silakan gunakan metode unggah foto.");
      } else {
        setCameraError("Gagal membuka kamera: " + (err.message || "Unknown error") + ". Silakan gunakan metode unggah foto.");
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Synchronize camera state on tab changes or reset
  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
  }, [activeTab, photo]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Set square crop based on video source aspect ratios
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;

      // Draw mirrored stream if we want passport feel
      ctx.translate(size, 0);
      ctx.scale(-1, 1);

      // Center crop
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

      // Reset transforms
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Convert to base64
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onChange(dataUrl);

      // Turn off camera stream
      stopCamera();
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Format berkas harus berupa gambar (JPG, JPEG, PNG)!");
      return;
    }

    // Limit size to 4MB for localStorage threshold ease
    if (file.size > 4 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Harap unggah gambar dengan ukuran di bawah 4 Megabytes.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag and Drop support
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearPhoto = () => {
    onChange("");
    setCameraError(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans" id="photo-capture-container">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-black text-slate-400 tracking-wider uppercase font-mono">
          FOTO PORTRAIT CALON KARYAWAN
        </label>
        {!photo && (
          <div className="flex border border-slate-200 p-0.5 bg-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={`px-3 py-1 font-mono text-[9px] uppercase font-bold transition ${
                activeTab === "camera" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Kamera Live
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1 font-mono text-[9px] uppercase font-bold transition ${
                activeTab === "upload" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Upload File
            </button>
          </div>
        )}
      </div>

      {photo ? (
        // Preview State - Compact and 3D floating passport preview
        <div className="flex flex-row items-center gap-4 p-3 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5">
          <div className="relative shrink-0 w-20 h-24 bg-slate-100 border-2 border-slate-900 overflow-hidden shadow-sm">
            <img src={photo} alt="Profile preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            <div className="absolute top-0 right-0 bg-teal-500 border-l border-b border-slate-900 text-slate-950 p-0.5">
              <Check className="w-3 h-3 font-extrabold" />
            </div>
          </div>
          <div className="space-y-1.5 text-left flex-1">
            <h5 className="font-extrabold text-slate-800 text-xs">Foto Muat Sukses!</h5>
            <p className="text-slate-500 leading-snug text-[10px]">
              Foto siap digunakan untuk kelengkapan cetak sertifikat HRD.
            </p>
            <button
              type="button"
              onClick={clearPhoto}
              className="inline-flex items-center gap-1 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 font-extrabold px-2 py-1 transition-all text-[9px] uppercase font-mono cursor-pointer rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5"
            >
              <Trash2 className="w-3 h-3" />
              Retake / Hapus
            </button>
          </div>
        </div>
      ) : (
        // Capture/Upload State - Extremely neat, side-by-side when webcam is active
        <div className="border-2 border-slate-900 bg-white p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
          {activeTab === "camera" ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[140px] relative">
              {cameraError ? (
                <div className="p-2 space-y-2 text-center max-w-sm">
                  <AlertCircle className="w-6 h-6 text-rose-650 mx-auto" />
                  <p className="text-[10px] text-rose-800 leading-snug">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setActiveTab("upload");
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono uppercase text-[8px] border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
                  >
                    Beralih Ke Unggah File
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                  {/* Camera Screen - Compact w-32 h-32 */}
                  <div className="w-32 h-32 bg-slate-950 border-2 border-slate-900 relative flex items-center justify-center overflow-hidden shrink-0 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                    {/* Live Video Viewport */}
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                      style={{ display: stream ? "block" : "none" }}
                    />
                    {!stream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-slate-400">
                        <Camera className="w-6 h-6 animate-pulse text-slate-500 mb-1" />
                        <span className="text-[8px] font-mono uppercase tracking-wide text-slate-500">
                          {isCameraStarting ? "Memulai..." : "Non-Aktif"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Right Hand Panel */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                      Posisikan wajah tegak lurus di depan kamera portal ujian untuk verifikasi wajah otomatis.
                    </p>
                    {stream ? (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-450 border-2 border-slate-900 text-slate-950 font-black text-[9px] uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1 mx-auto sm:mx-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Ambil Foto Sekarang
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={isCameraStarting}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border-2 border-slate-900 text-white font-bold text-[9px] uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1 mx-auto sm:mx-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCameraStarting ? "animate-spin" : ""}`} />
                        Aktifkan Webcam
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Upload Tab - Slimmed down
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-4 flex flex-col items-center justify-center min-h-[140px] transition text-center cursor-pointer border border-dashed ${
                dragActive ? "bg-teal-50/50 border-teal-500" : "hover:bg-slate-50 border-slate-200"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 text-[11px] mb-0.5">Tarik & Lepas gambar Anda di sini</p>
              <p className="text-slate-450 text-[9px] mb-2.5">atau telusuri dari files folder perangkat Anda</p>
              <span className="inline-block px-2.5 py-1 bg-slate-900 text-white border border-slate-900 font-mono uppercase tracking-wider text-[8px] font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                PILIH FILE FOTO
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden storage/temp canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
