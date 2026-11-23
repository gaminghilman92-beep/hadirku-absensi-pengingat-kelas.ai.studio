import React, {useMemo, useState} from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Image as ImageIcon,
  Search,
  ShieldAlert,
  Stethoscope,
  X,
} from 'lucide-react';
import {AttendanceRecord, AttendanceStatus, UserAccount} from '../types';

interface HistoryViewProps {
  user: UserAccount;
  records: AttendanceRecord[];
}

const FILTER_TABS: Array<{value: 'all' | AttendanceStatus; label: string}> = [
  {value: 'all', label: 'Semua'},
  {value: AttendanceStatus.HADIR, label: 'Hadir'},
  {value: AttendanceStatus.TERLAMBAT, label: 'Terlambat'},
  {value: AttendanceStatus.IZIN, label: 'Izin'},
  {value: AttendanceStatus.SAKIT, label: 'Sakit'},
];

export const HistoryView: React.FC<HistoryViewProps> = ({user, records}) => {
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRecord, setPreviewRecord] = useState<AttendanceRecord | null>(
    null
  );

  const userRecords = useMemo(() => {
    return records
      .filter((r) => r.userId === user.id)
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [records, user.id]);

  const counts = useMemo(() => {
    return {
      hadir: userRecords.filter((r) => r.status === AttendanceStatus.HADIR)
        .length,
      terlambat: userRecords.filter(
        (r) => r.status === AttendanceStatus.TERLAMBAT
      ).length,
      izin: userRecords.filter((r) => r.status === AttendanceStatus.IZIN).length,
      sakit: userRecords.filter((r) => r.status === AttendanceStatus.SAKIT)
        .length,
    };
  }, [userRecords]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return userRecords.filter((r) => {
      const matchFilter = filter === 'all' || r.status === filter;
      const matchQuery =
        !q ||
        r.subject.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.note.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [userRecords, filter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Tanggal',
      'Waktu',
      'Nama',
      'Kelas',
      'Mata Pelajaran',
      'Status',
      'Centang',
      'File Bukti',
      'Catatan',
    ];
    const rows = filteredRecords.map((r) => [
      r.dateKey,
      new Date(r.timestamp).toLocaleTimeString('id-ID'),
      `"${r.userName.replace(/"/g, '""')}"`,
      `"${r.className.replace(/"/g, '""')}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      r.status,
      r.checked ? 'Tercentang' : 'Belum',
      `"${r.proofFileName.replace(/"/g, '""')}"`,
      `"${r.note.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-absensi-${user.className.replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.HADIR:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Hadir</span>
          </span>
        );
      case AttendanceStatus.TERLAMBAT:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Clock className="h-4 w-4" />
            <span>Terlambat</span>
          </span>
        );
      case AttendanceStatus.IZIN:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700">
            <ShieldAlert className="h-4 w-4" />
            <span>Izin</span>
          </span>
        );
      case AttendanceStatus.SAKIT:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <Stethoscope className="h-4 w-4" />
            <span>Sakit</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Riwayat &amp; Bukti Absensi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Rekap seluruh kehadiran, status centang, dan lampiran bukti foto
            untuk kelas {user.className}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredRecords.length === 0}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Unduh Rekap CSV</span>
        </button>
      </div>

      {/* Summary Counts */}
      <section className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Hadir</p>
          <p className="mt-1 font-display text-2xl font-bold text-teal-700 tabular-nums">
            {counts.hadir}
          </p>
        </div>
        <div className="sm:border-l sm:border-slate-100 sm:pl-5">
          <p className="text-xs text-slate-500">Terlambat</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums">
            {counts.terlambat}
          </p>
        </div>
        <div className="sm:border-l sm:border-slate-100 sm:pl-5">
          <p className="text-xs text-slate-500">Izin</p>
          <p className="mt-1 font-display text-2xl font-bold text-sky-700 tabular-nums">
            {counts.izin}
          </p>
        </div>
        <div className="sm:border-l sm:border-slate-100 sm:pl-5">
          <p className="text-xs text-slate-500">Sakit</p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-700 tabular-nums">
            {counts.sakit}
          </p>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-100">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelajaran atau catatan..."
              className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada catatan absensi yang sesuai filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((rec) => {
              const dt = new Date(rec.timestamp);
              const dateLabel = dt.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeLabel = dt.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rec.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white"
                      title="Absensi tercentang"
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          {rec.subject}
                        </h3>
                        <span className="text-xs text-slate-400">·</span>
                        {renderStatusLabel(rec.status)}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                        {dateLabel} · {timeLabel} · Kelas {rec.className}
                      </p>
                      {rec.note && (
                        <p className="mt-1 text-xs text-slate-600">{rec.note}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-12 sm:pl-0 shrink-0">
                    {rec.proofImage ? (
                      <button
                        type="button"
                        onClick={() => setPreviewRecord(rec)}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={rec.proofImage}
                          alt={`Bukti ${rec.subject}`}
                          className="h-6 w-6 rounded object-cover"
                        />
                        <span>Lihat Bukti</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[140px]">
                          {rec.proofFileName}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Proof Image Lightbox */}
      {previewRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={() => setPreviewRecord(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Bukti Absensi · {previewRecord.subject}
                </h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  {previewRecord.className} · {previewRecord.dateKey}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRecord(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup pratinjau"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={previewRecord.proofImage}
              alt={`Bukti foto ${previewRecord.subject}`}
              className="mt-4 max-h-[65vh] w-full rounded-xl object-contain bg-slate-100"
            />
            {previewRecord.note && (
              <p className="mt-3 text-xs text-slate-600">{previewRecord.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
