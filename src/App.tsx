import React from "react";
// import logo from "./logo.svg";
import "./App.css";
// import { ReadTest } from "./ReaderOriginal/ReadTest3";
// import { Reader } from "./Reader2/Reader";
import { Reader } from "./Reader3/Reader";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <Reader />
      {/* <Reader /> */}
    </div>
  );
}

export default App;
