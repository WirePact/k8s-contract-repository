import { RouterLocation } from '@vaadin/router';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseElement } from '../base-element';
import { contractsClient } from '../grpc/clients';
import { Contract } from '../grpc/generated/contracts';

@customElement('page-detail')
export class Detail extends BaseElement {
  @property({ type: Object })
  private contract?: Contract;

  @property({ type: Object })
  private location!: RouterLocation;

  private client = contractsClient();

  @state()
  private showDeleteDialog = false;

  private get contractId() {
    return this.location.params.id.toString();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchData();
  }

  protected render() {
    return html`
      <app-back class="block mb-2"></app-back>
      <div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-8">
        <h3 class="text-lg leading-6 font-medium">${this.contractId}</h3>
        <div class="mt-3 sm:mt-0 sm:ml-4">
          <button
            @click=${() => (this.showDeleteDialog = true)}
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      ${this.contract
        ? this.contract.participants.map(
            (participant) =>
              html`<app-participant-card class="block mb-8" .participant=${participant}></app-participant-card>`
          )
        : html`<div class="text-center"><app-spinner></app-spinner></div>`}
      <div>${this.showDeleteDialog}</div>
      <app-modal
        .show=${this.showDeleteDialog}
        @close=${(e: any) => {
          console.log(e);
          this.showDeleteDialog = false;
        }}
        >TEST</app-modal
      >
    `;
  }

  private async fetchData(): Promise<void> {
    this.contract = await this.client.get({ id: this.contractId });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-detail': Detail;
  }
}
