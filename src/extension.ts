// import * as vscode from "vscode";
import { commands, ExtensionContext } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { DictionaryTablePanel } from "./panels/DictionaryTablePanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("hello-world.showHelloWorld", () => {
    HelloWorldPanel.render(context.extensionUri);
  });

  console.log("Hey from the extension!");

  const showDictionaryTableCommand = commands.registerCommand("react.showDictionaryTable", async () => {
  //   const uri = vscode.Uri.joinPath(context.extensionUri, 'dictionary.dictionary');
  //   const fileData = await (vscode.workspace.fs.readFile(uri));
  //   const dataString = new TextDecoder().decode(fileData);
    // console.log(dataString);
    
    DictionaryTablePanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(showDictionaryTableCommand);
}
