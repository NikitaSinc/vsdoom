import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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
}

export function deactivate() { }
