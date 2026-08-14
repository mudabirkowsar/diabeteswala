"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AdminVideoUpload — local-only admin console for managing 6 video slots
 * and a YouTube link queue.
 *
 * No API calls: axios / sessionStorage / backend routes have been removed.
 * Everything lives in React state so you can wire your own persistence
 * layer later (swap the marked TODOs for real requests).
 *
 * Fonts: pair a clean grotesk (e.g. Inter) with a monospace (e.g. JetBrains
 * Mono) for slot labels / counters. Add via next/font/google in your root
 * layout and expose as --font-sans / --font-mono, or the Tailwind defaults
 * will simply fall back gracefully.
 */

const VIDEO_SLOTS = [1, 2, 3, 4, 5, 6];

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match?.[1] ?? null;
}

function youtubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

let idCounter = 1;
const nextId = () => `local-${idCounter++}-${Date.now()}`;

export default function AdminVideoUpload() {
  const [videos, setVideos] = useState({});
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");

  const showToast = (message, type = "info") => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingLinkId(null);
    setYoutubeUrl("");
    setYoutubeTitle("");
    setModalOpen(true);
  };

  const openEditModal = (link) => {
    setIsEditing(true);
    setEditingLinkId(link.id);
    setYoutubeUrl(link.url);
    setYoutubeTitle(link.title);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleYoutubeSubmit = (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      showToast("Paste a YouTube URL first.", "warning");
      return;
    }
    const id = extractYouTubeId(youtubeUrl.trim());
    if (!id) {
      showToast("That doesn't look like a valid YouTube URL.", "error");
      return;
    }

    // TODO: replace with a real POST/PUT request when a backend is wired up.
    if (isEditing) {
      setYoutubeLinks((prev) =>
        prev.map((l) =>
          l.id === editingLinkId
            ? { ...l, url: youtubeUrl.trim(), title: youtubeTitle.trim() || l.title, videoId: id }
            : l
        )
      );
      showToast("YouTube link updated.", "success");
    } else {
      setYoutubeLinks((prev) => [
        ...prev,
        {
          id: nextId(),
          url: youtubeUrl.trim(),
          title: youtubeTitle.trim() || "Untitled video",
          videoId: id,
        },
      ]);
      showToast("YouTube link added.", "success");
    }

    setModalOpen(false);
  };

  const deleteYoutubeLink = (linkId) => {
    if (!window.confirm("Remove this YouTube link?")) return;
    // TODO: replace with a real DELETE request when a backend is wired up.
    setYoutubeLinks((prev) => prev.filter((l) => l.id !== linkId));
    showToast("YouTube link removed.", "success");
  };

  const updateVideoSlot = (slotNumber, file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast("File is too large — 100MB max.", "error");
      return;
    }
    // TODO: replace with a real upload request when a backend is wired up.
    const url = URL.createObjectURL(file);
    setVideos((prev) => ({ ...prev, [slotNumber]: { name: file.name, size: file.size, url } }));
    showToast(`Video ${slotNumber} updated.`, "success");
  };

  const filledCount = Object.keys(videos).length;

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1B2E]">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/8 pb-6">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.25em] text-[#3D3F96]">
              Media Control
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1A1B2E] lg:text-4xl">
              Video Upload Console
            </h1>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-md bg-[#3D3F96] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4C4FB0]"
          >
            <PlusIcon />
            Add YouTube link
          </button>
        </div>

        {/* Slot board — signature element */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B7280]">
              Slot board &middot; {filledCount}/6 filled
            </p>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {VIDEO_SLOTS.map((n) => (
              <div
                key={n}
                className={`flex h-14 flex-col items-center justify-center rounded-md border font-mono text-xs transition-colors ${
                  videos[n]
                    ? "border-[#5FA777]/40 bg-[#5FA777]/10 text-[#2F7D52]"
                    : "border-black/10 bg-black/[0.02] text-[#9CA3AF]"
                }`}
              >
                <span className="text-sm font-semibold">V{n}</span>
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" />
              </div>
            ))}
          </div>
        </div>

        {/* YouTube links */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1A1B2E]">
              YouTube links{" "}
              <span className="font-mono text-sm font-normal text-[#6B7280]">
                ({youtubeLinks.length})
              </span>
            </h2>
          </div>

          {youtubeLinks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/12 bg-black/[0.02] py-14 text-center">
              <p className="text-sm text-[#6B7280]">No YouTube links yet.</p>
              <button
                onClick={openAddModal}
                className="mt-4 rounded-md border border-black/15 px-4 py-2 text-sm font-medium text-[#1A1B2E] transition-colors hover:bg-black/5"
              >
                Add your first link
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {youtubeLinks.map((link) => (
                <div
                  key={link.id}
                  className="group overflow-hidden rounded-lg border border-black/8 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[#F1F2F6]">
                    {youtubeThumbnail(link.url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={youtubeThumbnail(link.url)}
                        alt=""
                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#9CA3AF]">
                        No thumbnail
                      </div>
                    )}
                    <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
                      {link.videoId}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-medium text-[#1A1B2E]" title={link.title}>
                      {link.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#3D3F96] hover:underline"
                      >
                        Watch on YouTube ↗
                      </a>
                      <div className="flex items-center gap-1">
                        <IconButton label="Edit" onClick={() => openEditModal(link)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton label="Delete" onClick={() => deleteYoutubeLink(link.id)} danger>
                          <TrashIcon />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* File upload slots */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#1A1B2E]">File upload slots</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {VIDEO_SLOTS.map((n) => (
              <VideoSlotCard key={n} slotNumber={n} video={videos[n]} onUpload={updateVideoSlot} />
            ))}
          </div>
        </section>
      </div>

      {modalOpen && (
        <YoutubeModal
          isEditing={isEditing}
          youtubeUrl={youtubeUrl}
          youtubeTitle={youtubeTitle}
          setYoutubeUrl={setYoutubeUrl}
          setYoutubeTitle={setYoutubeTitle}
          onSubmit={handleYoutubeSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* ---------------------------- Modal ---------------------------- */

function YoutubeModal({ isEditing, youtubeUrl, youtubeTitle, setYoutubeUrl, setYoutubeTitle, onSubmit, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    // focus first field
    dialogRef.current?.querySelector("input")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit YouTube link" : "Add YouTube link"}
        className="w-full max-w-md rounded-xl border border-black/10 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] animate-[slideUp_0.18s_ease-out]"
      >
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
          <h3 className="text-base font-semibold text-[#1A1B2E]">
            {isEditing ? "Edit YouTube link" : "Add YouTube link"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#1A1B2E]"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="youtubeUrl" className="mb-1.5 block text-xs font-medium text-[#6B7280]">
              YouTube URL
            </label>
            <input
              id="youtubeUrl"
              type="url"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              className="w-full rounded-md border border-black/12 bg-[#F7F7FB] px-3.5 py-2.5 text-sm text-[#1A1B2E] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#3D3F96] focus:ring-2 focus:ring-[#3D3F96]/25"
            />
          </div>
          <div>
            <label htmlFor="youtubeTitle" className="mb-1.5 block text-xs font-medium text-[#6B7280]">
              Title <span className="text-[#9CA3AF]">(optional)</span>
            </label>
            <input
              id="youtubeTitle"
              type="text"
              value={youtubeTitle}
              onChange={(e) => setYoutubeTitle(e.target.value)}
              placeholder="Enter a title"
              className="w-full rounded-md border border-black/12 bg-[#F7F7FB] px-3.5 py-2.5 text-sm text-[#1A1B2E] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#3D3F96] focus:ring-2 focus:ring-[#3D3F96]/25"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-black/5 hover:text-[#1A1B2E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3D3F96] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4C4FB0]"
            >
              {isEditing ? "Save changes" : "Add link"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------ Video slot card ------------------------ */

function VideoSlotCard({ slotNumber, video, onUpload }) {
  const [pendingFile, setPendingFile] = useState(null);
  const inputRef = useRef(null);

  const handleChange = (e) => setPendingFile(e.target.files?.[0] ?? null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pendingFile) return;
    onUpload(slotNumber, pendingFile);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-black/8 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-[#1A1B2E]">Video {slotNumber}</h3>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
            video ? "bg-[#5FA777]/15 text-[#2F7D52]" : "bg-black/5 text-[#9CA3AF]"
          }`}
        >
          {video ? "Filled" : "Empty"}
        </span>
      </div>

      {video && (
        <div className="mb-4 flex items-start gap-3">
          <video controls className="h-24 w-32 rounded-md bg-black object-cover" src={video.url} />
          <div className="min-w-0">
            <p className="truncate text-xs text-[#6B7280]">File</p>
            <p className="truncate font-mono text-xs text-[#1A1B2E]">{video.name}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{(video.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleChange}
          className="block w-full cursor-pointer rounded-md border border-black/10 bg-[#F7F7FB] text-xs text-[#6B7280] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-black/5 file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#1A1B2E] hover:file:bg-black/[0.08]"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!pendingFile}
            className="rounded-md bg-[#3D3F96] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#4C4FB0] disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-[#9CA3AF]"
          >
            Update video {slotNumber}
          </button>
          <span className="font-mono text-[10px] text-[#9CA3AF]">MP4 / WebM / OGG &middot; 100MB max</span>
        </div>
      </form>
    </div>
  );
}

/* --------------------------- Toasts --------------------------- */

function ToastStack({ toasts, onDismiss }) {
  const styles = {
    success: "border-[#5FA777]/40 bg-white text-[#2F7D52]",
    error: "border-[#C1666B]/40 bg-white text-[#B3454F]",
    warning: "border-[#D9A441]/40 bg-white text-[#D9A441]",
    info: "border-black/15 bg-white text-[#1A1B2E]",
  };

  return (
    <div className="fixed right-5 top-5 z-[1000] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-md animate-[slideUp_0.15s_ease-out] ${styles[t.type] || styles.info}`}
        >
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="text-current/60 hover:text-current">
            <CloseIcon small />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Icons ---------------------------- */

function IconButton({ children, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        danger ? "text-[#6B7280] hover:bg-[#C1666B]/10 hover:text-[#B3454F]" : "text-[#6B7280] hover:bg-black/5 hover:text-[#1A1B2E]"
      }`}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6h12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon({ small }) {
  const s = small ? 12 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}