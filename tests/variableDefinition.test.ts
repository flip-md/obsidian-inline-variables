import Config from "../helper/config";
import AnyDefinition from "../helper/variables/anyDefinition";
import Definition from "../helper/variables/definition";
import Placeholder from "../helper/variables/placeholder";
import NewPlaceholder from "../helper/variables/newPlaceholder";
import AnyPlaceholder from "../helper/variables/anyPlaceholder";
import { mocked } from "ts-jest/utils";

jest.mock("../helper/config");

beforeEach(() => {
  mocked(Config.getInstance).mockClear();
  mocked(Config.getInstance).mockImplementation(() => {
    return {
      getSettings: () => {
        return {
          startString: "{!!!",
          endString: "!@}",
          valueEncapsulationString: '"',
          separatorDefinition: "%%",
          separatorPlaceholder: "%",
        };
      },
    } as any;
  });
});

it("AnyDefinition", () => {
  let anyDefinition = new AnyDefinition();
  anyDefinition.config = {};
  expect(anyDefinition.regex).toEqual(
    /{!!!(?:(?!%%|{!!!).)+%%"(?:(?!"!@}).)+"!@}/gm
  );
  let result = anyDefinition.parse('{!!!key%%"value"!@} bla');
  expect(result.length).toBe(1);
  expect(result[0].index).toBe(0);
  expect(result[0].key).toBe("key");
  expect(result[0].value).toBe("value");

  expect(anyDefinition.parse('{!!!k%%ey%%"value"!@} bla').length).toBe(0);
});

it("Definition", () => {
  let definition = new Definition("key");
  expect(definition.regex).toEqual(/{!!!key%%"(?:(?!"!@}).)+"!@}/gm);
  let result = definition.parse('{!!!key%%"value"!@} bla');
  expect(result.length).toBe(1);
  expect(result[0].index).toBe(0);
  expect(result[0].key).toBe("key");
  expect(result[0].value).toBe("value");

  expect(definition.parse('{!!!k%%ey%%"value"!@} bla').length).toBe(0);
  expect(definition.parse('{!!!otherkey%%"value"!@} bla').length).toBe(0);
});

it("Placeholder", () => {
  let placeholder = new Placeholder("key");
  expect(placeholder.regex).toEqual(/{!!!key%"(?:(?!"!@}).)+"!@}/gm);
  let result = placeholder.parse('{!!!key%"value"!@} bla');
  expect(result.length).toBe(1);
  expect(result[0].index).toBe(0);
  expect(result[0].key).toBe("key");
  expect(result[0].value).toBe("value");

  expect(placeholder.parse('{!!!k%%ey%%"value"!@} bla').length).toBe(0);
  expect(placeholder.parse('{!!!otherkey%%"value"!@} bla').length).toBe(0);

  expect(placeholder.createTemplate("newvalue")).toBe('{!!!key%"newvalue"!@}');
});

it("Any Placeholder", () => {
  let placeholder = new AnyPlaceholder();
  expect(placeholder.regex).toEqual(
    /{!!!(?:(?!%|{!!!).)+%"(?:(?!"!@}).)+"!@}/gm
  );
  let result = placeholder.parse(' {!!!key%"value"!@} bla');
  expect(result.length).toBe(1);
  expect(result[0].index).toBe(1);
  expect(result[0].key).toBe("key");
  expect(result[0].value).toBe("value");

  expect(placeholder.parse('{!!!k%%ey%%"value"!@} bla').length).toBe(0);
});

it("NewPlaceholder", () => {
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
  let placeholder = new NewPlaceholder();
  expect(placeholder.regex).toEqual(/{(?:(?!:|{|}).)+}/gm);
  let result = placeholder.parse("xx{key} bla");
  expect(result.length).toBe(1);
  expect(result[0].index).toBe(2);

  expect(result[0].key).toBe("key");
  expect(result[0].value).toBeNull;
});

it("NewPlaceholder with key", () => {
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
  let placeholder = new NewPlaceholder("key");
  let result = placeholder.parse("xx{key} bla");
  expect(placeholder.regex).toEqual(/{key}/gm);

  expect(result.length).toBe(1);
  expect(result[0].index).toBe(2);
  expect(result[0].key).toBe("key");
  expect(result[0].value).toBeNull;

  placeholder = new NewPlaceholder("key");
  result = placeholder.parse("xx{newkey} bla");

  expect(result.length).toBe(0);
});
