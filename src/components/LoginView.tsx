import React, {useState} from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  AVAILABLE_SUBJECTS,
  DEVELOPER_NAME,
  MOTIVATION_QUOTES,
  SCHOOL_NAME,
  SCHOOL_TERM,
  TEACHERS_BY_ID,
} from '../data/seedData';
import {UserAccount} from '../types';
import {
  getUsers,
  saveUsers,
  setCurrentSession,
  updateUserProfile,
} from '../utils/storage';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

const HERO_STUDY_IMG = '/src/assets/images/hero_study_desk_1795431079100.jpg';
const TEACHER_NAME_SUGGESTIONS = Object.values(TEACHERS_BY_ID).filter(
  (t) => t !== 'Kepala Sekolah'
);

function isValidBelajarEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  return /^[^\s@]+@([a-z0-9-]+\.)*belajar\.id$/.test(lower);
}

function isValidGmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  return /^[^\s@]+@gmail\.com$/.test(lower);
}

export const LoginView: React.FC<LoginViewProps> = ({onLoginSuccess}) => {
  const [accountType, setAccountType] = useState<'siswa' | 'guru'>('siswa');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Shared credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [className, setClassName] = useState(AVAILABLE_CLASSES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  // Teacher-specific fields (Belajar.id + Gmail verification + Mapel form)
  const [gmailEmail, setGmailEmail] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [gmailVerified, setGmailVerified] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Bahasa Inggris',
  ]);
  const [nip, setNip] = useState('');

  const quote = MOTIVATION_QUOTES[0];

  const resetVerificationState = () => {
    setSentOtpCode('');
    setOtpInput('');
    setGmailVerified(false);
  };

  const handleSwitchAccountType = (type: 'siswa' | 'guru') => {
    setAccountType(type);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setGmailEmail('');
    resetVerificationState();
  };

  const handleFillDemoStudent = () => {
    setAccountType('siswa');
    setMode('login');
    setEmail('siswa@hadirku.id');
    setPassword('123456');
    setErrorMsg('');
  };

  const handleFillDemoTeacher = () => {
    setAccountType('guru');
    setMode('login');
    setEmail('sosielga@guru.smp.belajar.id');
    setGmailEmail('sosielga.guru@gmail.com');
    setPassword('123456');
    setSentOtpCode('648291');
    setOtpInput('648291');
    setGmailVerified(true);
    setErrorMsg('');
  };

  const handleSendGmailCode = () => {
    setErrorMsg('');
    if (!isValidGmail(gmailEmail)) {
      setErrorMsg(
        'Masukkan alamat Gmail guru yang valid (harus berakhiran @gmail.com) untuk verifikasi.'
      );
      return;
    }
    const generated = String(Math.floor(100000 + Math.random() * 899999));
    setSentOtpCode(generated);
    setOtpInput('');
    setGmailVerified(false);
  };

  const handleVerifyOtp = () => {
    setErrorMsg('');
    if (!sentOtpCode) return;
    if (otpInput.trim() === sentOtpCode) {
      setGmailVerified(true);
    } else {
      setErrorMsg('Kode verifikasi Gmail belum sesuai. Periksa kembali kode 6 digit.');
    }
  };

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    const users = getUsers();

    // TEACHER LOGIN / REGISTER FLOW
    if (accountType === 'guru') {
      if (!isValidBelajarEmail(trimmedEmail)) {
        setErrorMsg(
          'Akun khusus guru wajib menggunakan email Belajar.id (contoh: nama@guru.smp.belajar.id atau @belajar.id).'
        );
        return;
      }

      if (!isValidGmail(gmailEmail)) {
        setErrorMsg(
          'Masukkan alamat Gmail aktif guru (@gmail.com) untuk verifikasi identitas guru.'
        );
        return;
      }

      if (!gmailVerified) {
        setErrorMsg(
          'Silakan kirim dan verifikasi kode ke Gmail guru terlebih dahulu sebelum melanjutkan.'
        );
        return;
      }

      if (mode === 'login') {
        const matched = users.find(
          (u) =>
            u.role === 'Guru' &&
            (u.email.toLowerCase() === trimmedEmail ||
              u.belajarEmail?.toLowerCase() === trimmedEmail) &&
            u.password === password
        );

        if (!matched) {
          setErrorMsg(
            'Email Belajar.id atau kata sandi guru belum terdaftar. Gunakan Daftar Baru Guru atau tombol Isi Demo Guru.'
          );
          return;
        }

        const updatedTeacher: UserAccount = {
          ...matched,
          className,
          gmailEmail: gmailEmail.trim().toLowerCase(),
          gmailVerified: true,
        };
        updateUserProfile(updatedTeacher);
        setCurrentSession(updatedTeacher.id);
        onLoginSuccess(updatedTeacher);
        return;
      }

      // Register New Teacher
      if (!name.trim()) {
        setErrorMsg('Nama lengkap guru wajib diisi.');
        return;
      }
      if (selectedSubjects.length === 0) {
        setErrorMsg('Pilih minimal satu mata pelajaran (Mapel) yang Anda ampu.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Kata sandi minimal 4 karakter.');
        return;
      }
      if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        setErrorMsg('Email Belajar.id ini sudah terdaftar. Silakan pilih tab Masuk.');
        return;
      }

      const newTeacher: UserAccount = {
        id: `guru-${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        password,
        nisn: nip.trim() || '-',
        nip: nip.trim() || '-',
        className,
        role: 'Guru',
        belajarEmail: trimmedEmail,
        gmailEmail: gmailEmail.trim().toLowerCase(),
        gmailVerified: true,
        teachingSubjects: selectedSubjects,
        teachingClasses: [className],
        teacherFormCompleted: true,
        dailyGoal: `Mengajar ${selectedSubjects.join(', ')} dengan penuh semangat dan memantau kehadiran siswa.`,
        createdAt: new Date().toISOString(),
      };

      saveUsers([...users, newTeacher]);
      setCurrentSession(newTeacher.id);
      onLoginSuccess(newTeacher);
      return;
    }

    // STUDENT LOGIN / REGISTER FLOW
    if (mode === 'login') {
      const matched = users.find(
        (u) =>
          u.role !== 'Guru' &&
          u.email.toLowerCase() === trimmedEmail &&
          u.password === password
      );
      if (!matched) {
        setErrorMsg(
          'Email atau kata sandi siswa belum cocok. Gunakan tombol Isi Demo Siswa atau daftar akun baru.'
        );
        return;
      }
      const updatedUser: UserAccount = {
        ...matched,
        className,
      };
      updateUserProfile(updatedUser);
      setCurrentSession(updatedUser.id);
      onLoginSuccess(updatedUser);
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama lengkap siswa wajib diisi untuk mendaftar.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setErrorMsg(
        'Email ini sudah terdaftar. Silakan masuk menggunakan kata sandi.'
      );
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      nisn:
        nisn.trim() ||
        String(Math.floor(1000000000 + Math.random() * 8999999999)),
      className,
      role: 'Siswa',
      dailyGoal:
        'Hadir tepat waktu dan fokus mengikuti seluruh jadwal pelajaran.',
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    setCurrentSession(newUser.id);
    onLoginSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:grid lg:grid-cols-12 lg:items-stretch">
      {/* Left Visual & Motivation Panel */}
      <div className="relative lg:col-span-5 bg-slate-900 text-white overflow-hidden flex flex-col justify-between min-h-[230px] lg:min-h-screen">
        {!imgFailed ? (
          <img
            src={HERO_STUDY_IMG}
            alt="Meja belajar siswa di ruang kelas yang terang"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/30" />

        <div className="relative z-10 p-6 sm:p-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              HadirKu
            </span>
          </div>
          <span className="text-xs font-medium text-slate-200">
            {SCHOOL_NAME}
          </span>
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-xl">
          <p className="text-xs font-medium tracking-wide text-teal-300">
            {SCHOOL_NAME} · {SCHOOL_TERM}
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight text-balance">
            Disiplin hadir setiap pelajaran, melangkah pasti menuju prestasi.
          </h1>
          <blockquote className="mt-5 border-t border-white/20 pt-4 text-sm sm:text-base text-slate-200 leading-relaxed">
            “{quote.quote}”
          </blockquote>
          <p className="mt-2 text-xs text-slate-300">
            {quote.author} · {quote.topic}
          </p>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {accountType === 'guru'
                ? 'Portal Masuk Guru (Belajar.id)'
                : mode === 'login'
                  ? 'Masuk ke Akun Siswa'
                  : 'Buat Akun Siswa Baru'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {accountType === 'guru'
                ? 'Khusus guru dengan email Belajar.id, verifikasi Gmail guru, dan pengisian formulir mata pelajaran.'
                : 'Pilih kelasmu di awal login agar jadwal pelajaran dan nama guru langsung sesuai.'}
            </p>
          </div>

          {/* Account Role Switcher: Siswa vs Guru Belajar.id */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchAccountType('siswa')}
              className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                accountType === 'siswa'
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAccountType('guru')}
              className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                accountType === 'guru'
                  ? 'border-teal-700 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Guru (belajar.id)</span>
            </button>
          </div>

          {/* Segmented Switcher: Masuk vs Daftar Baru */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`min-h-[42px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`min-h-[42px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {accountType === 'guru' ? 'Daftar & Isi Formulir Guru' : 'Daftar Baru'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register Identity Fields */}
            {mode === 'register' && accountType === 'siswa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama siswa"
                      className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-nisn"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    NISN / Nomor Absen
                  </label>
                  <input
                    id="reg-nisn"
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Opsional"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && accountType === 'guru' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-teacher-name"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Nama Lengkap Guru
                  </label>
                  <input
                    id="reg-teacher-name"
                    type="text"
                    list="smp3-teacher-list"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Sosi Elga Mailany, S.Pd"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  />
                  <datalist id="smp3-teacher-list">
                    {TEACHER_NAME_SUGGESTIONS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="reg-teacher-nip"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    NIP / NUPTK
                  </label>
                  <input
                    id="reg-teacher-nip"
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Opsional"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              </div>
            )}

            {/* Class Selection at Initial Login */}
            <div>
              <label
                htmlFor="auth-class"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {accountType === 'guru'
                  ? `Pilih Kelas Utama / Perwalian (${SCHOOL_NAME})`
                  : `Pilih Kelas (${SCHOOL_NAME})`}
              </label>
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="auth-class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Belajar.id / Email Siswa */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {accountType === 'guru'
                  ? 'Email Belajar.id Guru (@guru.smp.belajar.id)'
                  : 'Email Sekolah / Pengguna'}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    accountType === 'guru'
                      ? 'nama@guru.smp.belajar.id'
                      : 'siswa@hadirku.id'
                  }
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>

            {/* Teacher Gmail Verification Step */}
            {accountType === 'guru' && (
              <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="guru-gmail"
                    className="text-xs font-semibold text-slate-800"
                  >
                    Verifikasi Alamat Gmail Guru (@gmail.com)
                  </label>
                  {gmailVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                      <BadgeCheck className="h-4 w-4" />
                      Terverifikasi
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="guru-gmail"
                    type="email"
                    value={gmailEmail}
                    onChange={(e) => {
                      setGmailEmail(e.target.value);
                      resetVerificationState();
                    }}
                    placeholder="namaguru@gmail.com"
                    className="flex-1 min-h-[42px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendGmailCode}
                    className="min-h-[42px] rounded-xl border border-teal-700 bg-white px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {sentOtpCode ? 'Kirim Ulang Kode' : 'Kirim Kode Verifikasi'}
                  </button>
                </div>

                {sentOtpCode && !gmailVerified && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <p className="text-xs text-slate-700">
                      Kode verifikasi terkirim untuk{' '}
                      <span className="font-semibold">{gmailEmail}</span>. Kode
                      verifikasi Anda:{' '}
                      <span className="font-mono font-bold text-teal-800">
                        {sentOtpCode}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Masukkan 6 digit kode"
                        className="flex-1 min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="min-h-[40px] rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Teacher Subject (Mapel) Form on Registration */}
            {mode === 'register' && accountType === 'guru' && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <p className="text-xs font-semibold text-slate-800">
                  Formulir Guru: Pilih Mata Pelajaran (Mapel) yang Diampu
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const checked = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                          checked
                            ? 'border-teal-700 bg-teal-50 text-teal-900'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        <span className="truncate">{subj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white pl-10 pr-12 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                  aria-label={
                    showPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Lihat kata sandi'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.99] cursor-pointer"
            >
              <span>
                {accountType === 'guru'
                  ? mode === 'login'
                    ? 'Masuk ke Portal Guru'
                    : 'Simpan Formulir & Masuk Portal Guru'
                  : mode === 'login'
                    ? `Masuk ke Kelas ${className}`
                    : `Daftar & Masuk Kelas ${className}`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              {accountType === 'siswa' ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      Akun Demo Siswa
                    </p>
                    <p className="mt-0.5 font-mono">
                      siswa@hadirku.id · sandi: 123456
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoStudent}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-teal-700" />
                    <span>Isi Demo Siswa</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      Akun Demo Guru (Belajar.id)
                    </p>
                    <p className="mt-0.5 font-mono">
                      sosielga@guru.smp.belajar.id · sandi: 123456
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoTeacher}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BadgeCheck className="h-4 w-4 text-teal-700" />
                    <span>Isi Demo Guru</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500">
            Developer:{' '}
            <span className="font-semibold text-slate-700">
              {DEVELOPER_NAME}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
