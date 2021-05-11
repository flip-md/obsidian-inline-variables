import { EditorUtils, render } from "../helper/editor";
import { Replacer } from "../helper/replacer";
import { mocked } from "ts-jest/utils";
import Config from "../helper/config";
import Placeholder from "../helper/variables/placeholder";
import NewPlaceholder from "../helper/variables/newPlaceholder";

jest.mock("../helper/config");

beforeEach(() => {
  mocked(Config.getInstance).mockImplementation(() => {
    return {
      getSettings: () => {
        return {
          startString: "{",
          endString: "}",
          valueEncapsulationString: '"',
          separatorDefinition: ":",
          separatorPlaceholder: ":",
        };
      },
    } as any;
  });
});

class Line {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}

class Cursor {
  line: number;
  ch: number;
}
function makeEditor(text: string[], cursor: Cursor) {
  let lineArray = text.map((element) => new Line(element));

  const editor = {
    getCursor: () => cursor,
    getLine: (l: number) => lineArray[l],
    getLineHandle: (l: number) => lineArray[l],
    getLineNumber: (l: Line) => lineArray.indexOf(l),
    lastLine: () => lineArray.length - 1,
    lineCount: () => lineArray.length,
    isFolded: (l: number) => false,
    eachLine: (fn: (test: any) => void) => {
      lineArray.forEach((element) => fn(element));
    },
    replaceRange: (
      text: string,
      from: { line: number; ch: number },
      to: { line: number; ch: number }
    ) => {
      lineArray[from.line] = new Line(text);
    },
    setCursor: (newCursor: Cursor) => {
      cursor.ch = newCursor.ch;
      cursor.line = newCursor.line;
    },
    refresh: () => {},
    getValue: () => lineArray.map((element) => element.text).join("\n"),
  };

  return editor;
}

it("Handle update placeholder", () => {
  let editorUtil = new EditorUtils();

  let replacerList = new Array<Replacer>();
  replacerList.push(
    new Replacer(new Placeholder("key"), new Placeholder("key"), "value")
  );

  let editor = makeEditor(["hello"], { line: 0, ch: 2 });
  editorUtil.updatePlaceholder(editor as any, replacerList);
  expect(editor.getLine(0).text).toEqual("hello");

  editor = makeEditor(['we have a {key:"oldValue"}'], { line: 0, ch: 2 });
  editorUtil.updatePlaceholder(editor as any, replacerList);
  expect(editor.getLine(0).text).toEqual('we have a {key:"value"}');

  editor = makeEditor(
    [
      'we have a {key:"oldValue"}',
      "no template",
      'we have another {key:"oldValue"}',
    ],
    { line: 0, ch: 2 }
  );
  editorUtil.updatePlaceholder(editor as any, replacerList);
  expect(editor.getLine(0).text).toEqual('we have a {key:"value"}');
  expect(editor.getLine(1).text).toEqual("no template");
  expect(editor.getLine(2).text).toEqual('we have another {key:"value"}');
});

it("Handle expand placeholder", () => {
  let editorUtil = new EditorUtils();

  let replacerList = new Array<Replacer>();
  replacerList.push(
    new Replacer(new NewPlaceholder("key"), new Placeholder("key"), "value")
  );

  let editor = makeEditor(['{key:"oldValue"}'], { line: 0, ch: 2 });
  editorUtil.expandPlaceholder(
    editor as any,
    replacerList,
    editor.getLine(0),
    false
  );
  expect(editor.getLine(0).text).toEqual('{key:"oldValue"}');

  editor = makeEditor(["we have a {key}"], { line: 0, ch: 2 });
  editorUtil.expandPlaceholder(
    editor as any,
    replacerList,
    editor.getLine(0),
    false
  );
  expect(editor.getLine(0).text).toEqual('we have a {key:"value"}');

  editor = makeEditor(
    ['we have a {key1:"oldValue"}', "no template", "we have another {key}"],
    { line: 0, ch: 2 }
  );
  editorUtil.expandPlaceholder(
    editor as any,
    replacerList,
    editor.getLine(2),
    false
  );
  expect(editor.getLine(0).text).toEqual('we have a {key1:"oldValue"}');
  expect(editor.getLine(1).text).toEqual("no template");
  expect(editor.getLine(2).text).toEqual('we have another {key:"value"}');
});

