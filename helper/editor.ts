import { findKeyValue } from "../helper/variables";
import AnyDefinition from "../helper/variables/anyDefinition";
import Placeholder from "../helper/variables/placeholder";
import Definition from "../helper/variables/definition";
import NewPlaceholder from "../helper/variables/newPlaceholder";
import CursorTracker from "../helper/cursorTracker";
import { Replacer } from "../helper/replacer";
import { decode } from "html-entities";
import AnyPlaceholder from "./variables/anyPlaceholder";

export function adjustCursor(editor: CodeMirror.Editor, offSet: number) {
  editor.setCursor({
    line: editor.getCursor().line,
    ch: editor.getCursor().ch + offSet,
  });
}

export function createChangeLog(
  removedText: string,
  cmEditor: CodeMirror.Editor,
  lineIndex: number,
  charIndex: number
) {
  let currentText = cmEditor.getLineHandle(lineIndex)?.text || "";
  return {
    before: [
      currentText.slice(0, charIndex),
      removedText,
      currentText.slice(charIndex),
    ].join(""),
    after: currentText,
  };
}

export async function render(el: HTMLElement) {
  let decodedHTML = decode(el.innerHTML);
  let def = new AnyDefinition();
  def.parse(decodedHTML).forEach((result) => {
    decodedHTML = decodedHTML.replace(
      new Definition(result.key).regex,
      result.value
    );
  });
  let placeholder = new AnyPlaceholder();
  placeholder.parse(decodedHTML).forEach((result) => {
    decodedHTML = decodedHTML.replace(
      new Placeholder(result.key).regex,
      result.value
    );
  });
  el.innerHTML = decodedHTML;
}

export class EditorUtils {
  keyValue = new Map<string, string>();

  detectDeletion = (
    cmEditor: CodeMirror.Editor,
    changeObj: CodeMirror.EditorChange
  ) => {
    let charIndex = changeObj.from.ch;
    let lineIndex = changeObj.from.line;
    let definitionChange = new Array<Replacer>();

    changeObj.removed.forEach((removedText, index) => {
      lineIndex += index;
      let changeLog = createChangeLog(
        removedText,
        cmEditor,
        lineIndex,
        charIndex
      );

      let definitionsBefore = findKeyValue(
        changeLog.before,
        new AnyDefinition()
      );

      //before change there was no placeholder, we can skip
      if (definitionsBefore.length == 0) {
        return;
      }

      let uniqueDefinitionsBefore = new Set(
        definitionsBefore.map((element) => element.key)
      );

      let definitionsAfter = findKeyValue(changeLog.after, new AnyDefinition());

      let uniqueDefinitionsAfter = new Set(
        definitionsAfter.map((element) => element.key)
      );

      uniqueDefinitionsBefore.forEach((definition) => {
        if (!uniqueDefinitionsAfter.has(definition)) {
          definitionChange.push(
            new Replacer(
              new Placeholder(definition),
              new NewPlaceholder(definition),
              ""
            )
          );
          this.keyValue.delete(definition);
        }
      });

      charIndex = 0;
    });
    this.updatePlaceholder(cmEditor, definitionChange);
  };

  updatePlaceholder = (
    cmEditor: CodeMirror.Editor,
    changedDefinition: Array<Replacer>
  ) => {
    if (changedDefinition.length == 0) {
      return;
    }
    let pos = cmEditor.getCursor();
    cmEditor.eachLine((line) => {
      //Find placeholders for all changed values per line
      let lineText = line.text;
      let changed = false;
      changedDefinition.forEach((replacer) => {
        let result = replacer.replace(lineText);
        lineText = result.text;
        changed = changed ? true : result.changed;
      });

      if (changed) {
        cmEditor.replaceRange(
          lineText,
          {
            line: cmEditor.getLineNumber(line),
            ch: 0,
          },
          {
            line: cmEditor.getLineNumber(line),
            ch: line.text.length,
          }
        );
      }
    });

    cmEditor.setCursor(pos);
  };

  expandPlaceholder = (
    cmEditor: CodeMirror.Editor,
    changedPlaceholder: Array<Replacer>,
    line: CodeMirror.LineHandle,
    moveCursor: boolean
  ) => {
    if (changedPlaceholder.length == 0) {
      return;
    }

    let lineText = line.text;
    let cursorTracker = new CursorTracker(cmEditor.getCursor().ch);
    changedPlaceholder.forEach((replacer) => {
      let result = replacer.replace(lineText);

      cursorTracker.addText(replacer.searchFor, result.text, lineText);
      lineText = result.text;
    });

    line.text = lineText;

    cmEditor.refresh();

    if (moveCursor) {
      adjustCursor(cmEditor, cursorTracker.offset);
    }
  };

  init(fileContent: Array<string>) {
    fileContent.forEach((line) => {
      let definitionAnalysis = findKeyValue(line, new AnyDefinition());

      // Detect change in definition
      definitionAnalysis.forEach((result) => {
        if (this.keyValue.get(result.key) != result.value) {
          this.keyValue.set(result.key, result.value);
        }
      });
    });
  }

  detectKeywords = (
    cmEditor: CodeMirror.Editor,
    changeObj: CodeMirror.EditorChange
  ) => {
    let lineIndex = changeObj.from.line;
    changeObj.text.forEach(() => {
      // Detect definition
      let currentLineHandle = cmEditor.getLineHandle(lineIndex);
      let currentLineText = currentLineHandle.text;
      let definitionAnalysis = findKeyValue(
        currentLineText,
        new AnyDefinition()
      );

      // Detect change in definition
      let definitionChange = new Array<Replacer>();
      definitionAnalysis.forEach((result) => {
        if (this.keyValue.get(result.key) != result.value) {
          this.keyValue.set(result.key, result.value);
          definitionChange.push(
            new Replacer(
              new Placeholder(result.key),
              new Placeholder(result.key),
              result.value
            ),
            new Replacer(
              new NewPlaceholder(result.key),
              new Placeholder(result.key),
              result.value
            )
          );
        }
      });
      // Handle change of definition in placeholders
      this.updatePlaceholder(cmEditor, definitionChange);

      // Detect new placeholder
      let placeholderAnalysis = findKeyValue(
        currentLineText,
        new NewPlaceholder()
      );

      let placeholderChange = new Array<Replacer>();
      placeholderAnalysis.forEach((result) => {
        if (!!this.keyValue.get(result.key)) {
          placeholderChange.push(
            new Replacer(
              new NewPlaceholder(result.key),
              new Placeholder(result.key),
              this.keyValue.get(result.key)
            )
          );
        }
      });

      this.expandPlaceholder(
        cmEditor,
        placeholderChange,
        currentLineHandle,
        true
      );

      lineIndex++;
    });
  };
}
