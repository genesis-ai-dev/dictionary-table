// import * as vscode from "vscode";
import { commands, ExtensionContext } from "vscode";
import { DictionaryTablePanel } from "./panels/DictionaryTablePanel";

export function activate(context: ExtensionContext) {

  console.log("Hey from the extension!");

  const showDictionaryTableCommand = commands.registerCommand("react.showDictionaryTable", async () => {
    
    DictionaryTablePanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showDictionaryTableCommand);
}
