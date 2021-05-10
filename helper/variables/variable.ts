import Config from "../config";

export abstract class Variable implements Regexable {
  startString: string;
  endString: string;
  valueEncapsulationString: string;
  separatorString: string;

  key?: string;
  value?: string;

  config = Config.getInstance().getSettings();

  constructor() {
    this.startString = this.config.startString;
    this.endString = this.config.endString;
    this.valueEncapsulationString = this.config.valueEncapsulationString;
  }
  regex: RegExp;

  find(text: string) {
    return this.regex.exec(text);
  }
}

export interface Regexable {
  regex: RegExp;
}

export interface Templatable extends Regexable {
  createTemplate(value: string): string;
}

export interface Parseable extends Regexable {
  parse(text: string): Array<ParseResult>;
}

export class ParseResult {
  index: number;
  key: string;
  value: string;
  text: string;

  constructor(index: number, key: string, value: string, text: string) {
    this.index = index;
    this.key = key;
    this.value = value;
    this.text = text;
  }
}
