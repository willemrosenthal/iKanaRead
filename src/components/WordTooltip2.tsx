import React, { useCallback } from "react";
import { TooltipData } from "../ReaderOriginal/ReadTest";
import { toRomaji } from "wanakana";

interface WordTooltipProps {
  data: TooltipData | null;
  position?: { x: number; y: number };
}

// const color = [
//   "#FF0000",
//   "#00FF00",
//   "#0000FF",
//   "#aaFF00",
//   "#FF00FF",
//   "#00FFFF",
//   "#FF0000",
// ];
const color = ["#8F87F1", "#E9A5F1"];
let colorIndex = 0;

export const WordTooltip: React.FC<WordTooltipProps> = ({ data, position }) => {
  const romanji = useCallback(() => {
    if (data) {
      const roman = [];
      const kana = [];
      const style = {
        color: color[colorIndex],
        fontWeight: "800",
        margin: "0px 2px",
        width: "18px",
        justifyContent: "center",
        alignItems: "center",
      };

      for (let i = 0; i < data.kanaWord.length; i++) {
        const k = data.kanaWord[i];
        const r = toRomaji(k);

        colorIndex = (colorIndex + 1) % color.length;
        style.color = color[colorIndex];

        roman.push(<div style={{ ...style, fontSize: "10px" }}>{r}</div>);

        kana.push(<div style={{ ...style }}>{k}</div>);
      }
      return { roman, kana };
    }
    return {};
  }, [data]);

  const { roman, kana } = romanji();

  // const yOffset =
  //   position?.y && position.y > window.innerHeight * 1 ? -215 : -95;

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "60px",
        left: 0, //position?.x || 0,
        // transform: "translateX(-50%)",
        bottom: 0, //(position?.y || 0) + yOffset, // Offset to show below the word
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "8px 8px 16px 8px",
        // borderRadius: "4px",
        // boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "6px",
        pointerEvents: "none",
      }}
    >
      <div
        key="english"
        style={{
          fontSize: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // paddingBottom: "4px",
          // marginBottom: "3px",
          // borderBottom: "1px solid #ccc",
        }}
      >
        {data?.engWord || ""}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          key="kana"
          style={{ display: "flex", gap: "2px", justifyContent: "center" }}
        >
          {kana || ""}
        </div>
        <div
          key="roman"
          style={{ display: "flex", gap: "2px", justifyContent: "center" }}
        >
          {roman || ""}
        </div>
      </div>
    </div>
  );
};
