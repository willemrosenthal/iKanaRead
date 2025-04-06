export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscriptionError";
  }
}

export const handleTranscriptionError = (error: unknown): ["E_KEY"] => {
  if (error instanceof TranscriptionError) {
    console.error("Transcription error:", error.message);
  } else {
    console.error("Unexpected error during transcription:", error);
  }
  return ["E_KEY"];
};
