import { Rendition } from "epubjs";
import React, { useRef, useState } from "react";
import { ReactReader } from "react-reader";

export const ReadTest: React.FC = () => {
  const [location, setLocation] = useState<string | number>(0);
  const rendition = useRef<Rendition | undefined>(undefined);

  console.log("rendition", rendition.current);

  return (
    <div style={{ height: "100vh" }}>
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
        getRendition={(_rendition: Rendition) => {
          rendition.current = _rendition;
          rendition.current.themes.fontSize(true ? "140%" : "100%");
        }}
      />
    </div>
  );
};
