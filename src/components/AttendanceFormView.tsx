import React, {useEffect, useRef, useState} from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  ImagePlus,
  ShieldAlert,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import {AVAILABLE_CLASSES, AVAILABLE_SUBJECTS} from '../data/seedData';
import {
  AttendanceRecord,
  AttendanceStatus,
  SubjectSchedule,
  UserAccount,
} from '../types';
import {captureVideoFrame, compressProofImage} from '../utils/imageCompress';
import {getTodayDateKey} from '../utils/notifications';

interface AttendanceFormViewProps {
  user: UserAccount;
  schedules: SubjectSchedule[];
  preselectedSchedule: SubjectSchedule | null;
  onSubmitRecord: (record: AttendanceRecord) => void;
  onGoToHistory: () => void;
}

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
  desc: string;
  icon: React.ComponentType<{className?: string}>;
}> = [
  {
    value: AttendanceStatus.HADIR,
    label: 'Hadir',
    desc: 'Mengikuti pelajaran tepat waktu',
    icon: CheckCircle2,
  },
  {
    value: AttendanceStatus.TERLAMBAT,
    label: 'Terlambat',
    desc: 'Hadir setelah jam mulai kelas',
    icon: Clock,
  },
  {
    value: AttendanceStatus.IZIN,
    label: 'Izin',
    desc: 'Berhalangan dengan keterangan resmi',
    icon: ShieldAlert,
  },
  {
    value: AttendanceStatus.SAKIT,
    label: 'Sakit',
    desc: 'Sedang pemulihan kesehatan',
    icon: Stethoscope,
  },
];

