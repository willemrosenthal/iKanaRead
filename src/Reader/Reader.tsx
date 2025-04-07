import React, { useRef, useState, useEffect } from "react";
import { Rendition } from "epubjs";
import { ReactReader } from "react-reader";
import { toHiragana } from "wanakana";
import { WordTooltip } from "../components/WordTooltip";
import {
  splitSentence,
  transcribeSentenceArray,
} from "../english-to-katakana/services/TranscriptionService";
import { TranscriptionResult } from "../english-to-katakana/types";
import { useStorage } from "../hooks/useStorage";
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

let tooltipTimeout: NodeJS.Timeout | null = null;

export const Reader: React.FC = () => {
  // const [location, setLocation] = useState<string | number>(0);
  const [location, setLocation] = useStorage<string | number>("book-loc", 0);
  const rendition = useRef<Rendition | undefined>(undefined);

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState<Position | undefined>();
  const hoverTarget = useRef<HTMLElement | null>(null);

  const textNodes = useRef<XPathResult>();

  const [displayWordInfo, setDisplayWordInfo] = useState<boolean>(false);

  const [page, setPage] = useState<PageNumber>({
    currentPage: 0,
    totalPages: 0,
    pageMin: 0,
    pageMax: 500,
    chapter: 0,
  });

  const transformTextNodes = (contents: any, txtNodes?: XPathResult) => {
    if (translatedChapters.has(page.chapter)) return;
    translatedChapters.add(page.chapter);

    // get nodes
    const nodes = txtNodes || textNodes.current;
    if (!nodes || !contents) return;

    // Process each text node
    for (let i = 0; i < nodes.snapshotLength; i++) {
      console.log("textNodes.current.snapshotLength", nodes.snapshotLength);
      const textNode = nodes.snapshotItem(i);

      if (textNode && textNode.textContent?.trim()) {
        // Create a span to replace the text node
        const span = contents.window.document.createElement("span");

        const words = splitSentence(textNode.textContent);
        const transcription = transcribeSentenceArray(words);
        let altWord = false;
        let katakana = false;
        span.innerHTML = transcription
          .map((word: TranscriptionResult) => {
            if (word.katakana[0] === "E_DIC") {
              return word.original;
            }
            altWord = !altWord;
            let kana = word.katakana[0];
            const eng = word.original;
            if (katakana) {
              kana = toHiragana(kana);
            }
            katakana = !katakana;
            return word
              ? `<span class="kana-word ${
                  altWord ? "a" : "b"
                } hoverable-word" data-kana="${kana}" data-eng="${eng}">${kana}</span>`
              : word;
          })
          .join("");
        textNode?.parentNode?.replaceChild(span, textNode);
      }
    }
  };

  const hideTooltip = () => {
    setDisplayWordInfo(false);
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
  };

  const changeLoc = (loc: string) => {
    setLocation(loc);
    hideTooltip();
  };

  const setMousePos = (x: number, y: number) => {
    setMousePosition({ x, y });
  };

  const setUpChapter = (contents: any) => {
    // prevent this from running multiple times
    if (translatedChapters.has(page.chapter)) return;

    textNodes.current = contents.window.document.evaluate(
      "//text()",
      contents.window.document.body,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    transformTextNodes(contents);

    const click = () => {
      if (tooltipTimeout) {
        hideTooltip();
      } else {
        setDisplayWordInfo(true);
        tooltipTimeout = setTimeout(() => {
          setDisplayWordInfo(false);
        }, 3000);
      }
    };

    contents.window.document.addEventListener("click", (e: MouseEvent) => {
      click();
    });

    // contents.window.document.addEventListener("touchstart", (e: TouchEvent) => {
    //   click();
    // });

    contents.window.document.addEventListener("mousemove", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === hoverTarget.current) {
        setMousePos(e.screenX, e.screenY);
        return;
      }
      hideTooltip();
      hoverTarget.current = target;
      const engWord = target.getAttribute("data-eng") || "";
      const kanaWord = target.getAttribute("data-kana") || "";
      if (engWord) {
        setTooltipData({
          engWord,
          kanaWord,
        });
        setMousePos(e.screenX, e.screenY);
      } else {
        setTooltipData(null);
      }
    });

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
        color: #7A7A7A;
      }
      .b {
        color: #000;
      }
      .hoverable-word:hover {
        background-color: yellow;
      }
    `;
    contents.window.document.head.appendChild(style);
  };

  const deregisterChapter = (contents: any) => {
    contents.window.document.removeEventListener("click", (e: MouseEvent) => {
      if (tooltipTimeout) {
        hideTooltip();
      }
    });
    // contents.window.document.removeEventListener("tou", (e: MouseEvent) => {
    //   if (tooltipTimeout) {
    //     hideTooltip();
    //   }
    // });
    contents.window.document.removeEventListener(
      "mousemove",
      (e: MouseEvent) => {
        hideTooltip();
      }
    );
  };

  useEffect(() => {
    if (rendition.current) {
      rendition.current.hooks.content.register((contents: any) => {
        setUpChapter(contents);
      });
      rendition.current.hooks.content.deregister((contents: any) => {
        deregisterChapter(contents);
      });
    }
  });

  // const removeStyles = (contents: any) => {
  //   const body = contents.window.document.body;
  //   // Remove the style attribute completely and set new styles
  //   body.removeAttribute("style");
  //   body.setAttribute("style", "");
  //   contents.window.document.body.removeAttribute("padding-left");
  //   body.style["padding-left"] = "0px";
  //   contents.window.document.body.removeAttribute("padding-right");
  //   body.style["padding-right"] = "0px";
  //   console.log("body", body);
  //   // Then set the styles we want to keep, excluding padding
  //   // body.style.cssText = `
  //   //       width: 311px;
  //   //       height: 727px;
  //   //       overflow-y: hidden;
  //   //       margin: 0px !important;
  //   //       box-sizing: border-box;
  //   //       max-width: inherit;
  //   //       column-fill: auto;
  //   //       column-gap: 24px;
  //   //       column-width: 311px;
  //   //     `;
  // };

  // useEffect(() => {
  //   if (rendition.current) {
  //     rendition.current.hooks.content.register((contents: any) => {
  //       removeStyles(contents);
  //     });
  //   }
  // }, []);

  return (
    <div style={{ height: "100vh" }}>
      <ReactReader
        url={"files/Alices Adventures in Wonderland.epub"}
        // url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={changeLoc}
        epubOptions={{
          allowPopups: true, // Adds `allow-popups` to sandbox-attribute
          allowScriptedContent: true, // Adds `allow-scripts` to sandbox-attribute
        }}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;

          // initial translation
          _rendition.hooks.content.register((contents: any) => {
            setUpChapter(contents);
            // removeStyles(contents);
          });
          rendition.current.hooks.content.deregister((contents: any) => {
            deregisterChapter(contents);
          });

          _rendition.on("relocated", (location: any) => {
            const currentPage = location.start.displayed.page;
            const totalPages = location.start.displayed.total;
            const pageMin = (currentPage - 1) * window.innerWidth;
            const pageMax = currentPage * window.innerWidth;
            const chapter = location.start.index + 1;
            setPage({ currentPage, totalPages, pageMin, pageMax, chapter });
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
        P: {page.currentPage} - C: {page.chapter}
      </div>
      {/* {tooltipData && ( */}
      {tooltipData && displayWordInfo && (
        <WordTooltip data={tooltipData} position={mousePosition} />
      )}
    </div>
  );
};
