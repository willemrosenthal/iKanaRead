import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
// import { toHiragana  } from "hepburn";
import { WordTooltip } from "../components/WordTooltip";
// import * as jp from "jp-conversion";
// import { converter } from "./toKatakana/toKatakana";
// import { converter as converter2 } from "./toKatakana/toKatakana2";
// import { TranscriptionResult } from "./english-to-katakana/types";
import "./reader.css";
import {
  splitSentence,
  transcribeSentenceArray,
} from "../english-to-katakana/services/TranscriptionService";
import { TranscriptionResult } from "../english-to-katakana/types";
import { getVisibleTextFromIframeBySelector } from "../utils/extractTextNodes";

export interface TooltipData {
  engWord: string;
  kanaWord: string;
}

interface Position {
  x: number;
  y: number;
}

export const ReadTest: React.FC = () => {
  const [location, setLocation] = useState<string | number>(0);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const rendition = useRef<Rendition | undefined>(undefined);
  const [mousePosition, setMousePosition] = useState<Position | undefined>();
  const hoverTarget = useRef<HTMLElement | null>(null);
  const japaneseTextOverlay = useRef<HTMLDivElement | null>(null);

  const handleLocationChange = (epubcfi: string) => {
    setLocation(epubcfi);
    // requestAnimationFrame(() => {
    renderJapanese();
    // });
    console.log("location changed", epubcfi);
  };

  const renderJapanese = () => {
    // get
    const nodes = getVisibleTextFromIframeBySelector();

    if (japaneseTextOverlay.current) japaneseTextOverlay.current.innerHTML = "";

    // duplicate nodes into japaneseTextOverlay
    console.log("nodes", nodes);
    // nodes.forEach((node) => {
    //   if (node.element) japaneseTextOverlay.current?.appendChild(node.element);
    // });
    // const duplicateNodes = nodes.map((node) => {
    //   if (node.element) japaneseTextOverlay.current?.appendChild(node.element);
    //   // if (node.element) {
    //   //   const duplicate = document.createElement("div");
    //   //   duplicate.innerHTML = node.element?.innerHTML;
    //   //   return duplicate;
    // }
    // return null;
    // });
    // if (duplicateNodes) {
    //   duplicateNodes.forEach((node) => {
    //     if (node) japaneseTextOverlay.current?.appendChild(node);
    //   });
    // }

    return;

    // console.log({ nodes });
    // // clear content
    // // if (japaneseTextOverlay.current) japaneseTextOverlay.current.innerHTML = "";
    // // nodes is an array of text nodes
    // for (let i = 0; i < nodes.length; i++) {
    //   const textNode = nodes[i];

    //   if (textNode && textNode.element?.textContent?.trim()) {
    //     // Create a span to replace the text node
    //     const span = document.createElement("span");
    //     const nodeStyle = window.getComputedStyle(textNode.element);

    //     const words = splitSentence(textNode.element?.textContent);
    //     const transcription = transcribeSentenceArray(words);
    //     let altWord = false;
    //     span.innerHTML = transcription
    //       .map((word: TranscriptionResult) => {
    //         if (word.katakana[0] === "E_DIC") {
    //           return word.original;
    //         }
    //         altWord = !altWord;
    //         return `<span style="color: ${nodeStyle.color}; font-size: ${nodeStyle.fontSize}; font-weight: ${nodeStyle.fontWeight};">${word.original}</span>`;
    //         return word
    //           ? `<span class="kana-word-${
    //               altWord ? "a" : "b"
    //             } hoverable-word" data-kana="${word.katakana[0]}" data-eng="${
    //               word.original
    //             }">${word.katakana[0]}</span>`
    //           : word;
    //       })
    //       .join("");
    //     if (japaneseTextOverlay.current) {
    //       japaneseTextOverlay.current.innerHTML += span.innerHTML;
    //     } else {
    //       textNode.element?.parentNode?.replaceChild(span, textNode.element);
    //     }
    //   }
    // }
  };

  useEffect(() => {
    window.document.addEventListener("mousemove", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === hoverTarget.current) {
        setMousePosition({
          x: e.screenX,
          y: e.clientY,
        });
        return;
      }
      hoverTarget.current = target;
      const engWord = target.getAttribute("data-eng") || "";
      const kanaWord = target.getAttribute("data-kana") || "";
      if (engWord) {
        console.log("Clicked word:", engWord);
        setTooltipData({
          engWord,
          kanaWord,
        });
        setMousePosition({
          x: e.screenX,
          y: e.clientY,
        });
      }
    });

    return () => {
      window.document.removeEventListener("mousemove", (e: MouseEvent) => {});
    };
  }, []);

  // useEffect(() => {
  //   if (rendition.current) {
  //     // Add a content hook that runs when each section is loaded
  //     rendition.current.hooks.content.register(async (contents: any) => {
  //       // Add a single mousedown listener to the document
  //       contents.window.document.addEventListener(
  //         "mousemove",
  //         (e: MouseEvent) => {
  //           const target = e.target as HTMLElement;
  //           if (target === hoverTarget.current) {
  //             setMousePosition({
  //               x: e.screenX,
  //               y: e.clientY,
  //             });
  //             return;
  //           }
  //           hoverTarget.current = target;
  //           const engWord = target.getAttribute("data-eng") || "";
  //           const kanaWord = target.getAttribute("data-kana") || "";
  //           if (engWord) {
  //             console.log("Clicked word:", engWord);
  //             setTooltipData({
  //               engWord,
  //               kanaWord,
  //             });
  //             setMousePosition({
  //               x: e.screenX,
  //               y: e.clientY,
  //             });
  //           }
  //         }
  //       );

  //       // Add styles for hoverable words
  //       // const style = contents.window.document.createElement("style");
  //       // style.textContent = `
  //       //   .hoverable-word {
  //       //     cursor: pointer;
  //       //     transition: background-color 0.2s;
  //       //   }
  //       //   .kana-word-a {
  //       //     cursor: pointer;
  //       //     transition: background-color 0.2s;
  //       //     margin: 0px 5px;
  //       //     color: #999;
  //       //   }
  //       //   .kana-word-b {
  //       //     cursor: pointer;
  //       //     transition: background-color 0.2s;
  //       //     margin: 0px 5px;
  //       //     color: #000;
  //       //   }
  //       //   .hoverable-word:hover {
  //       //     background-color: yellow;
  //       //   }
  //       // `;
  //       // contents.window.document.head.appendChild(style);
  //     });
  //   }
  // });

  return (
    <div style={{ height: "100vh" }}>
      <div className="japanese-text" ref={japaneseTextOverlay} />
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={handleLocationChange}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
        }}
      />
      {tooltipData && (
        <WordTooltip data={tooltipData} position={mousePosition} />
      )}
    </div>
  );
};
