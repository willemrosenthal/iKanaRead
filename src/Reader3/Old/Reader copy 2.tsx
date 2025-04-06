import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import { toHiragana, toKatakana } from "wanakana";
import { WordTooltip } from "../../components/WordTooltip";
import { seededHexColor } from "../seedColor";

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
}

let hiragana = false;
const getKana = (word: string) => {
  hiragana = !hiragana;
  return hiragana ? toHiragana(word) : toKatakana(word);
};

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

  function getDistanceToViewportCenter(textNode: Node) {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    // Step 1: Get bounding rect of the text node using a Range
    const range = textNode?.ownerDocument?.createRange();
    range?.selectNodeContents(textNode);
    const rects = range?.getClientRects();
    if (!rects || rects?.length === 0) return null;

    const textRect = rects[0]; // First rect should be sufficient for small text

    // Step 2: Calculate absolute position on the screen by walking through iframe chain
    let totalLeft = textRect.left;

    let currentWindow = textNode?.ownerDocument?.defaultView as Window;

    // if (!currentWindow) return null;

    while (currentWindow && currentWindow !== currentWindow.parent) {
      const iframe = currentWindow.frameElement;
      if (!iframe) break;

      const iframeRect = iframe.getBoundingClientRect();
      totalLeft += iframeRect.left;

      currentWindow = currentWindow.parent;
    }

    return totalLeft;
    // Step 3: Get the center of the top-level viewport
    // const centerX = window.innerWidth / 2;

    // Step 4: Get the center of the text node
    // const nodeCenterX = totalLeft + textRect.width / 2;
    // const nodeCenterY = totalTop + textRect.height / 2;

    // Step 5: Compute Euclidean distance
    // const dx = nodeCenterX - centerX;
    // const dy = nodeCenterY - centerY;

    // return Math.floor(Math.sqrt(dx * dx + dy * dy));
  }

  function getVisibleNodes() {
    if (!rendition.current) return [];

    // Get the current view
    const currentView = (rendition.current.views() as any)._views[0];
    console.log("views", currentView);
    if (!currentView) return [];
    console.log("currentView", currentView);
    // Get the view's content window and document
    const doc = currentView.document;
    const viewRect = currentView.element.getBoundingClientRect();

    console.log("doc", doc);
    console.log("viewRect", viewRect);

    // Get all text nodes
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);

    const visibleNodes: Node[] = [];
    let node = walker.nextNode();

    while (node) {
      const range = doc.createRange();
      range.selectNodeContents(node);
      const rects = range.getClientRects();

      // Check if any part of the node is within the view
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (
          rect.top < viewRect.bottom &&
          rect.bottom > viewRect.top &&
          rect.left < viewRect.right &&
          rect.right > viewRect.left
        ) {
          visibleNodes.push(node);
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.style) {
              node.style.color = seededHexColor(page.currentPage);
            }
          }
        }
      }
      node = walker.nextNode();
    }

    return visibleNodes;
  }

  const transformTextNodes = () => {
    // Process each text node
    if (!textNodes.current || !contentsRef.current) return;
    for (let i = 0; i < textNodes.current.snapshotLength; i++) {
      const textNode = textNodes.current.snapshotItem(i);
      // check if textNode is currently visible to the user in dom (not off screen, not hidden, etc)
      // const isVisible = textNode && isRenderedTextInIframe(textNode);
      const distToCenter = textNode && getDistanceToViewportCenter(textNode);

      if (
        distToCenter &&
        (distToCenter < page.pageMin || distToCenter > page.pageMax)
      )
        return;
      // if (!isVisible) continue;

      if (textNode && textNode.textContent?.trim()) {
        const pageColor = seededHexColor(page.currentPage);
        // Create a span to replace the text node
        const span = contentsRef.current.window.document.createElement("span");
        // Split text into words and wrap each in a span
        span.innerHTML = textNode.textContent
          .split(/(\s+)/)
          .map((word: string) => {
            const trimmed = word.trim();
            let kana = getKana(trimmed);

            return trimmed
              ? `<span class="hoverable-word" data-eng="${trimmed}" data-kana="${kana}" style="color: ${pageColor}">${distToCenter}</span>`
              : word;
          })
          .join("");
        textNode?.parentNode?.replaceChild(span, textNode);
      }
    }
  };

  const changeLoc = (loc: string) => {
    setLocation(loc);
    setTimeout(() => {
      transformTextNodes();
      console.log("visible nodes", getVisibleNodes());
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
      <div>{tooltipData?.engWord}</div>
      <ReactReader
        url={"files/Alices Adventures in Wonderland.epub"}
        // url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={changeLoc}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
          // Set up the relocated listener when rendition is first assigned
          _rendition.on("relocated", (location: any) => {
            const currentPage = location.start.displayed.page;
            const totalPages = location.start.displayed.total;
            const pageMin = currentPage - 1 * window.innerWidth;
            const pageMax = currentPage * window.innerWidth;
            setPage({ currentPage, totalPages, pageMin, pageMax });
          });
        }}
        // getRendition={(_rendition: Rendition) => {
        //   rendition.current = _rendition;
        // }}
      />
      <div style={{ color: seededHexColor(page.currentPage) }}>
        {page.pageMin}-!-{page.currentPage}-!-{page.pageMax}
      </div>
      {tooltipData && (
        <WordTooltip data={tooltipData} position={mousePosition} />
      )}
    </div>
  );
};
