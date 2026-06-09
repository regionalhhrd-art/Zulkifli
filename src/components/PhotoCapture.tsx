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
        // Preview State
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-teal-50/50 border border-teal-100 relative">
          <div className="relative shrink-0 w-24 h-32 bg-slate-100 border-2 border-teal-500 overflow-hidden shadow-sm">
            <img src={photo} alt="Profile preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1 bg-teal-500 text-slate-950 p-1">
              <Check className="w-3 h-3 font-black" />
            </div>
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h5 className="font-bold text-slate-800 text-sm">Foto Berhasil Tertangkap!</h5>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Dokumentasi portrait wajah Anda telah berhasil dimuat secara aman. Foto ini akan otomatis terintegrasi pada lembar ujian resmi dan berkas cetak sertifikat kelulusan HRD.
            </p>
            <button
              type="button"
              onClick={clearPhoto}
              className="inline-flex items-center gap-1.5 bg-white border border-rose-200 hover:border-rose-400 text-rose-700 font-bold px-3 py-1.5 transition text-[10px] uppercase font-mono cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Retake / Hapus Foto
            </button>
          </div>
        </div>
      ) : (
        // Capture/Upload State
        <div className="border border-slate-205 bg-slate-50 overflow-hidden">
          {activeTab === "camera" ? (
            <div className="p-4 flex flex-col items-center justify-center min-h-[220px] relative text-center">
              {cameraError ? (
                <div className="p-4 space-y-3 max-w-sm">
                  <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-[11px] text-rose-800 font-medium leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setActiveTab("upload");
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold font-mono uppercase text-[9px] border border-slate-300 rounded-none cursor-pointer"
                  >
                    Beralih Ke Unggah File
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-xs space-y-3 flex flex-col items-center">
                  <div className="w-48 h-48 bg-slate-900 border border-slate-800 relative flex items-center justify-center overflow-hidden">
                    {/* Live Video Viewport */}
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                      style={{ display: stream ? "block" : "none" }}
                    />
                    {!stream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-slate-400">
                        <Camera className="w-8 h-8 animate-pulse text-slate-500 mb-2" />
                        <span className="text-[10px] font-mono uppercase tracking-wide">
                          {isCameraStarting ? "Memulai Kamera..." : "Kamera Non-Aktif"}
                        </span>
                      </div>
                    )}
                  </div>

                  {stream ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1.5 rounded-none"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Ambil Foto Sekarang
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isCameraStarting}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1.5 rounded-none disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCameraStarting ? "animate-spin" : ""}`} />
                      Aktifkan Webcam
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Upload Tab
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 flex flex-col items-center justify-center min-h-[220px] transition text-center cursor-pointer ${
                dragActive ? "bg-teal-50/50 border-2 border-dashed border-teal-450" : "hover:bg-slate-100/50"
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
              <Upload className="w-8 h-8 text-slate-400 mb-3" />
              <p className="font-bold text-slate-700 mb-1">Tarik & Lepas file foto Anda di sini</p>
              <p className="text-slate-400 text-[10px] mb-3">atau klik di sini untuk menelusuri berkas dari perangkat Anda</p>
              <span className="inline-block px-3 py-1.5 bg-slate-900 text-white font-mono uppercase tracking-wider text-[9px] font-bold">
                PILIH BERKAS GAMBAR
              </span>
              <p className="text-[9px] text-slate-400 mt-4 leading-relaxed font-mono">
                Format yang didukung: JPG, JPEG, PNG • Maksimal file 4 MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden storage/temp canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
