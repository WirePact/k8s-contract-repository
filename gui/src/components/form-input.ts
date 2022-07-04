import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';

type FormType =
  | 'hidden'
  | 'text'
  | 'search'
  | 'tel'
  | 'url'
  | 'email'
  | 'password'
  | 'datetime'
  | 'date'
  | 'month'
  | 'week'
  | 'time'
  | 'datetime-local'
  | 'number'
  | 'range'
  | 'color'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'submit'
  | 'image'
  | 'reset'
  | 'button';

@customElement('app-form-input')
export class FormInput extends BaseElement {
  @property()
  public type: FormType = 'text';

  @property()
  public label = '';

  @property()
  public value = '';

  @property()
  public placeholder = '';

  private inputId = `input-${Math.floor(Math.random() * 10000)}`;

  protected render() {
    return html`
      <div>
        ${this.label &&
        html`<label for="${this.inputId}" class="block text-sm font-medium text-gray-700">${this.label}</label>`}
        <div class="mt-1">
          <input
            type="${this.type}"
            name="${this.inputId}"
            id="${this.inputId}"
            .value=${this.value}
            @change=${(e: Event) =>
              this.dispatchEvent(new CustomEvent('change', { detail: (e.target as HTMLInputElement)?.value ?? '' }))}
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
            placeholder="${this.placeholder}"
          />
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-form-input': FormInput;
  }
}
