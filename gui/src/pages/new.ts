import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';
import { Contract } from '../grpc/generated/contracts';

@customElement('page-new')
export class New extends BaseElement {
  protected render() {
    return html`<div>Hello World NEW</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-new': New;
  }
}
