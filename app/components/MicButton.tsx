'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMicRecorder } from '../lib/hooks/useMicRecorder';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  languageCode?: string;
  disabled?: boolean;
}

const MAX_RECORDING_DURATION = 25000; // 25 seconds

export function MicButton({ onTranscript, languageCode = 'eng', disabled = false }: MicButtonProps) {
  const { isRecording, start, stop, error: hookError } = useMicRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format error message for display
  const getErrorMessage = (err: string | null): string | null => {
    if (!err) return null;
    
    if (err === 'SECURE_CONTEXT_REQUIRED' || err === 'MICROPHONE_NOT_AVAILABLE_INSECURE') {
      return 'Microphone requires HTTPS. Use http://localhost:3000 or enable HTTPS for LAN access.';
    }
    if (err === 'MICROPHONE_NOT_AVAILABLE') {
      return 'Microphone not available. Open the app on https or localhost.';
    }
    if (err === 'PERMISSION_DENIED') {
      return 'Microphone permission denied. Please allow microphone access and try again.';
    }
    
    return err;
  };

  const displayError = getErrorMessage(hookError || error);

  const handleStop = useCallback(async () => {
    try {
      setIsTranscribing(true);
      const audioBlob = await stop();

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('language_code', languageCode);

      // Send to STT API
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to transcribe audio' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const text = result.text || '';

      if (text.trim()) {
        onTranscript(text);
      }
    } catch (err) {
      console.error('STT error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(errorMessage);
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsTranscribing(false);
    }
  }, [stop, languageCode, onTranscript]);

  // Auto-stop safeguard after max duration
  useEffect(() => {
    if (isRecording) {
      timeoutRef.current = setTimeout(async () => {
        try {
          await handleStop();
        } catch (err) {
          console.error('Auto-stop error:', err);
        }
      }, MAX_RECORDING_DURATION);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isRecording, handleStop]);

  const handleClick = async () => {
    if (disabled || isTranscribing) return;

    // Clear any previous errors
    setError(null);

    try {
      if (isRecording) {
        await handleStop();
      } else {
        await start();
      }
    } catch (err) {
      console.error('Recording error:', err);
      // Error is already set by the hook, but we can add additional handling here if needed
      // The error will be displayed via hookError -> displayError
    }
  };

  const isActive = isRecording || isTranscribing;
  const buttonDisabled = disabled || isTranscribing;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={buttonDisabled}
        className={`p-2 transition-colors ${
          isActive
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-500 hover:text-gray-900'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
      >
      {isTranscribing ? (
        // Loading/spinner state
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ) : isRecording ? (
        // Recording state - filled circle
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="6" />
        </svg>
      ) : (
        // Idle state - mic icon
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      )}
    </button>
      {displayError && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg text-sm text-red-800 z-50">
          <p className="font-semibold mb-1">Microphone Error</p>
          <p>{displayError}</p>
          {displayError.includes('localhost') && (
            <p className="mt-2 text-xs text-red-700">
              <strong>Tip:</strong> For LAN access, use <code className="bg-red-100 px-1 rounded">http://localhost:3000</code> on the same machine, or set up HTTPS with mkcert.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
