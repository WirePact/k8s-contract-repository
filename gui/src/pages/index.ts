import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from '..';
import { BaseElement } from '../base-element';
import { contractsClient } from '../grpc/clients';
import { Contract } from '../grpc/generated/contracts';

@customElement('page-index')
export class Index extends BaseElement {
  @property({ type: Array })
  private contracts: Contract[] = [];

  private client = contractsClient();

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchData();
  }

  protected render() {
    return html`<div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-8">
        <h3 class="text-lg leading-6 font-medium">Available Contracts</h3>
        <div class="mt-3 sm:mt-0 sm:ml-4">
          <a
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            href=${router.urlForName('new')}
          >
            New Contract
          </a>
        </div>
      </div>
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Participants</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"></th>
            </tr>
          </thead>
          <tbody class="bg-white">
            ${this.contracts.map(
              ({ id, participants }, i) => html`<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">${id}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <ul>
                    ${participants.map(({ name }) => html`<li>${name}</li>`)}
                  </ul>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <a href="${router.urlForName('detail', { id })}" class="text-indigo-600 hover:text-indigo-900">Details</a>
                </td>
              </tr>`
            )}
          </tbody>
        </table>
      </div>`;
  }

  private async _fetchData(): Promise<void> {
    const { contracts } = await this.client.list({});
    this.contracts = contracts;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-index': Index;
  }
}
