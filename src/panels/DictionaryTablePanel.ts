import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import * as vscode from "vscode";
import { Dictionary } from "codex-types";

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
export class DictionaryTablePanel {
  public static currentPanel: DictionaryTablePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    const initAsync = async () => {
      // const uri = vscode.Uri.joinPath(extensionUri, 'dictionary.dictionary');
      // const fileData = await (vscode.workspace.fs.readFile(uri));
      // const data = new TextDecoder().decode(fileData);
      const { data, uri } = await FileHandler.readFile('Dictionary/dictionary.dictionary');
      // return if no data
      if (!data) {
        return;
      }
      console.log("Decoded, unparsed dictionary data:", data);
      const dictionary: Dictionary = JSON.parse(data);
      console.log("Parsed dictionary:", dictionary);
      
      // Set the HTML content for the webview panel
      this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

      // Set an event listener to listen for messages passed from the webview context
      this._setWebviewMessageListener(this._panel.webview, uri);

      // Post message to app
      console.log("Sending dictionary to webview:", dictionary);
      this._panel.webview.postMessage({ command: "sendData", data: dictionary });
    };


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
  public static render(extensionUri: Uri) {
    if (DictionaryTablePanel.currentPanel) {
      // If the webview panel already exists reveal it
      DictionaryTablePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "showDictionaryTable",
        // Panel title
        "Dictionary Table",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "editable-react-table/dist")],
        }
      );


      DictionaryTablePanel.currentPanel = new DictionaryTablePanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
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
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["editable-react-table", "dist", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["editable-react-table", "dist", "assets", "index.js"]);

    const nonce = getNonce();

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
  private _setWebviewMessageListener(webview: Webview, uri: any) {
    webview.onDidReceiveMessage(async (message) => {
      const command = message.command;
      const data = message.data;

      switch (command) {
        case "dataReceived":
          // Code that should run in response to the hello message command
          window.showInformationMessage(data);
          return;
        case "updateData":
          console.log('The data that would be written to file, pre-encoding:');
          console.log({ data });
          const fileData = new TextEncoder().encode(JSON.stringify(data));
          await vscode.workspace.fs.writeFile(uri, fileData);
          console.log('The data that would be written to file, encoded:');
          console.log({ fileData });
          return;
        case 'confirmRemove':
          const confirmed = await window.showInformationMessage(
            `Do you want to remove ${message.count} items?`,
            { modal: true },
            'Yes',
            'No'
          );
          if (confirmed === 'Yes') {
            webview.postMessage({ command: 'removeConfirmed' });
          }
          break;
      }
    },
    undefined,
    this._disposables
    );
  }

  
}

class FileHandler {
  static async readFile(filePath: string): Promise<{ data: string | undefined; uri: vscode.Uri | undefined }> {
    try {
      if (!vscode.workspace.workspaceFolders) {
        throw new Error("No workspace folder found");
      }
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
      const fileUri = vscode.Uri.joinPath(workspaceFolder, filePath);
      const fileData = await vscode.workspace.fs.readFile(fileUri);
      const data = new TextDecoder().decode(fileData);
      return { data, uri: fileUri };
    } catch (error) {
      vscode.window.showErrorMessage(`Error reading file: ${filePath}`);
      console.error({ error });
      return { data: undefined, uri: undefined };
    }
  }

  static async writeFile(filePath: string, data: string): Promise<void> {
    try {
      if (!vscode.workspace.workspaceFolders) {
        throw new Error("No workspace folder found");
      }
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
      const fileUri = vscode.Uri.joinPath(workspaceFolder, filePath);
      const fileData = new TextEncoder().encode(data);
      await vscode.workspace.fs.writeFile(fileUri, fileData);
    } catch (error) {
      console.error({ error });
      vscode.window.showErrorMessage(`Error writing to file: ${filePath}`);
    }
  }
}
