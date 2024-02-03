"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// import * as vscode from "vscode";
const vscode_1 = require("vscode");
const HelloWorldPanel_1 = require("./panels/HelloWorldPanel");
const DictionaryTablePanel_1 = require("./panels/DictionaryTablePanel");
function activate(context) {
    // Create the show hello world command
    const showHelloWorldCommand = vscode_1.commands.registerCommand("hello-world.showHelloWorld", () => {
        HelloWorldPanel_1.HelloWorldPanel.render(context.extensionUri);
    });
    console.log("Hey from the extension!");
    const showDictionaryTableCommand = vscode_1.commands.registerCommand("react.showDictionaryTable", () => __awaiter(this, void 0, void 0, function* () {
        //   const uri = vscode.Uri.joinPath(context.extensionUri, 'dictionary.dictionary');
        //   const fileData = await (vscode.workspace.fs.readFile(uri));
        //   const dataString = new TextDecoder().decode(fileData);
        // console.log(dataString);
        DictionaryTablePanel_1.DictionaryTablePanel.render(context.extensionUri);
    }));
    // Add command to the extension context
    context.subscriptions.push(showHelloWorldCommand);
    context.subscriptions.push(showDictionaryTableCommand);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map