import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import { toHiragana, toKatakana } from "wanakana";
import { WordTooltip } from "../../components/WordTooltip";
import { seededHexColor } from "../seedColor";
import {
  splitSentence,
  transcribeSentenceArray,
} from "../../english-to-katakana/services/TranscriptionService";
import { TranscriptionResult } from "../../english-to-katakana/types";
import "./reader.css";

export interface TooltipData {
  engWord: string;
  kanaWord: string;
}

interface Position {
  x: number;
  y: number;
}

interface PageNumber {
  currentPage: number;
  totalPages: number;
  pageMin: number;
  pageMax: number;
  chapter: number;
}

const translatedChapters = new Set();

export const Reader: React.FC = () => {
  const [location, setLocation] = useState<string | number>(0);
  const rendition = useRef<Rendition | undefined>(undefined);

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState<Position | undefined>();
  const hoverTarget = useRef<HTMLElement | null>(null);

  const textNodes = useRef<XPathResult>();
  const contentsRef = useRef<any>();

  const [page, setPage] = useState<PageNumber>({
    currentPage: 0,
    totalPages: 0,
    pageMin: 0,
    pageMax: 500,
    chapter: 0,
  });

  // const pageMin = page.currentPage - 0 * window.innerWidth;
  // const pageMax = page.currentPage * window.innerWidth;

  // useEffect(() => {
  //   if (rendition.current) {
  //     rendition.current.on("relocated", (location) => {
  //       // Get current page
  //       const currentPage = location.start.displayed.page;
  //       const totalPages = location.start.displayed.total;
  //       setPageNumber(`Page ${currentPage} of ${totalPages}`);
  //     });
  //   }
  // }, []);
  // function isRenderedTextInIframe(textNode: Node) {
  //   if (
  //     !textNode ||
  //     textNode.nodeType !== Node.TEXT_NODE
  //     // || !textNode.data.trim()
  //   )
  //     return false;

  //   const doc = textNode.ownerDocument;

  //   const range = doc?.createRange();
  //   range?.selectNodeContents(textNode);
  //   const rects = range?.getClientRects();
  //   if (!rects) return false;

  //   return rects.length > 0;
  // }

  // function getDistanceToViewportCenter(textNode: Node) {
  //   if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
  //     return null;
  //   }

  //   textNode.getRootNode().parentElement?.getClientRects()

  //   // Step 1: Get bounding rect of the text node using a Range
  //   const range = textNode?.ownerDocument?.createRange();
  //   range?.selectNodeContents(textNode);
  //   const rects = range?.getClientRects();
  //   if (!rects || rects?.length === 0) return null;

  //   const textRect = rects[0]; // First rect should be sufficient for small text

  //   // Step 2: Calculate absolute position on the screen by walking through iframe chain
  //   let totalLeft = textRect.left;

  //   let currentWindow = textNode?.ownerDocument?.defaultView as Window;

  //   while (currentWindow && currentWindow !== currentWindow.parent) {
  //     const iframe = currentWindow.frameElement;
  //     if (!iframe) break;

  //     const iframeRect = iframe.getBoundingClientRect();
  //     totalLeft += iframeRect.left;

  //     currentWindow = currentWindow.parent;
  //   }

  //   return totalLeft;
  // }

  const transformTextNodes = () => {
    console.log("transformTextNodes");
    if (translatedChapters.has(page.chapter)) return;
    translatedChapters.add(page.chapter);
    // Process each text node
    if (!textNodes.current || !contentsRef.current) return;

    for (let i = 0; i < textNodes.current.snapshotLength; i++) {
      const textNode = textNodes.current.snapshotItem(i);

      if (textNode && textNode.textContent?.trim()) {
        // Create a span to replace the text node
        const span = contentsRef.current.window.document.createElement("span");

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
              ? `<span class="kana-word ${
                  altWord ? "a" : "b"
                } hoverable-word" data-kana="${word.katakana[0]}" data-eng="${
                  word.original
                }">${word.katakana[0]}</span>`
              : word;
          })
          .join("");
        textNode?.parentNode?.replaceChild(span, textNode);
      }
    }
  };
  //   for (let i = 0; i < textNodes.current.snapshotLength; i++) {
  //     const textNode = textNodes.current.snapshotItem(i);

  //     if (textNode && textNode.textContent?.trim()) {
  //       const pageColor = seededHexColor(page.currentPage);
  //       // Create a span to replace the text node
  //       const span = contentsRef.current.window.document.createElement("span");
  //       // Split text into words and wrap each in a span
  //       span.innerHTML = textNode.textContent
  //         .split(/(\s+)/)
  //         .map((word: string) => {
  //           const trimmed = word.trim();
  //           let kana = getKana(trimmed);

  //           return trimmed
  //             ? `<span class="hoverable-word" data-eng="${trimmed}" data-kana="${kana}" style="color: ${pageColor}">${kana}</span>`
  //             : word;
  //         })
  //         .join("");
  //       textNode?.parentNode?.replaceChild(span, textNode);
  //     }
  //   }
  // };

  const changeLoc = (loc: string) => {
    setLocation(loc);
    setTimeout(() => {
      transformTextNodes();
    }, 0);
  };

  useEffect(() => {
    if (rendition.current) {
      // Add a content hook that runs when each section is loaded
      rendition.current.hooks.content.register((contents: any) => {
        // Get all text nodes in the content
        textNodes.current = contents.window.document.evaluate(
          "//text()",
          contents.window.document.body,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        contentsRef.current = contents;

        // // Process each text node
        // if (!textNodes.current) return;
        // for (let i = 0; i < textNodes.current.snapshotLength; i++) {
        //   const textNode = textNodes.current.snapshotItem(i);
        //   if (textNode && textNode.textContent?.trim()) {
        //     // Create a span to replace the text node
        //     const span = contents.window.document.createElement("span");
        //     // Split text into words and wrap each in a span
        //     span.innerHTML = textNode.textContent
        //       .split(/(\s+)/)
        //       .map((word: string) => {
        //         const trimmed = word.trim();
        //         let kana = getKana(trimmed);

        //         return trimmed
        //           ? `<span class="hoverable-word">${kana}</span>`
        //           : word;
        //       })
        //       .join("");
        //     textNode?.parentNode?.replaceChild(span, textNode);
        //   }
        // }

        contents.window.document.addEventListener(
          "mousemove",
          (e: MouseEvent) => {
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
              // // get distance from mouse to left edge of window
              // const distance = e.screenX; // - window.innerWidth / 2;
              // console.log("distance", distance);
            }
          }
        );

        // Add styles for hoverable words
        const style = contents.window.document.createElement("style");
        style.textContent = `
          .hoverable-word {
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .kana-word {
            cursor: pointer;
            margin: 0px 2px;
          }
          .a {
            color: #999;
          }
          .b {
            color: #000;
          }
          .hoverable-word:hover {
            background-color: yellow;
          }
        `;
        contents.window.document.head.appendChild(style);
      });
    }
  });

  return (
    <div style={{ height: "100vh" }}>
      {/* <div
        style={{
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        {tooltipData?.engWord}
      </div> */}
      <ReactReader
        url={"files/Alices Adventures in Wonderland.epub"}
        // url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={changeLoc}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
          _rendition.on("relocated", (location: any) => {
            const currentPage = location.start.displayed.page;
            const totalPages = location.start.displayed.total;
            const pageMin = (currentPage - 1) * window.innerWidth;
            const pageMax = currentPage * window.innerWidth;
            const chapter = location.start.index + 1;
            setPage({ currentPage, totalPages, pageMin, pageMax, chapter });
            transformTextNodes();
          });
        }}
      />
      <div
        style={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        P: {page.currentPage} - CH: {page.chapter}
      </div>
      {tooltipData && (
        <WordTooltip data={tooltipData} position={mousePosition} />
      )}
    </div>
  );
};
