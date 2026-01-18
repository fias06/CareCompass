/**
 * Play a base64-encoded MP3 audio file
 * @param base64 Base64-encoded MP3 audio data (with or without data URI prefix)
 * @returns Promise that resolves when playback starts
 */
export function playBase64Mp3(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Remove data URI prefix if present (e.g., "data:audio/mpeg;base64,")
      const base64Data = base64.includes(",")
        ? base64.split(",")[1]
        : base64;

      // Convert base64 to Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create Blob from Uint8Array
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      // Create Audio element and play
      const audio = new Audio(url);

      audio.oncanplaythrough = () => {
        // Playback can start
        audio
          .play()
          .then(() => {
            resolve();
            // Revoke object URL after playback starts (with small delay)
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 1000);
          })
          .catch((error) => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to play audio: ${error.message}`));
          });
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(new Error(`Audio error: ${error}`));
      };

      // Load the audio
      audio.load();
    } catch (error) {
      reject(
        new Error(
          `Failed to process base64 audio: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  });
}
