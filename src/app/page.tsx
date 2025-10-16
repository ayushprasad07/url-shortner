"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        const shortUrl = `${baseUrl}/api/redirect/${data.data.stdId}`;
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-slate-900 dark:to-neutral-900">
      <div className="shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-black/40 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <div className="mb-2">
          <div className="inline-block rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
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
        </div>

        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          URL Shortener
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Transform your long URLs into clean, shareable links instantly
        </p>

        <form className="my-6" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-6">
            <Label htmlFor="url" className="text-neutral-700 dark:text-neutral-300">
              Enter URL
            </Label>
            <Input
              id="url"
              placeholder="https://example.com/very-long-url"
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              disabled={isLoading}
              className="border-neutral-300 bg-white/50 backdrop-blur-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-white/5 dark:focus:border-indigo-400"
            />
          </LabelInputContainer>

          {error && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {shortenedUrl && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-3 space-y-2 duration-500">
              <Label htmlFor="shortened" className="text-neutral-700 dark:text-neutral-300">
                Your Shortened URL
              </Label>
              <div className="group relative flex items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-white/50 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-400 hover:shadow-md dark:border-neutral-700 dark:bg-white/5 dark:hover:border-indigo-500">
                <input
                  id="shortened"
                  value={shortenedUrl}
                  readOnly
                  className="flex-1 border-0 bg-transparent px-4 py-3 text-sm text-neutral-700 outline-none dark:text-neutral-200"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "relative flex items-center gap-2 border-l px-4 py-3 font-medium transition-all",
                    copied
                      ? "border-emerald-300 bg-emerald-500 text-white dark:border-emerald-600 dark:bg-emerald-600"
                      : "border-neutral-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 dark:border-neutral-700"
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
                      <span className="text-sm">Copied</span>
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
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                ✨ Your shortened URL is ready to share!
              </p>
            </div>
          )}

          <button
            className="group/btn relative block h-11 w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:from-indigo-500 dark:to-purple-500 dark:shadow-indigo-500/20"
            type="submit"
            disabled={isLoading}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
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
                  Generating...
                </>
              ) : (
                <>
                  Generate Shortened URL
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
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

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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