it("Handle expand placeholder with cursor", () => {
  let editorUtil = new EditorUtils();

  let replacerList = new Array<Replacer>();
  replacerList.push(
    new Replacer(new NewPlaceholder("key"), new Placeholder("key"), "value")
  );

  let editor = makeEditor(["we have a {key} 123"], { line: 0, ch: 11 });
  editorUtil.expandPlaceholder(
    editor as any,
    replacerList,
    editor.getLine(0),
    true
  );
  expect(editor.getLine(0).text).toEqual('we have a {key:"value"} 123');
  expect(editor.getCursor().ch).toEqual(23);
});

it("Detect deletion", () => {
  let mockUpdatePlaceholder = jest.fn().mockReturnValue(null);
  let mockExpandPlaceholder = jest.fn().mockReturnValue(null);

  let editorUtil = new EditorUtils();

  editorUtil.keyValue.set("a", "test");
  editorUtil.updatePlaceholder = mockUpdatePlaceholder;
  editorUtil.expandPlaceholder = mockExpandPlaceholder;
  let editor = makeEditor(['{a:"test"', '{a:"test"}'], { line: 0, ch: 11 });
  editorUtil.detectDeletion(
    editor as any,
    { text: [""], removed: ["}"], from: { line: 0, ch: 10 } } as any
  );

  expect(mockUpdatePlaceholder.mock.calls.length).toBe(0);
  expect(editorUtil.keyValue.get("a")).toEqual("test");

  editor = makeEditor(['{a:"test"', '{a:"test"x'], { line: 0, ch: 11 });
  editorUtil.detectDeletion(
    editor as any,
    { text: [""], removed: ["}"], from: { line: 0, ch: 10 } } as any
  );

  expect(mockUpdatePlaceholder.mock.calls.length).toBe(0);
  expect(editorUtil.keyValue.get("a")).toBeNull;
});

it("Detect keywords", () => {
  let mockUpdatePlaceholder = jest.fn().mockReturnValue(null);
  let mockExpandPlaceholder = jest.fn().mockReturnValue(null);

  let editorUtil = new EditorUtils();

  editorUtil.updatePlaceholder = mockUpdatePlaceholder;
  editorUtil.expandPlaceholder = mockExpandPlaceholder;
  let editor = makeEditor(['{a:"test"}', "b"], { line: 0, ch: 11 });
  editorUtil.detectKeywords(
    editor as any,
    { text: ['{a:"test"}', "b"], from: { line: 0 } } as any
  );

  expect(mockUpdatePlaceholder.mock.calls.length).toBe(2);
  expect(mockUpdatePlaceholder.mock.calls[0][1].length).toEqual(2);
  expect(mockUpdatePlaceholder.mock.calls[0][1][0].searchFor.key).toEqual("a");
  expect(mockUpdatePlaceholder.mock.calls[0][1][1].searchFor.key).toEqual("a");

  expect(mockExpandPlaceholder.mock.calls.length).toBe(2);
  expect(mockExpandPlaceholder.mock.calls[0][1].length).toEqual(0);
  expect(mockExpandPlaceholder.mock.calls[1][1].length).toEqual(0);

  mockUpdatePlaceholder.mockClear();
  mockExpandPlaceholder.mockClear();
  editor = makeEditor(['{a:"test"}', "{a}"], { line: 0, ch: 11 });
  editorUtil.detectKeywords(
    editor as any,
    { text: ['{a:"test"}', "{a}"], from: { line: 0 } } as any
  );

  expect(mockUpdatePlaceholder.mock.calls.length).toBe(2);
  expect(mockUpdatePlaceholder.mock.calls[0][1].length).toEqual(0);

  expect(mockExpandPlaceholder.mock.calls.length).toBe(2);
  expect(mockExpandPlaceholder.mock.calls[0][1].length).toEqual(0);
  expect(mockExpandPlaceholder.mock.calls[1][1].length).toEqual(1);

  expect(mockExpandPlaceholder.mock.calls[1][1][0].searchFor.key).toEqual("a");
});

it("Render", async () => {
  let html = { innerHTML: '<div>hello {key:"value"}</div>' };
  await render(html as any);
  expect(html.innerHTML).toEqual("<div>hello value</div>");

  html.innerHTML = '<div>hello {key:"definition"}{key2:"placeholder"}</div>';
  await render(html as any);
  expect(html.innerHTML).toEqual("<div>hello definitionplaceholder</div>");
});
