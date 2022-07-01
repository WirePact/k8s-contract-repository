import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';

@customElement('app-form-textarea')
export class FormTextArea extends BaseElement {
  @property()
  public label = '';

  @property()
  public value = '';

  @property()
  public placeholder = '';

  @property({ type: Number })
  public rows = 5;

  private inputId = `textarea-${Math.floor(Math.random() * 10000)}`;

  protected render() {
    return html`
      <div>
        ${this.label &&
        html`<label for="${this.inputId}" class="block text-sm font-medium text-gray-700">${this.label}</label>`}
        <div class="mt-1">
          <textarea
            name="${this.inputId}"
            id="${this.inputId}"
            .rows=${this.rows}
            .value=${this.value}
            @change=${(e: Event) =>
              this.dispatchEvent(new CustomEvent('change', { detail: (e.target as HTMLTextAreaElement)?.value ?? '' }))}
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="${this.placeholder}"
          ></textarea>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-form-textarea': FormTextArea;
  }
}
