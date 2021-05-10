import { Replacer } from "../helper/replacer";
import Config from "../helper/config";
import { mocked } from "ts-jest/utils";
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
          separatorDefinition: "::",
          separatorPlaceholder: ":",
        };
      },
    } as any;
  });
});

it("Replace n values", () => {
  let replacer = new Replacer(
    new Placeholder("key"),
    new Placeholder("key"),
    "newValue"
  );
  let replacerResult = replacer.replace('hello {key:"value"} test');
  expect(replacerResult.changed).toEqual(true);
  expect(replacerResult.text).toEqual('hello {key:"newValue"} test');

  replacer = new Replacer(
    new Placeholder("key"),
    new Placeholder("key"),
    "newValue"
  );
  replacerResult = replacer.replace(
    'hello {key:"value"} test {key:"anothervalue"}'
  );
  expect(replacerResult.changed).toEqual(true);
  expect(replacerResult.text).toEqual(
    'hello {key:"newValue"} test {key:"newValue"}'
  );
});

it("Do not replace", () => {
  let replacer = new Replacer(
    new Placeholder("key"),
    new Placeholder("key"),
    "newValue"
  );
  let replacerResult = replacer.replace('hello {anotherkey:"value"} test');

  expect(replacerResult.changed).toEqual(false);
  expect(replacerResult.text).toEqual('hello {anotherkey:"value"} test');

  replacer = new Replacer(
    new NewPlaceholder("key"),
    new Placeholder("key"),
    "newValue"
  );
  replacerResult = replacer.replace('hello {key:"value"} test');

  expect(replacerResult.changed).toEqual(false);
  expect(replacerResult.text).toEqual('hello {key:"value"} test');
});

it("Expand placeholder", () => {
  let replacer = new Replacer(
    new NewPlaceholder("key"),
    new Placeholder("key"),
    "newValue"
  );
  let replacerResult = replacer.replace("hello {key} test");

  expect(replacerResult.changed).toEqual(true);
  expect(replacerResult.text).toEqual('hello {key:"newValue"} test');
});
