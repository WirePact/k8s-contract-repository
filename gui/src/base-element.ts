import { LitElement } from 'lit';

export class BaseElement extends LitElement {
  protected createRenderRoot(): Element | ShadowRoot {
    let root = this.attachShadow({ mode: 'open' });
    const links = document.head.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      const link = links.item(i);
      if (!link || link.rel !== 'stylesheet') {
        continue;
      }
      root.appendChild(link.cloneNode(true));
    }
    return root;
  }
}
