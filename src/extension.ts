import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('dog-extention.dogExtention', () => {
        showDogWebview(context.extensionPath);
    });

    context.subscriptions.push(disposable);
}

// this fetches a random dog image from the dog.ceo api
async function getDogImg(): Promise<string | null> {
    try {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        const imageUrl = response.data.message;
        return imageUrl;
    } catch (error) {
        console.error('Failed to fetch dog image:', error);
        return null;
    }
}

// this shows the dog webview
async function showDogWebview(extensionPath: string) {
    const panel = vscode.window.createWebviewPanel(
        'dogPanel',
        'Dog',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true
        }
    );

    const imageUrl = await getDogImg();
    if (imageUrl) {
        const dogHtmlPath = vscode.Uri.file(path.join(extensionPath, 'dog.html'));
        const htmlContent = getWebviewContent(dogHtmlPath, imageUrl);
        panel.webview.html = htmlContent;

        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'fetchNewDog') {
                const newImageUrl = await getDogImg();
                if (newImageUrl) {
                    panel.webview.postMessage({ command: 'updateDogImage', imageUrl: newImageUrl });
                }
            }
        });
    }
}

// this returns the html content for the dog webview
function getWebviewContent(htmlPath: vscode.Uri, imageUrl: string): string {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
            <style>
                body {
                    width: 90%;
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }

                .dog-title {
                    margin-top: 10px;
                    margin-bottom: 10px;
                    font-size: 35px;
                }

                .dog-img {
                    width: 80vw;
                    max-height: 80vh;
                    object-fit: contain;
                }

                .new-dog-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 20px;
                }
            </style>
        </head>
        <body>
            <h1 class="dog-title">What's up DOG!</h1>
            <img class="dog-img" src="${imageUrl}" alt="Dog">
        </body>
        </html>
    `;
    return htmlContent;
}

export function deactivate() {}