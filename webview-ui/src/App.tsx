import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";

function App() {
  console.log("Hello from webview");
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h1>Hello the World!</h1>
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
    </main>
  );
}

export default App;

