import React from "react";

interface WordTooltipProps {
  word: string;
  position: { x: number; y: number };
}

export const WordTooltip: React.FC<WordTooltipProps> = ({ word, position }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y + 20, // Offset to show below the word
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "8px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {word}
    </div>
  );
};
