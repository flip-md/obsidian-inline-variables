import { Parseable, Templatable, ParseResult, Variable } from "./variable";

export default class Placeholder
  extends Variable
  implements Parseable, Templatable {
  regexSplit = new RegExp(`${this.config.separatorPlaceholder}`);

  constructor(key: string) {
    super();
    this.key = key;
    this.separatorString = this.config.separatorPlaceholder;
    this.regex = new RegExp(
      `${this.startString}${key}${this.separatorString}${this.valueEncapsulationString}(?:(?!${this.valueEncapsulationString}${this.endString}).)+${this.valueEncapsulationString}${this.endString}`,
      "gm"
    );
  }
  createTemplate(value: string) {
    return `${this.startString}${this.key}${this.separatorString}${this.valueEncapsulationString}${value}${this.valueEncapsulationString}${this.endString}`;
  }

  parse(text: string) {
    let result;
    let returnList = new Array<ParseResult>();
    while ((result = this.find(text))) {
      // We found a definition, now extract the key and value
      let splitPosition = this.regexSplit.exec(result[0]).index;

      let key = result[0].substr(
        this.startString.length,
        splitPosition - this.startString.length
      );

      let value = result[0].substr(
        splitPosition +
          this.separatorString.length +
          this.valueEncapsulationString.length,
        result[0].length -
          splitPosition -
          this.separatorString.length -
          this.valueEncapsulationString.length * 2 -
          this.endString.length
      );

      returnList.push(new ParseResult(result.index, key, value, result[0]));
    }
    return returnList;
  }
}
