import { Directive, OnInit, ElementRef, HostListener, Renderer2, Input } from '@angular/core';
import { Utils } from '../../utils/utils';

/**
 * Enhances a <textarea>, allowing it to automatically increase/decrease its 'rows' attribute based on the size of its
 * content.
 *
 * Example:
 *  <textarea libAutoGrowTextArea minRows="1" maxRows="5" rows="2"><textarea>
 *
 * @export
 * @class RecordDetailDirective
 * @implements {OnInit}
 */

@Directive({
  standalone: false,
  selector: '[libAutoGrowTextArea]'
})
export class AutoGrowTextAreaDirective implements OnInit {
  @Input() minRows = 1;
  @Input() maxRows = 5;

  private textarea: HTMLTextAreaElement;
  private renderer: Renderer2;
  private utils: Utils;

  private throttledUpdateRows;

  constructor(elementRef: ElementRef<HTMLTextAreaElement>, renderer: Renderer2, utils: Utils) {
    this.textarea = elementRef.nativeElement;
    this.renderer = renderer;
    this.utils = utils;

    this.throttledUpdateRows = this.utils.throttled(150, () =>
      this.updateRows(this.textarea, this.minRows, this.maxRows)
    );
  }

  ngOnInit() {
    this.throttledUpdateRows();
  }

  @HostListener('keyup') onkeyUp() {
    this.throttledUpdateRows();
  }

  /**
   * Update the textarea rows.
   * - Decrease until the client height is minimally larger than scroll height
   * - Increase until the client height is minimally larger than scroll height
   *
   * @memberof AutoGrowDirective
   */
  updateRows(textarea, minRows, maxRows) {
    while (textarea.rows > minRows && textarea.clientHeight >= textarea.scrollHeight) {
      this.decreaseRows(textarea);
    }

    while (textarea.rows < maxRows && textarea.clientHeight < textarea.scrollHeight) {
      this.increaseRows(textarea);
    }
  }

  /**
   * Decrease textarea 'rows' attribute.
   *
   * @param {HTMLTextAreaElement} textarea
   * @memberof AutoGrowTextAreaDirective
   */
  decreaseRows(textarea: HTMLTextAreaElement) {
    const rows = Math.max(textarea.rows - 1, this.minRows);
    this.renderer.setAttribute(textarea, 'rows', rows.toString());
  }

  /**
   * Increase textarea 'rows' attribute.
   *
   * @param {HTMLTextAreaElement} textarea
   * @memberof AutoGrowTextAreaDirective
   */
  increaseRows(textarea: HTMLTextAreaElement) {
    const rows = Math.min(textarea.rows + 1, this.maxRows);
    this.renderer.setAttribute(textarea, 'rows', rows.toString());
  }
}
