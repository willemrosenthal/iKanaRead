import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import { toHiragana, toKatakana } from "wanakana";

let hiragana = false;
const getKana = (word: string) => {
  hiragana = !hiragana;
  return hiragana ? toHiragana(word) : toKatakana(word);
};

export const Reader: React.FC = () => {
  const [location, setLocation] = useState<string | number>(0);
  const rendition = useRef<Rendition | undefined>(undefined);

  const textNodes = useRef<XPathResult>();
  const contentsRef = useRef<any>();

  const transformTextNodes = () => {
    // Process each text node
    if (!textNodes.current || !contentsRef.current) return;
    for (let i = 0; i < textNodes.current.snapshotLength; i++) {
      const textNode = textNodes.current.snapshotItem(i);
      if (textNode && textNode.textContent?.trim()) {
        // Create a span to replace the text node
        const span = contentsRef.current.window.document.createElement("span");
        // Split text into words and wrap each in a span
        span.innerHTML = textNode.textContent
          .split(/(\s+)/)
          .map((word: string) => {
            const trimmed = word.trim();
            let kana = getKana(trimmed);

            return trimmed
              ? `<span class="hoverable-word">${kana}</span>`
              : word;
          })
          .join("");
        textNode?.parentNode?.replaceChild(span, textNode);
      }
    }
  };

  const changeLoc = (loc: string) => {
    setLocation(loc);
    transformTextNodes();
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
      <ReactReader
        url={"files/Alices Adventures in Wonderland.epub"}
        // url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={changeLoc}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
        }}
      />
    </div>
  );
};
