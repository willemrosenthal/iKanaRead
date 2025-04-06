import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
// import { toHiragana  } from "hepburn";
import { WordTooltip } from "../components/WordTooltip";
// import * as jp from "jp-conversion";
// import { converter } from "./toKatakana/toKatakana";
// import { converter as converter2 } from "./toKatakana/toKatakana2";
// import { TranscriptionResult } from "./english-to-katakana/types";
import {
  splitSentence,
  transcribeSentenceArray,
} from "../english-to-katakana/services/TranscriptionService";
import { TranscriptionResult } from "../english-to-katakana/types";

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
  // const textNodes = useRef<any>();

  useEffect(() => {
    if (rendition.current) {
      // Add a content hook that runs when each section is loaded
      rendition.current.hooks.content.register(async (contents: any) => {
        // Get all text nodes in the content
        const textNodes: any = contents.window.document.evaluate(
          "//text()",
          contents.window.document.body,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        for (let i = 0; i < textNodes.snapshotLength; i++) {
          const textNode = textNodes.snapshotItem(i);

          if (textNode && textNode.textContent.trim()) {
            // Create a span to replace the text node
            const span = contents.window.document.createElement("span");

            const words = splitSentence(textNode.textContent);
            const transcription = transcribeSentenceArray(words);
            let altWord = false;
            span.innerHTML = transcription
              .map((word: TranscriptionResult) => {
                if (word.katakana[0] === "E_DIC") {
                  return word.original;
                }
                altWord = !altWord;
                return word
                  ? `<span class="kana-word-${
                      altWord ? "a" : "b"
                    } hoverable-word" data-kana="${
                      word.katakana[0]
                    }" data-eng="${word.original}">${word.katakana[0]}</span>`
                  : word;
              })
              .join("");
            textNode.parentNode.replaceChild(span, textNode);
          }
        }

        // // Add a single mousedown listener to the document
        // contents.window.document.addEventListener(
        //   "mousemove",
        //   (e: MouseEvent) => {
        //     const target = e.target as HTMLElement;
        //     if (target === hoverTarget.current) {
        //       setMousePosition({
        //         x: e.screenX,
        //         y: e.clientY,
        //       });
        //       return;
        //     }
        //     hoverTarget.current = target;
        //     const engWord = target.getAttribute("data-eng") || "";
        //     const kanaWord = target.getAttribute("data-kana") || "";
        //     if (engWord) {
        //       console.log("Clicked word:", engWord);
        //       setTooltipData({
        //         engWord,
        //         kanaWord,
        //       });
        //       setMousePosition({
        //         x: e.screenX,
        //         y: e.clientY,
        //       });
        //       // // get distance from mouse to left edge of window
        //       // const distance = e.screenX; // - window.innerWidth / 2;
        //       // console.log("distance", distance);
        //     }
        //   }
        // );

        // Add styles for hoverable words
        const style = contents.window.document.createElement("style");
        style.textContent = `
          .hoverable-word {
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .kana-word-a {
            cursor: pointer;
            transition: background-color 0.2s;
            margin: 0px 5px;
            color: #999;
          }
          .kana-word-b {
            cursor: pointer;
            transition: background-color 0.2s;
            margin: 0px 5px;
            color: #000;
          }
          .hoverable-word:hover {
            background-color: yellow;
          }
        `;
        contents.window.document.head.appendChild(style);
      });

      // const data = await requestTranslate([text]);
      // return data;
    }
  });

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

  return (
    <div style={{ height: "100vh" }}>
      <div>{tooltipData?.engWord}</div>
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={(epubcfi: string) => {
          setLocation(epubcfi);
          console.log("locationChanged", epubcfi);
        }}
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
