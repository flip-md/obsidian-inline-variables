import { Parseable, Templatable } from "./variables/variable";

export class ReplaceResult {
  text: string;
  changed: boolean;

  constructor(text: string, changed: boolean) {
    this.text = text;
    this.changed = changed;
  }
}

export class Replacer {
  searchFor: Parseable;
  replaceWith: Templatable;
  newValue: string;

  constructor(
    searchFor: Parseable,
    replaceWith: Templatable,
    newValue: string
  ) {
    this.searchFor = searchFor;
    this.replaceWith = replaceWith;
    this.newValue = newValue;
  }

  replace(replaceText: string) {
    let changed = false;

    if (this.searchFor.regex.exec(replaceText)) {
      changed = true;
      // Change text in current line if definition has changed for placeholders present
      replaceText = replaceText.replace(
        this.searchFor.regex,
        this.replaceWith.createTemplate(this.newValue)
      );
    }

    return new ReplaceResult(replaceText, changed);
  }
}
