import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// SPC m p p
	const myProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			const tmp = uri.query.split("=")[1].substring(1);
			// TODO:
			const value = tmp.substring(0, tmp.length - 1);
			const lines = value.split("\\n");
			return lines.join('\n');
		}
	})();

	vscode.workspace.registerTextDocumentContentProvider('calva-evaluating', myProvider);

	let disposable = vscode.commands.registerCommand('vsdoom.evalIntoBuffer', async (name: string = '') => {
		const calvaExt = vscode.extensions.getExtension("betterthantomorrow.calva");
		if (calvaExt === undefined) {
			vscode.window.showErrorMessage(`Calva was not found!`);
		}
		try {
			const calva = calvaExt?.exports.v1;
			const [_, text] = calva.ranges.currentEnclosingForm();
			const evaluation = await calva.repl.evaluateCode("clj", `(with-out-str (clojure.pprint/pprint ${text}))`);
			let uri = vscode.Uri.parse('calva-evaluating:eval-result?result=' + evaluation.result);
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			doc = await vscode.languages.setTextDocumentLanguage(doc, "clojure");
			await vscode.window.showTextDocument(doc,
				{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: false });
		} catch (e) {
			vscode.window.showErrorMessage(`Calva was not found!` + calvaExt + calvaExt?.exports + " !! " + e);
		}
	});

	context.subscriptions.push(disposable);


	// converter
	//
	const cp = require('child_process');
	console.log("hello0");


  let callJet = function selectedTextToJet(from:string, to:string){
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			if (selection && !selection.isEmpty) {
				const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
    		const highlighted = editor.document.getText(selectionRange);
				console.log("text " + highlighted)
    		cp.exec(`echo '${highlighted}' | jet --to ${to} --from ${from}`, (err: Error, stdout: Buffer|String, stderr: Buffer|String) => {
    			if (err) {
						vscode.window.showWarningMessage('jet error: ' + err.toString());
					} else if (stderr) {
						vscode.window.showWarningMessage('jet error: ' + stderr.toString());
					} else if (stdout) {
    				console.log('stdout: ' + stdout)
						editor.edit(editBuilder => {
							editBuilder.replace(selectionRange, stdout.toString());
						})
					}
				});
			}
		}
	}

	let disposable1 = vscode.commands.registerCommand('vsdoom.edn-to-json', () => {
		callJet("edn", "json")
	});

	context.subscriptions.push(disposable1);

	let disposable2 = vscode.commands.registerCommand('vsdoom.json-to-edn', () => {
		callJet("json", "edn")
	});

	context.subscriptions.push(disposable2);


	let disposable3 = vscode.commands.registerCommand('vsdoom.yaml-to-json', () => {
		callJet("yaml", "json")
	});

	context.subscriptions.push(disposable3);

	let disposable4 = vscode.commands.registerCommand('vsdoom.json-to-yaml', () => {
		callJet("json", "yaml")
	});

	context.subscriptions.push(disposable4);


	let disposable5 = vscode.commands.registerCommand('vsdoom.yaml-to-edn', () => {
		callJet("yaml", "edn")
	});

	context.subscriptions.push(disposable5);


	let disposable6 = vscode.commands.registerCommand('vsdoom.edn-to-yaml', () => {
		callJet("edn", "yaml")
	});

	context.subscriptions.push(disposable6);

}

export function deactivate() { }
