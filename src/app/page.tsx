"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
        body: JSON.stringify({ originalUrl }),
      });

      const data = await response.json();

      if (data.success) {
        const baseUrl = window.location.origin;
        const shortUrl = `${baseUrl}/${data.data.stdId}`;
        setShortenedUrl(shortUrl);
      } else {
        setError(data.message || "Failed to shorten URL");
      }
    } catch (err) {
      setError("An error occurred while shortening the URL");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden  md:py-12">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-3xl dark:from-[#03045e]/30 dark:to-[#48cae4]/30" />
        <div className="absolute -right-4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl delay-1000 dark:from-[#48cae4]/30 dark:to-[#caf0f8]/30" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-3xl delay-500 dark:from-[#03045e]/20 dark:to-[#48cae4]/20" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <div className="group rounded-3xl border border-white/30 bg-white/60 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl transition-all duration-500 hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-black/30 dark:shadow-[#48cae4]/20 sm:p-8 md:p-10 lg:p-12">
          {/* Icon and Header Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-light-blue-500 to-white-500 p-3 shadow-lg shadow-blue-500/50 transition-transform duration-300 group-hover:scale-105 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95 dark:shadow-[#48cae4]/50">
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

            <h2 className="bg-gradient-to-r from-blue-500 via-light-blue-500 to-white-500 bg-clip-text text-3xl font-bold text-transparent dark:from-[#48cae4] dark:via-[#90e0ef] dark:to-[#caf0f8] md:text-4xl">
              URL Shortener
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-base">
              Transform your long URLs into clean, shareable links with QR code generation
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* URL Input */}
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

            {/* Error Message */}
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

            {/* Submit Button */}
            <button
              className="group/btn relative block h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-light-blue-500 to-white-500 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95 dark:shadow-[#48cae4]/30"
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

            {/* Shortened URL Display */}
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
                          : "border-neutral-200/60 bg-gradient-to-r from-blue-500 via-light-blue-500 to-white-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 dark:border-neutral-700/60 dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95"
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
                
                {/* Success Badge */}
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

                {/* QR Code Section */}
                <div className="rounded-xl border border-neutral-200/60 bg-gradient-to-br from-white/80 to-purple-50/40 p-6 backdrop-blur-sm dark:border-neutral-700/60 dark:from-white/5 dark:to-[#03045e]/20 md:p-8">
                  <div className="mb-6 flex items-center justify-center gap-2 sm:justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-light-blue-500 to-white-500 shadow-md dark:from-[#03045e]/95 dark:via-[#48cae4]/95 dark:to-[#caf0f8]/95">
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
                    <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 md:text-lg">
                      QR Code
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                    <div className="flex justify-center md:justify-start">
                      <div className="inline-block rounded-xl border-4 border-white bg-white p-4 shadow-lg dark:border-neutral-800">
                        <QRCodeCanvas
                          value={shortenedUrl}
                          size={160}
                          level="H"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                      <p className="text-center text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-left">
                        Scan this QR code to access your shortened URL instantly from any mobile device.
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadQR}
                        className="group/qr flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-sm font-semibold text-purple-700 shadow-sm transition-all duration-300 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 hover:shadow-md dark:border-[#48cae4]/30 dark:from-[#03045e]/50 dark:to-[#48cae4]/20 dark:text-[#caf0f8] dark:hover:border-[#48cae4] dark:hover:from-[#03045e]/70 dark:hover:to-[#48cae4]/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transition-transform duration-300 group-hover/qr:translate-y-0.5"
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
              </div>
            )}
          </form>

          {/* Footer Text */}
          <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
            Powered by modern web technologies
          </p>
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
