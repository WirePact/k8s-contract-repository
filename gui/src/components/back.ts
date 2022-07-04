import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from '..';
import { BaseElement } from '../base-element';

@customElement('app-back')
export class Back extends BaseElement {
  @property()
  public link = router.urlForName('home');

  protected render() {
    return html`
      <a href=${this.link} class="flex text-sm items-center text-gray-600 hover:text-gray-900">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="pl-2">back</span>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-back': Back;
  }
}
