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
            @click=${() => this.dispatchEvent(new CustomEvent('close'))}
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

@customElement('app-confirm-modal')
export class ConfirmModal extends BaseElement {
  @property({ type: Boolean })
  public show = false;

  @property({ type: Boolean })
  public destructive = false;

  private get buttonColor() {
    return this.destructive
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
  }

  protected render() {
    return html`
      <app-modal .show=${this.show} @close=${() => this.dispatchEvent(new CustomEvent('close', { detail: false }))}>
        <slot></slot>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6">
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('close', { detail: true }))}
            class="${this
              .buttonColor} w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ${this.destructive ? 'Delete' : 'Confirm'}
          </button>
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('close', { detail: false }))}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </app-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-modal': Modal;
    'app-confirm-modal': ConfirmModal;
  }
}
