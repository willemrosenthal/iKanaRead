// import { Rendition } from "epubjs";
// import React, { useRef, useState, useEffect } from "react";
// import { ReactReader } from "react-reader";
// import { isHiragana, isKatakana, toHiragana, toKatakana } from "wanakana";
// // import { toHiragana  } from "hepburn";
// import { WordTooltip } from "./components/WordTooltip";
// // import * as jp from "jp-conversion";
// import { converter } from "./toKatakana/toKatakana";
// import { converter as converter2 } from "./toKatakana/toKatakana2";
// // import requestTranslate from "./requestTranslate";

// // const converter2 = new EnglishToKatakana();

// let hiragana = false;
// const getKana = (word: string) => {
//   hiragana = !hiragana;
//   const noPunctuation = word.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()"""'']/g, "");
//   const kana = hiragana ? toHiragana(word) : toKatakana(word);
//   console.log({
//     word,
//     kana,
//     "was_already:": isHiragana(word) || isKatakana(word),
//     // "jp💖": a2k(noPunctuation),
//     "jp:": converter.convert(noPunctuation),
//     "jp2:": converter2.convert(noPunctuation),
//   });
//   // if (isHiragana(kana) || isKatakana(kana)) return kana;
//   // return toKatakana(word);
//   return kana;
// };

// export const ReadTest: React.FC = () => {
//   const [location, setLocation] = useState<string | number>(0);
//   const [tooltipData, setTooltipData] = useState<{
//     word: string;
//     x: number;
//     y: number;
//   } | null>(null);
//   const rendition = useRef<Rendition | undefined>(undefined);

//   useEffect(() => {
//     if (rendition.current) {
//       // Add a content hook that runs when each section is loaded
//       rendition.current.hooks.content.register((contents: any) => {
//         // Get all text nodes in the content
//         const textNodes = contents.window.document.evaluate(
//           "//text()",
//           contents.window.document.body,
//           null,
//           XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
//           null
//         );
//         // requestTranslate;
//         // Process each text node
//         for (let i = 0; i < textNodes.snapshotLength; i++) {
//           const textNode = textNodes.snapshotItem(i);
//           if (textNode && textNode.textContent.trim()) {
//             // Create a span to replace the text node
//             const span = contents.window.document.createElement("span");
//             // Split text into words and wrap each in a span
//             span.innerHTML = textNode.textContent
//               .split(/(\s+)/)
//               .map((word: string) => {
//                 const trimmed = word.trim();
//                 let kana = getKana(trimmed);

//                 return trimmed
//                   ? `<span class="hoverable-word" data-original="${trimmed}">${kana}</span>`
//                   : word;
//               })
//               .join("");
//             textNode.parentNode.replaceChild(span, textNode);
//           }
//         }

//         // Add event listeners for hover
//         const words =
//           contents.window.document.getElementsByClassName("hoverable-word");
//         Array.from(words).forEach((wordElement) => {
//           if (wordElement instanceof Element) {
//             wordElement.addEventListener("mouseenter", (e: Event) => {
//               const target = e.target as HTMLElement;
//               const rect = target.getBoundingClientRect();
//               const originalWord = target.getAttribute("data-original") || "";
//               setTooltipData({
//                 word: originalWord,
//                 x: rect.left,
//                 y: rect.top,
//               });
//             });

//             wordElement.addEventListener("mouseleave", () => {
//               setTooltipData(null);
//             });
//           }
//         });

//         // Add styles for hoverable words
//         const style = contents.window.document.createElement("style");
//         style.textContent = `
//           .hoverable-word {
//             cursor: pointer;
//             transition: background-color 0.2s;
//           }
//           .hoverable-word:hover {
//             background-color: yellow;
//           }
//         `;
//         contents.window.document.head.appendChild(style);
//       });
//     }
//   });

//   return (
//     <div style={{ height: "100vh" }}>
//       <ReactReader
//         url="https://react-reader.metabits.no/files/alice.epub"
//         location={location}
//         locationChanged={(epubcfi: string) => setLocation(epubcfi)}
//         getRendition={(_rendition: Rendition) => {
//           rendition.current = _rendition;
//         }}
//       />
//       {tooltipData && (
//         <WordTooltip
//           word={tooltipData.word}
//           position={{ x: tooltipData.x, y: tooltipData.y }}
//         />
//       )}
//     </div>
//   );
// };
export const test = "";
