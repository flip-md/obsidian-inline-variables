import { Parseable, ParseResult, Variable } from "./variable";

export default class AnyDefinition extends Variable implements Parseable {
  regexSplit = new RegExp(`${this.config.separatorDefinition}`);

  constructor() {
    super();
    this.separatorString = this.config.separatorDefinition;
    this.regex = new RegExp(
      `${this.startString}(?:(?!${this.separatorString}|${this.startString}).)+${this.separatorString}${this.valueEncapsulationString}(?:(?!${this.valueEncapsulationString}${this.endString}).)+${this.valueEncapsulationString}${this.endString}`,
      "gm"
    );
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