export const AttendanceFormView: React.FC<AttendanceFormViewProps> = ({
  user,
  schedules,
  preselectedSchedule,
  onSubmitRecord,
  onGoToHistory,
}) => {
  const [selectedClass, setSelectedClass] = useState(
    preselectedSchedule?.className || user.className
  );
  const [selectedSubject, setSelectedSubject] = useState(
    preselectedSchedule?.subject || AVAILABLE_SUBJECTS[0]
  );
  const [status, setStatus] = useState<AttendanceStatus>(AttendanceStatus.HADIR);
  const [isCheckedConfirm, setIsCheckedConfirm] = useState(true);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // Live Camera Modal State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (preselectedSchedule) {
      setSelectedClass(preselectedSchedule.className);
      setSelectedSubject(preselectedSchedule.subject);
      setSubmittedRecord(null);
    } else {
      setSelectedClass(user.className);
    }
  }, [preselectedSchedule, user.className]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const classSubjects = Array.from(
    new Set([
      ...schedules
        .filter((s) => s.className === selectedClass)
        .map((s) => s.subject),
      ...AVAILABLE_SUBJECTS,
    ])
  );

  const matchedTeacher =
    preselectedSchedule?.subject === selectedSubject &&
    preselectedSchedule?.className === selectedClass
      ? preselectedSchedule.teacher
      : schedules.find(
          (s) => s.className === selectedClass && s.subject === selectedSubject
        )?.teacher || '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressProofImage(file);
      setProofImage(compressed);
      setProofFileName(file.name);
    } catch {
      setErrorMsg('Gagal memproses file foto bukti. Pastikan memilih file gambar.');
    }
  };

  const openCamera = async () => {
    setCameraError('');
    setErrorMsg('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Kamera langsung tidak tersedia di browser ini. Gunakan tombol Pilih Foto / Galeri.'
      );
      setCameraOpen(true);
      return;
    }
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: 'environment'},
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Izin kamera ditolak atau tidak terdeteksi. Silakan unggah foto bukti dari galeri.'
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const dataUrl = captureVideoFrame(videoRef.current);
    setProofImage(dataUrl);
    setProofFileName(`bukti_kamera_${Date.now()}.jpg`);
    closeCamera();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isCheckedConfirm) {
      setErrorMsg(
        'Silakan centang kotak konfirmasi kehadiran sebelum mengirim absensi.'
      );
      return;
    }

    if (!proofImage) {
      setErrorMsg(
        'Mohon unggah atau ambil foto bukti kehadiran (foto kelas, catatan, atau surat izin) terlebih dahulu.'
      );
      return;
    }

    const now = new Date();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      className: selectedClass,
      subject: selectedSubject,
      scheduleId: preselectedSchedule?.id,
      status,
      checked: true,
      proofImage,
      proofFileName: proofFileName || 'bukti_absensi.jpg',
      note: note.trim() || `Absensi ${selectedSubject} kelas ${selectedClass}.`,
      timestamp: now.toISOString(),
      dateKey: getTodayDateKey(now),
    };

    onSubmitRecord(record);
    setSubmittedRecord(record);
    setNote('');
  };

  const handleResetForNext = () => {
    setSubmittedRecord(null);
    setProofImage('');
    setProofFileName('');
    setStatus(AttendanceStatus.HADIR);
    setIsCheckedConfirm(true);
    setNote('');
    setErrorMsg('');
  };

  if (submittedRecord) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-white">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
            Absensi &amp; Centang Tersimpan
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Kehadiranmu untuk pelajaran {submittedRecord.subject} telah tercatat
            bersama bukti foto.
          </p>
        </div>

        <div className="mt-6 divide-y divide-slate-100 border-t border-b border-slate-100 text-sm">
          <div className="flex justify-between py-3">
            <span className="text-slate-500">Nama Siswa</span>
            <span className="font-semibold text-slate-900">
              {submittedRecord.userName}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500">Kelas &amp; Pelajaran</span>
            <span className="font-semibold text-slate-900">
              {submittedRecord.className} · {submittedRecord.subject}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500">Status &amp; Centang</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700 capitalize">
              <CheckCircle2 className="h-4 w-4" />
              {submittedRecord.status} (Tercentang)
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500">Waktu Tercatat</span>
            <span className="font-mono text-slate-900 tabular-nums">
              {new Date(submittedRecord.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {submittedRecord.proofImage && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Lampiran Bukti Foto
            </p>
            <img
              src={submittedRecord.proofImage}
              alt="Bukti absensi tersimpan"
              className="h-48 w-full rounded-xl border border-slate-200 object-cover"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleResetForNext}
            className="flex-1 min-h-[44px] rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 cursor-pointer"
          >
            Absen Pelajaran Lain
          </button>
          <button
            type="button"
            onClick={onGoToHistory}
            className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            Lihat Riwayat Absensi
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Catat Absensi &amp; Bukti Pelajaran
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pilih kelas, mata pelajaran, status kehadiran, unggah bukti foto, lalu
          berikan centang konfirmasi.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
      >
        {/* Step 1: Class and Subject */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="absen-class"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              1. Pilih Kelas
            </label>
            <select
              id="absen-class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              {AVAILABLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="absen-subject"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              2. Mata Pelajaran
            </label>
            <select
              id="absen-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              {classSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        {matchedTeacher && (
          <p className="text-xs text-slate-600">
            Guru Pengampu ({selectedClass} · {selectedSubject}):{' '}
            <span className="font-semibold text-slate-900">{matchedTeacher}</span>
          </p>
        )}

        {/* Step 2: Status Selection with Checkmarks */}
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-semibold text-slate-800 mb-3">
            3. Pilih Status Kehadiran
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/60 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Proof Upload / Camera */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                4. Bukti Kehadiran (Foto Kelas / Catatan / Surat)
              </p>
              <p className="text-xs text-slate-500">
                Ambil langsung dari kamera HP atau unggah foto dari galeri.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!proofImage ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={openCamera}
                className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <Camera className="h-4 w-4 text-teal-700" />
                <span>Ambil Foto Kamera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                <ImagePlus className="h-4 w-4 text-teal-700" />
                <span>Pilih Foto / Galeri</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <img
                src={proofImage}
                alt="Pratinjau bukti kehadiran"
                className="h-56 w-full rounded-lg object-cover bg-white"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[240px]">
                    {proofFileName || 'bukti_absensi.jpg'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProofImage('');
                    setProofFileName('');
                  }}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Ganti Foto</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Note & Explicit Checkmark Confirmation */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div>
            <label
              htmlFor="absen-note"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              5. Catatan Singkat (Opsional)
            </label>
            <textarea
              id="absen-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Materi hari ini membahas Hukum Newton II, hadir di bangku depan."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCheckedConfirm((prev) => !prev)}
            className={`flex w-full min-h-[52px] items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
              isCheckedConfirm
                ? 'border-teal-700 bg-teal-50/70'
                : 'border-slate-300 bg-white hover:bg-slate-50'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                isCheckedConfirm
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-slate-400 bg-white'
              }`}
            >
              {isCheckedConfirm && <Check className="h-4 w-4" />}
            </span>
            <span className="text-sm font-medium text-slate-800">
              Centang Konfirmasi: Saya menyatakan data kelas, mata pelajaran, dan
              bukti foto absensi ini benar.
            </span>
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.99] cursor-pointer"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>Kirim Absensi &amp; Simpan Centang</span>
        </button>
      </form>

      {/* Camera Capture Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Ambil Foto Bukti Kehadiran
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup kamera"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="py-8 text-center">
                <p className="text-sm text-rose-700">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    closeCamera();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 cursor-pointer"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span>Pilih dari Galeri</span>
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 overflow-hidden rounded-xl bg-slate-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-72 w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Jepret Bukti</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
