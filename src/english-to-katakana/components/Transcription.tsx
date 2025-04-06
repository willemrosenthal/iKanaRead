import React, { useState } from "react";
import { TranscriptionService } from "../services/TranscriptionService";
import type { TranscriptionResult } from "../types";

interface TranscriptionState {
  input: string;
  results: TranscriptionResult[];
  isLoading: boolean;
  error: string | null;
}

export const Transcription: React.FC = () => {
  const [state, setState] = useState<TranscriptionState>({
    input: "",
    results: [],
    isLoading: false,
    error: null,
  });

  const transcriptionService = new TranscriptionService();

  const handleTranscription = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const words = state.input.trim().split(/\s+/);
      const results = transcriptionService.transcriptWords(words);
      setState((prev) => ({ ...prev, results, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to transcribe text. Please try again.",
      }));
    }
  };

  return (
    <div className="transcription-container">
      <div className="input-section">
        <textarea
          value={state.input}
          onChange={(e) =>
            setState((prev) => ({ ...prev, input: e.target.value }))
          }
          placeholder="Enter English words separated by spaces..."
          rows={4}
          className="input-textarea"
          disabled={state.isLoading}
        />
        <button
          onClick={handleTranscription}
          className="transcribe-button"
          disabled={state.isLoading || !state.input.trim()}
        >
          {state.isLoading ? "Transcribing..." : "Transcribe to Katakana"}
        </button>
      </div>

      {state.error && <div className="error-message">{state.error}</div>}

      <div className="results-section">
        {state.results.map((result, index) => (
          <div key={index} className="result-item">
            <span className="original-word">{result.original}</span>
            <span className="arrow">→</span>
            <span className="katakana">{result.katakana.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
