import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directive that prevents non-digit characters from being entered into the applied field.
 *
 * @export
 * @class DigitOnlyDirective
 */
@Directive({
  selector: '[libDigitOnly]'
})
export class DigitOnlyDirective {
  /**
   * Enable or disable this directive.
   *
   * @memberof DigitOnlyDirective
   */
  @Input('libDigitOnly') enabled = true;
  /**
   * True if 1 decimal is allowed, false if none are allowed.
   *
   * @memberof DigitOnlyDirective
   */
  @Input() decimal = true;
  /**
   * Dictates which style of decimal is used.
   *
   * IE: period vs comma
   *
   * @memberof DigitOnlyDirective
   */
  @Input() decimalSeparator = '.';

  private decimalCounter = 0;
  private navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste'
  ];

  inputElement: HTMLInputElement;

  constructor(public el: ElementRef) {
    this.inputElement = el.nativeElement;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.enabled) {
      return event;
    }

    if (
      this.navigationKeys.indexOf(event.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
      (event.key === 'a' && event.ctrlKey === true) || // Allow: Ctrl+A
      (event.key === 'c' && event.ctrlKey === true) || // Allow: Ctrl+C
      (event.key === 'v' && event.ctrlKey === true) || // Allow: Ctrl+V
      (event.key === 'x' && event.ctrlKey === true) || // Allow: Ctrl+X
      (event.key === 'a' && event.metaKey === true) || // Allow: Cmd+A (Mac)
      (event.key === 'c' && event.metaKey === true) || // Allow: Cmd+C (Mac)
      (event.key === 'v' && event.metaKey === true) || // Allow: Cmd+V (Mac)
      (event.key === 'x' && event.metaKey === true) || // Allow: Cmd+X (Mac)
      (this.decimal && event.key === this.decimalSeparator && this.decimalCounter < 1) // Allow: only one decimal point
    ) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if (event.key === ' ' || isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!this.enabled) {
      return event;
    }

    if (!this.decimal) {
      return;
    } else {
      this.decimalCounter = this.el.nativeElement.value.split(this.decimalSeparator).length - 1;
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.enabled) {
      return event;
    }

    const pastedInput: string = event.clipboardData.getData('text/plain');
    this.pasteData(pastedInput);
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (!this.enabled) {
      return event;
    }

    const textData = event.dataTransfer.getData('text');
    this.inputElement.focus();
    this.pasteData(textData);
    event.preventDefault();
  }

  private pasteData(pastedContent: string): void {
    const sanitizedContent = this.sanatizeInput(pastedContent);
    const pasted = document.execCommand('insertText', false, sanitizedContent);
    if (!pasted) {
      const { selectionStart: start, selectionEnd: end } = this.inputElement;
      this.inputElement.setRangeText(sanitizedContent, start, end, 'end');
    }
  }

  private sanatizeInput(input: string): string {
    let result = '';
    if (this.decimal && this.isValidDecimal(input)) {
      const regex = new RegExp(`[^0-9${this.decimalSeparator}]`, 'g');
      result = input.replace(regex, '');
    } else {
      result = input.replace(/[^0-9]/g, '');
    }

    const maxLength = this.inputElement.maxLength;
    if (maxLength > 0) {
      // the input element has maxLength limit
      const allowedLength = maxLength - this.inputElement.value.length;
      result = allowedLength > 0 ? result.substring(0, allowedLength) : '';
    }
    return result;
  }

  private isValidDecimal(str: string): boolean {
    return str.split(this.decimalSeparator).length <= 2;
  }
}
