import { Parseable } from "./variables/variable";

export default class CursorTracker {
  startPosition: number;
  currentPosition: number;

  get offset() {
    return this.currentPosition - this.startPosition;
  }

  constructor(startPosition: number) {
    this.startPosition = startPosition;
    this.currentPosition = startPosition;
  }

  addText(variable: Parseable, newText: string, oldText: string) {
    variable.parse(oldText).forEach((find) => {
      this.currentPosition += Math.max(
        find.index + find.text.length - this.startPosition,
        0
      );
      this.currentPosition += newText.length - oldText?.length;
    });
  }
}
