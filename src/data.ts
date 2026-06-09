/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Jabatan, Question, Submission } from "./types";

export const DEFAULT_JABATAN_LIST: Jabatan[] = [
  {
    id: "pretest_umum",
    name: "Pre-Test Karyawan (Umum)",
    description: "Ujian evaluasi kompetensi umum, standar disiplin kerja, K3, komunikasi, serta pemecahan masalah.",
    timeLimitMinutes: 15,
    passingScore: 70,
    sandi: "10"
  },
  {
    id: "pretest_kebun",
    name: "Asisten & Mandor Kebun",
    description: "Evaluasi lapangan terkait kepemimpinan regu, teknik agronomi dasar, manajemen konflik, dan akuntabilitas kerja.",
    timeLimitMinutes: 15,
    passingScore: 75,
    sandi: "25"
  },
  {
    id: "pretest_admin_dept",
    name: "Pelaksana Administrasi & HR",
    description: "Pemberkasan dinas niaga, penguasaan rumus-rumus spreadsheet Excel, etika telepon, dan tata kelola arsip modern.",
    timeLimitMinutes: 15,
    passingScore: 70,
    sandi: "50"
  },
  {
    id: "pretest_it_support",
    name: "IT Support & Infrastruktur",
    description: "Keamanan siber, protokol HTTPS dan DNS, pemecahan masalah kegagalan keras (hardware), serta strategi backup data.",
    timeLimitMinutes: 15,
    passingScore: 80,
    sandi: "99"
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // Operator Produksi Questions mapped to pretest_umum
  {
    id: "op_01",
    jabatanId: "pretest_umum",
    questionText: "Apa kepanjangan yang benar dari istilah K3 dalam lingkungan industri?",
    options: [
      "Keselamatan, Kebersihan, dan Ketertiban",
      "Kesehatan dan Keselamatan Kerja",
      "Kesejahteraan, Keadilan, dan Keamanan",
      "Kepemimpinan, Kerapihan, dan Ketangkasan"
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "op_02",
    jabatanId: "pretest_umum",
    questionText: "Dalam konsep 5S/5R, aktivitas memisahkan barang-barang berguna dari yang tidak terpakai, lalu membuang barang yang tidak diperlukan disebut?",
    options: [
      "Seiri (Ringkas)",
      "Seiton (Rapi)",
      "Seiso (Resik)",
      "Shitsuke (Rajin)"
    ],
    correctOptionIndex: 0,
    points: 20,
  },
  {
    id: "op_03",
    jabatanId: "pretest_umum",
    questionText: "Tindakan pertama apa yang paling tepat jika Anda menemukan oli bocor dan menggenang di lantai gang produksi?",
    options: [
      "Mengabaikannya karena bukan area tugas pribadi Anda.",
      "Melompati genangan tersebut dan melanjutkan perjalanan untuk mengejar target produksi.",
      "Segera memberi tanda bahaya (warning), melapor ke pimpinan kerja/K3, dan membantu membersihkannya untuk mencegah kecelakaan terpeleset.",
      "Menunggu pergantian shift jam kerja berikutnya agar dibersihkan petugas kebersihan khusus."
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "op_04",
    jabatanId: "pretest_umum",
    questionText: "Alat Pelindung Diri (APD) manakah yang wajib dipakai oleh operator yang bekerja di dekat mesin bising tinggi demi mencegah gangguan pendengaran?",
    options: [
      "Kacamata Safety (Google)",
      "Sumbat Telinga (Earplug/Earmuff)",
      "Masker Respirator Kimia",
      "Sarung Tangan Karet Tebal"
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "op_05",
    jabatanId: "pretest_umum",
    questionText: "Melakukan perawatan mesin secara terencana sebelum mesin mengalami kerusakan tak terduga disebut sebagai jenis perawatan?",
    options: [
      "Breakdown Maintenance",
      "Reactive Maintenance",
      "Preventive Maintenance",
      "Emergency Maintenance"
    ],
    correctOptionIndex: 2,
    points: 20,
  },

  // Staff Administrasi Questions mapped to pretest_admin_dept
  {
    id: "adm_01",
    jabatanId: "pretest_admin_dept",
    questionText: "Fungsi/rumus manakah di Microsoft Excel yang secara khusus digunakan untuk menjumlahkan seluruh nilai numerik pada sekumpulan sel terpilih?",
    options: [
      "=AVERAGE()",
      "=COUNT()",
      "=SUM()",
      "=VLOOKUP()"
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "adm_02",
    jabatanId: "pretest_admin_dept",
    questionText: "Apa tujuan utama dari diterapkannya pengelolaan sistem pengarsipan berkas dokumen yang dinamis dan terstruktur?",
    options: [
      "Agar tumpukan dokumen kertas di lemari terlihat estetik dan rapi.",
      "Memudahkan pencarian dan pengeluaran kembali dokumen penting secara cepat dan presisi saat dibutuhkan oleh manajemen.",
      "Mengurangi kebutuhan ruang ber-AC di dalam kantor.",
      "Menghindari beban bayar asuransi untuk gedung kantor."
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "adm_03",
    jabatanId: "pretest_admin_dept",
    questionText: "Formulasi salam pembuka mana yang paling tepat, sopan, dan baku untuk digunakan pada surat resmi/dinas niaga?",
    options: [
      "Halo Teman Semuanya,",
      "Assalamualaikum Warahmatullahi Wabarakatuh,",
      "Dengan hormat,",
      "Kepada Yth. Kawan baik di tempat,"
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "adm_04",
    jabatanId: "pretest_admin_dept",
    questionText: "Apa kepanjangan dari terminologi e-Filing yang sering diimplementasikan dalam pengarsipan modern dan administrasi perpajakan?",
    options: [
      "Electronic Filing (Pengisian dokumen online)",
      "Emergency File (Pemberkasan darurat)",
      "Extra Filling (Pengisian kuota dokumen tambahan)",
      "Economic Folder (Folder hemat energi)"
    ],
    correctOptionIndex: 0,
    points: 20,
  },
  {
    id: "adm_05",
    jabatanId: "pretest_admin_dept",
    questionText: "Apabila ada panggilan telepon masuk untuk Direktur yang kebetulan sedang memimpin rapat dinas penting tertutup, apa tindakan admin terbaik?",
    options: [
      "Langsung menyambungkan panggilan telepon ke ruang rapat Direktur.",
      "Meminta penelepon mematikan telepon dan memberi saran agar menelepon besok pagi saja.",
      "Menjelaskan dengan sopan bahwa pimpinan sedang rapat tertutup, mencatat nama penelepon, instansi, poin esensial pembicaraan, dan menawarkan diri agar nanti pimpinan menelepon balik seusai rapat.",
      "Memberikan nomor HP pribadi Direktur agar penelepon bisa menghubungi secara mandiri lewat WhatsApp."
    ],
    correctOptionIndex: 2,
    points: 20,
  },

  // Supervisor Lapangan Questions mapped to pretest_kebun
  {
    id: "spv_01",
    jabatanId: "pretest_kebun",
    questionText: "Gaya kepemimpinan di mana seorang supervisor aktif mendiskusikan masalah, mendengarkan argumen, dan melibatkan anggota tim dalam mengambil keputusan operasional disebut?",
    options: [
      "Otokratis (Mutlak)",
      "Laissez-Faire (Bebas penuh)",
      "Demokratis (Partisipatif)",
      "Birokrasi Kaku"
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "spv_02",
    jabatanId: "pretest_kebun",
    questionText: "Apa kepanjangan dari akronim KPI yang menjadi pilar utama pengukuran performa operasional tim?",
    options: [
      "Key Production Instrument",
      "Kualitas Produk Internal",
      "Key Performance Indicator",
      "Keuntungan Perusahaan Induk"
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "spv_03",
    jabatanId: "pretest_kebun",
    questionText: "Tindakan pertama apa yang paling bijak dilakukan jika terjadi sengketa pribadi di lapangan antara dua karyawan yang berada langsung di bawah pengawasan Anda?",
    options: [
      "Membiarkan konflik tersebut selesai sendiri karena hal itu persoalan pribadi mereka.",
      "Meminta salah satu karyawan untuk langsung mengundurkan diri sepihak.",
      "Memanggil kedua belah pihak secara personal, memediasi perselisihan secara objektif, mendengarkan kedua sudut pandang di tempat tenang/ruang tertutup, dan menyepakati solusi solutif agar tidak mengganggu operasional.",
      "Melaporkan kasus tersebut secara dramatis ke media sosial perusahaan agar jera."
    ],
    correctOptionIndex: 2,
    points: 20,
  },
  {
    id: "spv_04",
    jabatanId: "pretest_kebun",
    questionText: "Bagaimana kriteria utama untuk mengukur dan mengevaluasi efisiensi operasional tim kerja lapangan?",
    options: [
      "Hanya melihat seberapa ramainya suasana kerja di lokasi tanpa memperdulikan output.",
      "Menghitung perbandingan antara output hasil produksi nyata dengan target input (biaya, jam kerja, bahan baku) yang dialokasikan sebelumnya.",
      "Berdasarkan laporan kepuasan subyektif harian dari masing-masing pekerja.",
      "Mengandalkan firasat tanpa mengacu pada data laporan."
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "spv_05",
    jabatanId: "pretest_kebun",
    questionText: "Meskipun supervisor telah mendelegasikan wewenang pengerjaan suatu tugas teknis kepada ketua regu bawahan, siapa pihak yang memegang akuntabilitas (tanggung jawab akhir) atas kualitas kerja di mata direksi?",
    options: [
      "Ketua regu bawahan tersebut sepenuhnya.",
      "Supervisor lapangan yang memberikan delegasi.",
      "Petugas keamanan pabrik.",
      "Human Resource Department (HRD)"
    ],
    correctOptionIndex: 1,
    points: 20,
  },

  // IT Support Questions mapped to pretest_it_support
  {
    id: "it_01",
    jabatanId: "pretest_it_support",
    questionText: "Protokol transmisi data aman di web browser yang menggunakan enkripsi SSL/TLS ditunjukkan oleh ikon gembok hijau di URL adalah?",
    options: [
      "HTTP",
      "HTTPS",
      "FTP",
      "TELNET"
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "it_02",
    jabatanId: "pretest_it_support",
    questionText: "Apakah kepanjangan dari terminologi IP Address yang merujuk pada alamat identitas unik setiap komputer dalam jaringan?",
    options: [
      "Internet Protocol Address",
      "Internal Port Address",
      "Intranet Processor Address",
      "Immediate Packet Address"
    ],
    correctOptionIndex: 0,
    points: 20,
  },
  {
    id: "it_03",
    jabatanId: "pretest_it_support",
    questionText: "Sebuah laptop kantor milik divisi keuangan dilaporkan mati total secara tiba-tiba ketika kabel chargernya dilepas. Apa langkah penanganan hardware pertama yang rasional?",
    options: [
      "Langsung melakukan format harddisk dan reinstall sistem operasi Windows.",
      "Memeriksa kondisi fisik baterai laptop, menguji keandalan charger baterai, dan memeriksa apakah port pengisian daya mengalami kelonggaran.",
      "Menyarankan membeli laptop baru dengan spesifikasi tertinggi demi keamanan.",
      "Membongkar seluruh komponen motherboard tanpa peralatan keselamatan listrik ESD."
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "it_04",
    jabatanId: "pretest_it_support",
    questionText: "Untuk mengantisipasi bahaya serangan virus Ransomware yang merusak berkas perusahaan, dikenal kebijakan backup 3-2-1. Apa interpretasi praktis dari rumus perlindungan data tersebut?",
    options: [
      "Melakukan backup data setiap 3 minggu sekali, menggunakan 2 USB Flashdisk, dan menyewa 1 server.",
      "Memertahankan minimal 3 salinan data, menyimpannya di 2 jenis media berbeda, dan menyalin minimal 1 salinan di lokasi fisik di luar gedung utama (off-site/cloud).",
      "Hanya memakai 3 komputer, dikelola 2 admin IT, dengan sistem enkripsi 1-bit.",
      "Menyalin arsip data 3 kali di dalam satu folder harddisk lokal yang sama."
    ],
    correctOptionIndex: 1,
    points: 20,
  },
  {
    id: "it_05",
    jabatanId: "pretest_it_support",
    questionText: "Ditinjau dari fungsionalitas infrastruktur jaringan, apa fungsi mendasar dari DNS (Domain Name System)?",
    options: [
      "Mengamankan data transmisi modem dari peretasan siber.",
      "Mentranslasikan nama domain alamat situs web (seperti google.com) menjadi deretan alamat IP komputer numerik agar bisa dibaca perute.",
      "Mengatur kecepatan bandwidth internet agar terbagi rata antar divisi.",
      "Menyalin memori penyimpanan lokal ke kartu memori eksternal."
    ],
    correctOptionIndex: 1,
    points: 20,
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub_01",
    nik: "3172010906950001",
    name: "Rian Hermawan",
    jabatanId: "pretest_umum",
    jabatanName: "Pre-Test Karyawan (Umum)",
    score: 100,
    totalQuestions: 5,
    correctAnswersCount: 5,
    timeTakenSeconds: 312,
    timestamp: Date.now() - 3 * 3600 * 1000 - 15 * 60 * 1000,
    certificateId: "CERT-GEN-2026-081",
    isPassed: true,
    answers: { "op_01": 1, "op_02": 0, "op_03": 2, "op_04": 1, "op_05": 2 }
  },
  {
    id: "sub_02",
    nik: "3201041210920005",
    name: "Siti Rahmawati",
    jabatanId: "pretest_admin_dept",
    jabatanName: "Pelaksana Administrasi & HR",
    score: 80,
    totalQuestions: 5,
    correctAnswersCount: 4,
    timeTakenSeconds: 420,
    timestamp: Date.now() - 25 * 3600 * 1000,
    certificateId: "CERT-GEN-2026-014",
    isPassed: true,
    answers: { "adm_01": 2, "adm_02": 1, "adm_03": 2, "adm_04": 0, "adm_05": 1 }
  },
];
