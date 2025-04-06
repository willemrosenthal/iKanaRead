import { Rendition } from "epubjs";
import React, { useRef, useState, useEffect } from "react";
import { ReactReader } from "react-reader";
import { toHiragana, toKatakana } from "wanakana";

let hiragana = false;
const getKana = (word: string) => {
  hiragana = !hiragana;
  return hiragana ? toHiragana(word) : toKatakana(word);
};

export const ReadTest: React.FC = () => {
  const [location, setLocation] = useState<string | number>(0);
  const rendition = useRef<Rendition | undefined>(undefined);

  useEffect(() => {
    if (rendition.current) {
      // Add a content hook that runs when each section is loaded
      rendition.current.hooks.content.register((contents: any) => {
        // Get all text nodes in the content
        const textNodes = contents.window.document.evaluate(
          "//text()",
          contents.window.document.body,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        // Process each text node
        for (let i = 0; i < textNodes.snapshotLength; i++) {
          const textNode = textNodes.snapshotItem(i);
          if (textNode && textNode.textContent.trim()) {
            // Create a span to replace the text node
            const span = contents.window.document.createElement("span");
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
            textNode.parentNode.replaceChild(span, textNode);
          }
        }

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
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
        }}
      />
    </div>
  );
};
