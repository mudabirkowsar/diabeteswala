"use client";

import { useState, useRef } from "react";

/**
 * AddBlog — editorial-style blog composer
 *
 * Design notes:
 * - No API / context calls. Submission is fully local; onSubmit receives
 *   the assembled FormData so you can wire it to your own handler later.
 * - Uses Fraunces (serif, editorial display) for titles/preview and
 *   Inter (sans) for UI chrome. Load them in your root layout, e.g.:
 *
 *     import { Fraunces, Inter } from "next/font/google";
 *     const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
 *     const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
 *     // apply `${fraunces.variable} ${inter.variable}` on <html> or <body>
 *
 *   and add to tailwind.config.js:
 *     fontFamily: {
 *       serif: ["var(--font-fraunces)", "serif"],
 *       sans: ["var(--font-inter)", "sans-serif"],
 *     }
 */

const BLOG_TYPES = [
  { value: "Doctor Tips", label: "Doctor Tips" },
  { value: "Mind & Body", label: "Mind & Body" },
  { value: "Monitoring", label: "Monitoring" },
  { value: "Food Lab", label: "Food Lab" },
  { value: "Recipes", label: "Recipes" },
  { value: "Food & Nutrition", label: "Food & Nutrition" },
];

const TYPE_STYLES = {
  "Doctor Tips": "bg-[#EFE7DA] text-[#8C5A2B]",
  "Mind & Body": "bg-[#E3EAE0] text-[#3F5C43]",
  Monitoring: "bg-[#E6E2F2] text-[#4B3F72]",
  "Food Lab": "bg-[#FBE9E1] text-[#9A4A2E]",
  Recipes: "bg-[#FDF1DA] text-[#96701C]",
  "Food & Nutrition": "bg-[#E1EFE8] text-[#2F6B4F]",
};

