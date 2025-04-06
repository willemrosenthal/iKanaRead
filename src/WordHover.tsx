import React from "react";
import { toRomaji } from "wanakana";

type WordHoverProps = {
  pos: {
    x: number;
    y: number;
  };
  kana: string;
  word: string;
};

export const WordHover: React.FC<WordHoverProps> = ({ pos, kana, word }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${pos.x}px`,
        top: `${pos.y + 20}px`, // Offset below the word
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: "4px" }}>
        <strong>Kana:</strong> {kana}
      </div>
      <div style={{ marginBottom: "4px" }}>
        <strong>Romanji:</strong> {toRomaji(word)}
      </div>
      <div>
        <strong>English:</strong> {word}
      </div>
    </div>
  );
};
