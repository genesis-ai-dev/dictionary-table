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
exports.DictionaryTablePanel = void 0;
const vscode_1 = require("vscode");
const getUri_1 = require("../utilities/getUri");
const getNonce_1 = require("../utilities/getNonce");
const vscode = require("vscode");
/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
class DictionaryTablePanel {
    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        const initAsync = () => __awaiter(this, void 0, void 0, function* () {
            const uri = vscode.Uri.joinPath(extensionUri, 'dictionary.dictionary');
            const fileData = yield (vscode.workspace.fs.readFile(uri));
            const data = new TextDecoder().decode(fileData);
            console.log("Decoded, unparsed dictionary data:", data);
            const dictionary = JSON.parse(data);
            console.log("Parsed dictionary:", dictionary);
            // Set the HTML content for the webview panel
            this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
            // Set an event listener to listen for messages passed from the webview context
            this._setWebviewMessageListener(this._panel.webview, uri);
            // Post message to app
            console.log("Sending dictionary to webview:", dictionary);
            this._panel.webview.postMessage({ command: "sendData", data: dictionary });
        });
        initAsync().catch(console.error);
        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }
    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    static render(extensionUri) {
        if (DictionaryTablePanel.currentPanel) {
            // If the webview panel already exists reveal it
            DictionaryTablePanel.currentPanel._panel.reveal(vscode_1.ViewColumn.One);
        }
        else {
            // If a webview panel does not already exist create and show a new one
            const panel = vscode_1.window.createWebviewPanel(
            // Panel view type
            "showDictionaryTable", 
            // Panel title
            "Dictionary Table", 
            // The editor column the panel should be displayed in
            vscode_1.ViewColumn.One, 
            // Extra panel configurations
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
                localResourceRoots: [vscode_1.Uri.joinPath(extensionUri, "out"), vscode_1.Uri.joinPath(extensionUri, "editable-react-table/dist")],
            });
            DictionaryTablePanel.currentPanel = new DictionaryTablePanel(panel, extensionUri);
        }
    }
    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    dispose() {
        DictionaryTablePanel.currentPanel = undefined;
        // Dispose of the current webview panel
        this._panel.dispose();
        // Dispose of all disposables (i.e. commands) for the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the React webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    _getWebviewContent(webview, extensionUri) {
        // The CSS file from the React build output
        const stylesUri = (0, getUri_1.getUri)(webview, extensionUri, ["editable-react-table", "dist", "assets", "index.css"]);
        // The JS file from the React build output
        const scriptUri = (0, getUri_1.getUri)(webview, extensionUri, ["editable-react-table", "dist", "assets", "index.js"]);
        const nonce = (0, getNonce_1.getNonce)();
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        // window.initialData = ${JSON.stringify(data)};
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Dictionary Table</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }
    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    _setWebviewMessageListener(webview, uri) {
        webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            console.log({ message });
            const command = message.command;
            const data = message.data;
            switch (command) {
                case "dataReceived":
                    // Code that should run in response to the hello message command
                    vscode_1.window.showInformationMessage(data);
                    return;
                case "updateData":
                    console.log('The data that would be written to file, pre-encoding:');
                    console.log({ data });
                    const fileData = new TextEncoder().encode(JSON.stringify(data));
                    yield vscode.workspace.fs.writeFile(uri, fileData);
                    console.log('The data that would be written to file, encoded:');
                    console.log({ fileData });
                    return;
            }
        }), undefined, this._disposables);
    }
}
exports.DictionaryTablePanel = DictionaryTablePanel;
//# sourceMappingURL=DictionaryTablePanel.js.map