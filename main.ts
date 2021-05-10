import Config from "./helper/config";
import { Plugin } from "obsidian";
import { render, EditorUtils } from "./helper/editor";
import ConfigUI from "helper/configUi";

export default class VariablePlugin extends Plugin {
  editorUtils: WeakMap<CodeMirror.Editor, EditorUtils>;
  activeEditor: EditorUtils;
  async onload() {
    Config.getInstance().initialize(this);
    this.editorUtils = new WeakMap<CodeMirror.Editor, EditorUtils>();

    this.addSettingTab(new ConfigUI(this.app, this, Config.getInstance()));
    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      cm.on(
        "change",
        (cmEditor: CodeMirror.Editor, changeObj: CodeMirror.EditorChange) => {
          console.time("detection");

          if (changeObj.origin) {
            if (!this.editorUtils.get(cm)) {
              this.editorUtils.set(cm, new EditorUtils());
            }
            this.activeEditor = this.editorUtils.get(cm);
            cm.startOperation();
            this.activeEditor.detectDeletion(cmEditor, changeObj);
            this.activeEditor.detectKeywords(cmEditor, changeObj);
            cm.endOperation();
          }
          console.timeEnd("detection");
        }
      );
    });

    this.registerMarkdownPostProcessor(render);
  }

  onunload() {
    console.log("unloading obsidian-values");
  }
}
