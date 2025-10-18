"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

interface URLData {
  _id: string;
  stdId: string;
  originalUrl: string;
  userId: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  clicks?: number;
}

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<URLData[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    linkId: string | null;
    linkStdId: string;
  }>({ isOpen: false, linkId: null, linkStdId: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch("/api/get-links");
      const data = await response.json();

      if (response.ok && data.success) {
        setLinks(data.data);
      } else if (response.status === 404) {
        setLinks([]);
      }
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShortenedUrl("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-stdid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to create shortened URLs");
        } else {
          setError(data.message || "Failed to shorten URL");
        }
        return;
      }

      if (data.success && data.data) {
        const baseUrl = window.location.origin;
        const shortUrl = `${baseUrl}/${data.data.stdId}`;
        setShortenedUrl(shortUrl);
        setOriginalUrl("");
        setExpiresAt("");
        fetchLinks();
      } else {
        setError("Failed to generate shortened URL");
      }
    } catch (err) {
      setError("Network error occurred. Please try again");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = async (urlId: string) => {
    // Set loading state for this specific toggle
    setTogglingId(urlId);

    // Optimistic UI update - immediately update the UI
    const previousLinks = [...links];
    setLinks((prevLinks) =>
      prevLinks.map((link) =>
        link._id === urlId ? { ...link, isActive: !link.isActive } : link
      )
    );

    try {
      const response = await fetch(`/api/change-activity/${urlId}`, {
        method: "PUT",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update with actual server response
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link._id === urlId ? { ...link, isActive: data.data.isActive } : link
          )
        );
      } else {
        // Revert to previous state if API call failed
        setLinks(previousLinks);
        console.error("Failed to toggle activity");
      }
    } catch (err) {
      // Revert to previous state on error
      setLinks(previousLinks);
      console.error("Error toggling activity:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (linkId: string, stdId: string) => {
    setDeleteConfirm({ isOpen: true, linkId, linkStdId: stdId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.linkId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete-link/${deleteConfirm.linkId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLinks((prevLinks) =>
          prevLinks.filter((link) => link._id !== deleteConfirm.linkId)
        );
        setDeleteConfirm({ isOpen: false, linkId: null, linkStdId: "" });
      } else {
        console.error("Failed to delete link:", data.message);
      }
    } catch (err) {
      console.error("Error deleting link:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, linkId: null, linkStdId: "" });
  };

  const handleCopy = async () => {
    try {
      await window.navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async (url: string, id: string) => {
    try {
      const baseUrl = window.location.origin;
      await window.navigator.clipboard.writeText(`${baseUrl}/${url}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-3xl dark:from-[#03045e]/30 dark:to-[#48cae4]/30" />
        <div className="absolute -right-4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl delay-1000 dark:from-[#48cae4]/30 dark:to-[#caf0f8]/30" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-3xl delay-500 dark:from-[#03045e]/20 dark:to-[#48cae4]/20" />
      </div>

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="animate-in fade-in zoom-in relative w-full max-w-md overflow-hidden rounded-2xl border border-red-200/60 bg-white shadow-2xl dark:border-red-800/40 dark:bg-neutral-900">
            <div className="border-b border-neutral-200/60 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 dark:border-neutral-700/60 dark:from-red-950/30 dark:to-pink-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="mb-3 text-sm text-neutral-700 dark:text-neutral-300">
                Are you sure you want to permanently delete this shortened URL?
              </p>
              <div className="rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 mb-1">
                  Short URL
                </p>
                <p className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                  /{deleteConfirm.linkStdId}
                </p>
              </div>
            </div>


            <div className="flex gap-3 border-t border-neutral-200/60 bg-neutral-50/50 px-6 py-4 dark:border-neutral-700/60 dark:bg-neutral-800/30">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:from-red-700 hover:to-pink-700 hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:from-red-700 dark:to-pink-700"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          <div className="group rounded-3xl border border-white/30 bg-white/60 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl transition-all duration-500 hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-black/30 dark:shadow-[#48cae4]/20 sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 shadow-lg shadow-purple-500/50 transition-transform duration-300 group-hover:scale-105 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95 dark:shadow-[#48cae4]/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>

              <h2 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent dark:from-[#48cae4] dark:via-[#90e0ef] dark:to-[#caf0f8]">
                URL Shortener
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Transform your long URLs into clean, shareable links
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <LabelInputContainer>
                <Label
                  htmlFor="url"
                  className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Enter URL
                </Label>
                <div className="relative">
                  <Input
                    id="url"
                    placeholder="https://example.com/very-long-url"
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-neutral-200/60 bg-white/80 pl-4 pr-4 backdrop-blur-sm transition-all duration-300 placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 dark:border-neutral-700/60 dark:bg-white/10 dark:placeholder:text-neutral-500 dark:focus:border-[#48cae4] dark:focus:ring-[#48cae4]/20"
                  />
                </div>
              </LabelInputContainer>

              <LabelInputContainer>
                <Label
                  htmlFor="expiresAt"
                  className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Expiration Date{" "}
                  <span className="text-xs font-normal text-neutral-500">
                    (Optional)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={isLoading}
                    min={new Date().toISOString().slice(0, 16)}
                    className="h-12 border-neutral-200/60 bg-white/80 pl-4 pr-4 backdrop-blur-sm transition-all duration-300 placeholder:text-neutral-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 dark:border-neutral-700/60 dark:bg-white/10 dark:placeholder:text-neutral-500 dark:focus:border-[#48cae4] dark:focus:ring-[#48cae4]/20"
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Leave empty for permanent links
                </p>
              </LabelInputContainer>

              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50/90 to-pink-50/90 p-4 backdrop-blur-sm dark:border-red-800/40 dark:from-red-900/30 dark:to-pink-900/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-600 dark:text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                className="group/btn relative block h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95 dark:shadow-[#48cae4]/30"
                type="submit"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Shortened URL
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </span>
                <BottomGradient />
              </button>

              {shortenedUrl && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-700">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300/60 to-transparent dark:via-neutral-700/60" />

                  <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Your Shortened URL
                  </Label>

                  <div className="group/url overflow-hidden rounded-xl border border-neutral-200/60 bg-gradient-to-r from-white/90 to-indigo-50/60 shadow-lg shadow-indigo-500/5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-neutral-700/60 dark:from-white/5 dark:to-[#03045e]/20 dark:hover:border-[#48cae4]">
                    <div className="flex items-stretch">
                      <input
                        value={shortenedUrl}
                        readOnly
                        className="flex-1 border-0 bg-transparent px-4 py-4 text-sm font-medium text-neutral-700 outline-none dark:text-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                          "relative flex flex-shrink-0 items-center gap-2 border-l px-5 py-4 font-semibold transition-all duration-300",
                          copied
                            ? "border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:border-emerald-600 dark:from-emerald-600 dark:to-teal-600"
                            : "border-neutral-200/60 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 dark:border-neutral-700/60 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95"
                        )}
                      >
                        {copied ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="hidden text-sm sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="hidden text-sm sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50/80 to-teal-50/80 px-3 py-2 backdrop-blur-sm dark:from-emerald-950/30 dark:to-teal-950/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Your shortened URL is ready to share!
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-200/60 bg-gradient-to-br from-white/80 to-purple-50/40 p-6 backdrop-blur-sm dark:border-neutral-700/60 dark:from-white/5 dark:to-[#03045e]/20">
                    <div className="mb-6 flex items-center justify-center gap-2 sm:justify-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-md dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                        QR Code
                      </h3>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="inline-block rounded-xl border-4 border-white bg-white p-4 shadow-lg dark:border-neutral-800">
                        <QRCodeCanvas value={shortenedUrl} size={140} level="H" />
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadQR}
                        className="group/qr flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-300 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 hover:shadow-md dark:border-[#48cae4]/30 dark:from-[#03045e]/50 dark:to-[#48cae4]/20 dark:text-[#caf0f8] dark:hover:border-[#48cae4] dark:hover:from-[#03045e]/70 dark:hover:to-[#48cae4]/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 transition-transform duration-300 group-hover/qr:translate-y-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
              Powered by modern web technologies
            </p>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-black/30 dark:shadow-[#48cae4]/20 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent dark:from-[#48cae4] dark:via-[#90e0ef] dark:to-[#caf0f8]">
                    Your Links
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Manage all your shortened URLs
                  </p>
                </div>
              </div>
              <button
                onClick={fetchLinks}
                disabled={isLoadingLinks}
                className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:from-indigo-100 hover:to-purple-100 disabled:opacity-50 dark:border-[#48cae4]/30 dark:from-[#03045e]/50 dark:to-[#48cae4]/20 dark:text-[#caf0f8] dark:hover:border-[#48cae4]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn("h-4 w-4", isLoadingLinks && "animate-spin")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
              {isLoadingLinks ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <svg
                      className="h-12 w-12 animate-spin text-indigo-500 dark:text-[#48cae4]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Loading your links...
                    </p>
                  </div>
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200/60 bg-gradient-to-br from-neutral-50/50 to-indigo-50/30 py-16 backdrop-blur-sm dark:border-neutral-700/60 dark:from-white/5 dark:to-[#03045e]/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                    No links yet
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                    Create your first shortened URL
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div
                      key={link._id}
                      className="group/card overflow-hidden rounded-xl border border-neutral-200/60 bg-gradient-to-br from-white/90 to-indigo-50/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-xl dark:border-neutral-700/60 dark:from-white/5 dark:to-[#03045e]/20 dark:hover:border-[#48cae4]"
                    >
                      <div className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-500">
                              {new Date(link.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                              link.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {link.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 flex-shrink-0 text-indigo-500 dark:text-[#48cae4]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <p className="truncate text-lg font-bold text-indigo-600 dark:text-[#48cae4]">
                              /{link.stdId}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                            Original URL
                          </p>
                          <p className="truncate text-sm text-neutral-700 dark:text-neutral-300">
                            {link.originalUrl}
                          </p>
                        </div>

                        {link.expiresAt && (
                          <div className="mb-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 dark:from-amber-950/30 dark:to-orange-950/30">
                            <p className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Expires:{" "}
                              {new Date(link.expiresAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-4 border-t border-neutral-200/60 dark:border-neutral-700/60">
                          <button
                            onClick={() => handleCopyLink(link.stdId, link._id)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300",
                              copiedId === link._id
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 dark:from-[#03045e]/50 dark:to-[#48cae4]/20 dark:text-[#caf0f8] dark:hover:from-[#03045e]/70 dark:hover:to-[#48cae4]/30"
                            )}
                          >
                            {copiedId === link._id ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Copied
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => toggleActivity(link._id)}
                            disabled={togglingId === link._id}
                            className={cn(
                              "relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-[#48cae4]/20 disabled:cursor-not-allowed disabled:opacity-70",
                              link.isActive
                                ? "border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500"
                                : "border-neutral-300 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700"
                            )}
                            role="switch"
                            aria-checked={link.isActive}
                          >
                            {togglingId === link._id ? (
                              <span className="flex h-full w-full items-center justify-center">
                                <svg
                                  className="h-4 w-4 animate-spin text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                                  link.isActive ? "translate-x-8" : "translate-x-1"
                                )}
                              />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(link._id, link.stdId)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 transition-all duration-300 hover:border-red-300 hover:from-red-100 hover:to-pink-100 hover:shadow-md dark:border-red-800/40 dark:from-red-950/30 dark:to-pink-950/30 dark:text-red-400 dark:hover:border-red-700"
                            title="Delete link"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100 dark:via-[#48cae4]" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100 dark:via-[#90e0ef]" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
