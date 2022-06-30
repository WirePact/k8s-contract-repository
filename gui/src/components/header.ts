import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from '..';
import { BaseElement } from '../base-element';

@customElement('app-header')
export class Header extends BaseElement {
  protected render() {
    return html`<header class="bg-indigo-600">
      <nav class="max-w-4xl mx-auto" aria-label="Top">
        <div class="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div class="flex items-center">
            <a href=${router.urlForName('home')}>
              <span class="text-lg font-medium text-white hover:text-indigo-50">WirePact Contract Repository</span>
            </a>
            <div class="hidden ml-10 space-x-8 lg:block">
              <a href=${router.urlForName('home')} class="text-base font-light text-white hover:text-indigo-50">Overview</a>
              <a href=${router.urlForName('new')} class="text-base font-light text-white hover:text-indigo-50"
                >New Contract</a
              >
            </div>
          </div>
        </div>
      </nav>
    </header>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-header': Header;
  }
}
