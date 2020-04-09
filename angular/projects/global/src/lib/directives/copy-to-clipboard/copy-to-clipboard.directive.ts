import { Directive, Input, HostListener } from '@angular/core';

/**
 * Adds copy-to-clipboard functionality to the target element click event.
 *
 * Example:
 *  <button [libCopyToClipboard]="'text to copy'">Copy 'text to copy' to clipboard<button>
 *
 * @export
 * @class CopyToClipboardDirective
 * @implements {OnInit}
 */
@Directive({
  selector: '[libCopyToClipboard]'
})
export class CopyToClipboardDirective {
  @Input('libCopyToClipboard') copyString: string;

  /**
   * Adds a listener for click events:
   * - Adds an invisible <textarea>
   * - Adds the copy string to it
   * - Executes a copy command on its content
   * - Removes the <textarea>.
   *
   * @memberof CopyToClipboardDirective
   */
  @HostListener('click') onClick() {
    const textBox = document.createElement('textarea');
    textBox.style.position = 'fixed';
    textBox.style.left = '0';
    textBox.style.top = '0';
    textBox.style.opacity = '0';
    textBox.value = this.copyString;
    document.body.appendChild(textBox);
    textBox.focus();
    textBox.select();
    document.execCommand('copy');
    document.body.removeChild(textBox);
  }
}
