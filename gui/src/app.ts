import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseElement } from './base-element';

@customElement('root-app')
export class App extends BaseElement {
  protected render() {
    return html`
      <app-header></app-header>
      <main class="mt-8 max-w-4xl mx-auto">
        <slot></slot>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'root-app': App;
  }
}
