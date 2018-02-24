'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let highlightDecoration : vscode.TextEditorDecorationType;
let normalDecoration : vscode.TextEditorDecorationType;
let omitLanguages : string[];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "indented-block-highlighting" is now active!');
    let config = vscode.workspace.getConfiguration("blockhighlight");
    omitLanguages = config.get("omit", ["plaintext"]);

    let blockHighlighter : BlockHL = new BlockHL;
    let blockHighlighterController : BHLController = new BHLController(blockHighlighter);

    blockHighlighter.updateLine();
    context.subscriptions.push(blockHighlighter);
    context.subscriptions.push(blockHighlighterController);
}

// this method is called when your extension is deactivated
export function deactivate() {

}

class BlockHL{


    public updateLine(){
        var start  = new Date().getTime(); // Timing

        let editor = vscode.window.activeTextEditor;
        if(!editor){
            return;
        }
        
        // Omit languages
        if(omitLanguages.indexOf(editor.document.languageId) > - 1){
            return;
        }
        
        // Handle Single Line 
        if(editor.selection.isSingleLine){
            let topLine = this.findTop(editor);
            let botLine = this.findBot(editor, topLine);
            let HLRange : vscode.Range;

            // Handle Significant Whitespace
            // TODO: Add config setting for this instead of hardcoding in python
            if(editor.document.languageId === 'python'){
                botLine = this.pruneTrailingWhitespace(editor, botLine);
            }
            
            // If top level statement that doesn't start a block the entire file is in it's context
            if(topLine.lineNumber === botLine.lineNumber && topLine.firstNonWhitespaceCharacterIndex === 0){
                // Do nothing for now
                this.unhighlightAll(editor);
            }else{
                HLRange = new vscode.Range(topLine.lineNumber + 1,0 ,
                    botLine.lineNumber - 1, Number.MAX_VALUE);
                this.highlightRange(editor, HLRange);
            }
        }
        // Handle Multiple Lines
        // Right now just doesn't highlight anything
        else{
            this.unhighlightAll(editor);
        }

        // Timing
        var end = new Date().getTime();
        console.log("Update Time: ".concat(String(end - start)));
    }

    findTop(editor :vscode.TextEditor){
        let line : vscode.TextLine = editor.document.lineAt(editor.selection.active);
        //If whitespace selected process closest nonwhitespace above it
        
        while(line.isEmptyOrWhitespace && line.lineNumber > 0){
            line = editor.document.lineAt(line.lineNumber - 1);
        }
        if(line.lineNumber < editor.document.lineCount - 1 && !line.isEmptyOrWhitespace){            
            let nextLine = editor.document.lineAt(line.lineNumber + 1);
            // Find first nonwhitespace line
            while(nextLine.isEmptyOrWhitespace && nextLine.lineNumber < editor.document.lineCount - 1){
                nextLine = editor.document.lineAt(nextLine.lineNumber + 1);
            }
        }
        let indentLevel = NaN;
        while(line.lineNumber > 0){
            if(!line.isEmptyOrWhitespace){
                let nextLevel = line.firstNonWhitespaceCharacterIndex;
                if(Number.isNaN(indentLevel)){
                    indentLevel = nextLevel;
                }
                if(nextLevel === 0){
                    return line;
                }
                if(nextLevel < indentLevel){
                    return line;
                }
            }
            line = editor.document.lineAt(line.lineNumber - 1);
        }
        return line;
    }

    findBot(editor : vscode.TextEditor, topLine : vscode.TextLine){
        let line : vscode.TextLine = editor.document.lineAt(topLine.lineNumber + 1);

        while(line.lineNumber < editor.document.lineCount - 1){
            if(!line.isEmptyOrWhitespace){
                let nextLevel = line.firstNonWhitespaceCharacterIndex;
                if(nextLevel <= topLine.firstNonWhitespaceCharacterIndex){
                    return line;
                }
            }
            line = editor.document.lineAt(line.lineNumber + 1);
        }
        console.log("EOF Reached");
        return line;
    }

    pruneTrailingWhitespace(editor : vscode.TextEditor, bot : vscode.TextLine){
        if(editor.document.lineCount < 2){
            return bot;
        }
        let newBot = editor.document.lineAt(bot.lineNumber - 1);
        while(newBot.isEmptyOrWhitespace){
            newBot = editor.document.lineAt(newBot.lineNumber - 1);
        }
        // Up 1 for highlighting range clipping
        newBot = editor.document.lineAt(newBot.lineNumber + 1);
        return newBot;
    }

    changeActive(){
        console.log("Active Window Changed");
    }

    highlightRange(editor: vscode.TextEditor, range : vscode.Range){
        if(highlightDecoration){
            highlightDecoration.dispose();
        }
        // Hard BG color
        let config = vscode.workspace.getConfiguration("blockhighlight");
        let rgbaArray : string[] = config.get("background", ["200", "100", "255", ".05"]);
        let rgbaStr = "rgba("
                        .concat(rgbaArray[0]).concat(", ")
                        .concat(rgbaArray[1]).concat(", ")
                        .concat(rgbaArray[2]).concat(", ")
                        .concat(rgbaArray[3])
                        .concat(")");
        highlightDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
            backgroundColor: rgbaStr
        });

        editor.setDecorations(highlightDecoration, [range]);
        console.log("Highlighting called on " + rgbaStr);
    }

    unhighlightAll(editor :vscode.TextEditor){
        if(highlightDecoration){
            highlightDecoration.dispose();
        }
    }

    dispose(){

    }
}

class BHLController{

    private _blockHL : BlockHL;
    private _disposable : vscode.Disposable;


    public constructor(blockHL : BlockHL){
        this._blockHL = blockHL;
        
        let subscriptions : vscode.Disposable[] = [];
        vscode.window.onDidChangeActiveTextEditor(this._onChangeActive, this, subscriptions);    
        vscode.window.onDidChangeTextEditorSelection(this._onLineChange, this, subscriptions);    

        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose(){
        this._disposable.dispose();
    }

    private _onChangeActive(){
        this._blockHL.changeActive();
    }

    private _onLineChange(){
        this._blockHL.updateLine();
    }
}