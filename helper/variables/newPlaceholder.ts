import { Parseable, ParseResult, Templatable, Variable } from "./variable";

export default class NewPlaceholder
  extends Variable
  implements Parseable, Templatable {
  regexSplit = new RegExp(`${this.config.separatorPlaceholder}`);

  key?: string;

  constructor(key?: string) {
    super();
    this.key = key;
    this.separatorString = this.config.separatorPlaceholder;
    if (key) {
      this.regex = new RegExp(
        `${this.startString}${key}${this.endString}`,
        "gm"
      );
    } else {
      this.regex = new RegExp(
        `${this.startString}(?:(?!${this.config.separatorPlaceholder}|${this.startString}|${this.endString}).)+${this.endString}`,
        "gm"
      );
    }
  }

  createTemplate(value?: string): string {
    if (value) {
      return `${this.startString}${value}${this.endString}`;
    } else {
      return `${this.startString}${this.key}${this.endString}`;
    }
  }

  parse(text: string) {
    let result;
    let returnList = new Array<ParseResult>();
    while ((result = this.find(text))) {
      let key = result[0].substr(
        this.startString.length,
        result[0].length - this.startString.length - this.endString.length
      );

      let value = null;

      returnList.push(new ParseResult(result.index, key, value, result[0]));
    }
    return returnList;
  }
}
