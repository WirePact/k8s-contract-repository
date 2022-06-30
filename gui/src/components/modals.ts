import { animate } from '@lit-labs/motion';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';

@customElement('app-modal')
export class Modal extends BaseElement {
  @property({ type: Boolean })
  public show = false;

  protected render() {
    return html`
      <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 duration-300 ease-in-out ${this.show
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'} "
          ${animate({
            properties: ['opacity', 'visibility'],
          })}
        ></div>
        <div
          class="fixed z-10 inset-0 overflow-y-auto ${this.show
            ? 'opacity-100 visible scale-100 translate-x-0'
            : 'opacity-0 invisible scale-95 translate-x-4'}"
          ${animate({
            properties: ['opacity', 'visibility', 'transform'],
          })}
        >
          <div
            class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0"
            @click=${() => this.dispatchEvent(new CustomEvent('close', { detail: null }))}
          >
            <div
              class="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6"
              @click=${(e: MouseEvent) => e.stopPropagation()}
            >
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

@customElement('app-delete-confirm-modal')
export class DeleteConfirmModal extends BaseElement {
  protected render() {
    return html` <app-modal> DELETE </app-modal> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-modal': Modal;
    'app-delete-confirm-modal': DeleteConfirmModal;
  }
}
