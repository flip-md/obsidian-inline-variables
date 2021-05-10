import CursorTracker from "../helper/cursorTracker";
import NewPlaceholder from "../helper/variables/newPlaceholder";
import Config from "../helper/config";
import { mocked } from "ts-jest/utils";
jest.mock("../helper/config");

beforeEach(() => {
  mocked(Config.getInstance).mockImplementation(() => {
    return {
      getSettings: () => {
        return {
          startString: "{",
          endString: "}",
          valueEncapsulationString: '"',
          separatorDefinition: "::",
          separatorPlaceholder: ":",
        };
      },
    } as any;
  });
});

it("Jump to end of expand", () => {
  let cursorTracker = new CursorTracker(2);
  cursorTracker.addText(
    new NewPlaceholder("test"),
    '{test:"testvalue}123123',
    "{test}123123"
  );

  expect(cursorTracker.offset).toEqual(15);

  cursorTracker = new CursorTracker(4);
  cursorTracker.addText(
    new NewPlaceholder("test"),
    '123{test:"testvalue}123123',
    "123{test}123123"
  );

  expect(cursorTracker.offset).toEqual(16);

  cursorTracker = new CursorTracker(9);
  cursorTracker.addText(
    new NewPlaceholder("test"),
    '123{test:"testvalue}123123',
    "123{test}123123"
  );

  expect(cursorTracker.offset).toEqual(11);
});

it("Do not jump to end of expand", () => {
  let cursorTracker = new CursorTracker(9);
  cursorTracker.addText(
    new NewPlaceholder("test"),
    '123{test:"testvalue}123123',
    "123{test}123123"
  );

  expect(cursorTracker.offset).toEqual(11);
});
