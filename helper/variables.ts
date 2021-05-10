import { Parseable, Templatable } from "./variables/variable";

export function findKeyValue(text: string, variable: Parseable) {
  return variable.parse(text);
}

export function renderTemplate(value: string, variable: Templatable) {
  return variable.createTemplate(value);
}
/*
export function detectDefinition(text: string) {
  let regexDefinition = new RegexHelper(TemplateType.AnyDefinition);
  let regexSplit = new RegexHelper(TemplateType.Split);
  let result;
  let returnMap = new Map<string, string>();
  while ((result = regexDefinition.finder(text))) {
    // We found a definition, now extract the key and value
    let splitPosition = regexSplit.finder(result[0]).index;

    let key = result[0].substr(
      regexDefinition.startString.length,
      splitPosition - 1
    );

    let value = result[0].substr(
      splitPosition +
        regexDefinition.separatorString.length +
        regexDefinition.endString.length,
      result[0].length -
        splitPosition -
        regexDefinition.separatorString.length -
        regexDefinition.valueEncapsulationString.length * 2 -
        regexDefinition.endString.length
    );
    returnMap.set(key, value);
  }
  return returnMap;
}

export function detectPlaceholder(text: string, placeHolderKey: string) {
  let regexDefinition = new RegexHelper(
    TemplateType.Placeholder,
    placeHolderKey
  );
  let result;
  let returnMap = new Map<number, string>();
  while ((result = regexDefinition.finder(text))) {
    returnMap.set(result.index, result[0]);
  }

  return returnMap;
}
*/
