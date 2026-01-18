"use client";

import { useTTS } from "../lib/hooks/useTTS";
import type { SpeechPayload } from "../lib/voice/types";

interface SpeakButtonProps {
  payload: SpeechPayload;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SpeakButton({ payload, label, size = "md", className = "" }: SpeakButtonProps) {
  const { speak, isLoading, error, stop, pause, resume, isPlaying, isPaused } = useTTS();

  const handleClick = async () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      await speak(payload);
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-5 h-5";
  const padding = size === "sm" ? "p-1.5" : size === "md" ? "p-2" : "p-2.5";
  const strokeWidth = size === "lg" ? 2.5 : 2;

  // Large size gets enhanced styling: background, border, larger hit area
  const isLarge = size === "lg";
  const buttonBaseClasses = isLarge
    ? "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "";
  const buttonColorClasses = isLarge
    ? isPlaying || isPaused
      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
    : "";
  const buttonTextClasses = !isLarge
    ? isPlaying || isPaused
      ? "text-red-500 hover:text-red-600"
      : "text-gray-500 hover:text-gray-900"
    : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`${
        isLarge
          ? `${buttonBaseClasses} ${buttonColorClasses}`
          : `${padding} transition-colors ${buttonTextClasses}`
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={
        isLoading
          ? "Loading audio summary"
          : isPlaying
            ? "Pause audio summary"
            : isPaused
              ? "Resume audio summary"
              : label || "Play audio summary"
      }
    >
      {isLoading ? (
        // Loading/spinner state
        <svg className={`${iconSize} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ) : isPlaying ? (
        // Playing state - pause icon (two vertical bars)
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : isPaused ? (
        // Paused state - play icon (triangle)
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        // Idle state - speaker icon
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
      {error && (
        <span className="ml-2 text-xs text-red-600" title={error}>
          Error
        </span>
      )}
    </button>
  );
}
