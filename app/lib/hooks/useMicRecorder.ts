'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMicRecorderReturn {
  isRecording: boolean;
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  error: string | null;
}

/**
 * Hook for recording audio from microphone using MediaRecorder API
 */
export function useMicRecorder(): UseMicRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);

      // Runtime guard: ensure we're in browser
      if (typeof window === 'undefined') {
        throw new Error('Microphone access is only available in the browser.');
      }

      // Secure context check
      if (!window.isSecureContext) {
        throw new Error('SECURE_CONTEXT_REQUIRED');
      }

      // Check if navigator.mediaDevices.getUserMedia is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          throw new Error('MICROPHONE_NOT_AVAILABLE_INSECURE');
        } else {
          throw new Error('MICROPHONE_NOT_AVAILABLE');
        }
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          // Fallback - browser will choose a default
          mimeType = '';
        }
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect chunks as they arrive
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      
      // Handle specific error types
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('PERMISSION_DENIED');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        }
      } else if (err instanceof Error) {
        // Preserve our custom error messages
        if (err.message === 'SECURE_CONTEXT_REQUIRED' || err.message === 'MICROPHONE_NOT_AVAILABLE_INSECURE' || err.message === 'MICROPHONE_NOT_AVAILABLE' || err.message === 'PERMISSION_DENIED') {
          setError(err.message);
        }
      }
      
      throw err;
    }
  }, []);

  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        setIsRecording(false);
        
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        setIsRecording(false);
        const error = event instanceof ErrorEvent ? event.error : new Error('Recording failed');
        setError(error.message);
        reject(error);
      };

      // Stop recording
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        // Already stopped
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
        chunksRef.current = [];
        setIsRecording(false);
        resolve(blob);
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      // Stop stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    start,
    stop,
    error,
  };
}