export default function AddBlog({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    conclusion: "",
    created_by: "",
    type: "",
    blogimage: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | success
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const setField = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFile = (file) => {
    if (!file) return;
    setField("blogimage", file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.blogimage) setErrors((prev) => ({ ...prev, blogimage: undefined }));
  };

  const handleFileInput = (e) => handleFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.title || formData.title.length < 3) {
      validationErrors.title = "Title should be at least 3 characters.";
    }
    if (!formData.description || formData.description.length < 10) {
      validationErrors.description = "Description should be at least 10 characters.";
    }
    if (!formData.conclusion || formData.conclusion.length < 5) {
      validationErrors.conclusion = "Conclusion should be at least 5 characters.";
    }
    if (!formData.created_by || formData.created_by.length < 3) {
      validationErrors.created_by = "Author name should be at least 3 characters.";
    }
    if (!formData.type) {
      validationErrors.type = "Choose a category for this post.";
    }
    if (!formData.blogimage) {
      validationErrors.blogimage = "A cover image is required.";
    } else {
      const ext = formData.blogimage.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "gif"].includes(ext)) {
        validationErrors.blogimage = "Use a jpg, jpeg, png, or gif file.";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    // No API call here — hand the assembled data to a parent handler if provided.
    onSubmit?.(data);
    setStatus("success");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      conclusion: "",
      created_by: "",
      type: "",
      blogimage: null,
    });
    setImagePreview(null);
    setErrors({});
    setStatus("idle");
  };

  const wordCount = formData.description.trim()
    ? formData.description.trim().split(/\s+/).length
    : 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#F6F4EE] font-sans text-[#20261F]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between border-b border-[#20261F]/10 pb-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#6B8F71]">
              Editorial Desk
            </p>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-[#20261F] lg:text-5xl">
              Compose a new post
            </h1>
          </div>
          <span className="hidden text-sm text-[#20261F]/50 sm:block">
            Draft &middot; Not yet published
          </span>
        </div>

        {status === "success" ? (
          <SuccessPanel formData={formData} onReset={resetForm} />
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <Field label="Title" error={errors.title}>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="How your body actually responds to stress"
                  className={inputClass(errors.title)}
                />
              </Field>

              <Field label="Description" error={errors.description} hint={`${wordCount} words`}>
                <textarea
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Open with the idea readers will remember..."
                  className={inputClass(errors.description) + " resize-none"}
                />
              </Field>

              <Field label="Cover image" error={errors.blogimage}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    dragActive
                      ? "border-[#6B8F71] bg-[#6B8F71]/5"
                      : errors.blogimage
                      ? "border-[#B3452E]/40 bg-[#B3452E]/[0.03]"
                      : "border-[#20261F]/20 bg-white/40 hover:border-[#6B8F71]/50 hover:bg-[#6B8F71]/[0.03]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="blogimage"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-3 text-[#6B8F71]">
                    <path d="M12 16V4M12 4L7 9M12 4l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium text-[#20261F]">
                    Drop an image, or <span className="text-[#6B8F71] underline underline-offset-2">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-[#20261F]/45">JPG, PNG or GIF</p>
                </div>
              </Field>

              <Field label="Conclusion" error={errors.conclusion}>
                <textarea
                  name="conclusion"
                  rows={3}
                  value={formData.conclusion}
                  onChange={handleChange}
                  placeholder="Leave the reader with a takeaway..."
                  className={inputClass(errors.conclusion) + " resize-none"}
                />
              </Field>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field label="Author" error={errors.created_by}>
                  <input
                    type="text"
                    name="created_by"
                    value={formData.created_by}
                    onChange={handleChange}
                    placeholder="Dr. Aanya Kapoor"
                    className={inputClass(errors.created_by)}
                  />
                </Field>

                <Field label="Category" error={errors.type}>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {BLOG_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          setField("type", t.value);
                          if (errors.type) setErrors((p) => ({ ...p, type: undefined }));
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          formData.type === t.value
                            ? "border-[#20261F] bg-[#20261F] text-white"
                            : "border-[#20261F]/15 bg-white/60 text-[#20261F]/70 hover:border-[#20261F]/40"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="group relative overflow-hidden rounded-md bg-[#20261F] px-7 py-3 text-sm font-medium text-white transition-transform active:scale-[0.98]"
                >
                  <span className="relative z-10">Publish post</span>
                  <span className="absolute inset-0 -translate-x-full bg-[#6B8F71] transition-transform duration-300 group-hover:translate-x-0" />
                </button>
                <span className="text-xs text-[#20261F]/45">
                  Saved locally &middot; nothing is sent anywhere yet
                </span>
              </div>
            </form>

            {/* LIVE PREVIEW — signature element */}
            <div className="lg:sticky lg:top-10 lg:self-start">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#20261F]/40">
                Live preview
              </p>
              <article className="overflow-hidden rounded-xl border border-[#20261F]/10 bg-white shadow-[0_20px_50px_-25px_rgba(32,38,31,0.35)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EDEAE1]">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-[#20261F]/25">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M21 15l-5-5-11 11" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      <span className="mt-2 text-xs">Cover image appears here</span>
                    </div>
                  )}
                  {formData.type && (
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium ${TYPE_STYLES[formData.type]}`}
                    >
                      {formData.type}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="font-serif text-2xl leading-snug text-[#20261F]">
                    {formData.title || "Your title will appear here"}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#20261F]/60">
                    {formData.description ||
                      "Start typing a description — it will preview exactly as readers will see it."}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#20261F]/10 pt-4 text-xs text-[#20261F]/45">
                    <span>{formData.created_by || "Author name"}</span>
                    <span>{readMins} min read</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-[#20261F]/80">{label}</label>
        {hint && <span className="text-xs text-[#20261F]/35">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#B3452E]">{error}</p>}
    </div>
  );
}

function SuccessPanel({ formData, onReset }) {
  return (
    <div className="flex flex-col items-start rounded-xl border border-[#6B8F71]/25 bg-[#6B8F71]/[0.06] p-10">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#6B8F71] text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl text-[#20261F]">"{formData.title}" is ready</h2>
      <p className="mt-2 max-w-md text-sm text-[#20261F]/60">
        The post has been assembled locally. Connect this form to your own save handler
        when you're ready to persist it.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-md border border-[#20261F]/15 px-5 py-2.5 text-sm font-medium text-[#20261F] transition-colors hover:bg-[#20261F] hover:text-white"
      >
        Write another post
      </button>
    </div>
  );
}

function inputClass(hasError) {
  return `w-full rounded-md border bg-white/60 px-4 py-2.5 text-sm text-[#20261F] placeholder:text-[#20261F]/30 outline-none transition-colors focus:border-[#6B8F71] focus:bg-white focus:ring-2 focus:ring-[#6B8F71]/15 ${
    hasError ? "border-[#B3452E]/50" : "border-[#20261F]/15"
  }`;
}