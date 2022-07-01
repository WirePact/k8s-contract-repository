import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseElement } from '../base-element';
import { Participant } from '../grpc/generated/contracts';

@customElement('page-new')
export class New extends BaseElement {
  @state()
  private participants: Participant[] = [];

  protected render() {
    return html`
      <app-back class="block mb-2"></app-back>
      <div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-8">
        <h3 class="text-lg leading-6 font-medium">Create New Contract</h3>
      </div>
      <div class="text-center mb-8">
        <button
          type="button"
          @click=${() => this.addParticipant()}
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add PKI manually
        </button>
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add PKI via API
        </button>
      </div>
      <ul>
        ${this.participants.map(
          (p, i) => html`
            <li class="mb-4">
              <app-participant-form
                .participant=${p}
                @change=${(e: CustomEvent<Participant>) => this.updateParticipant(i, e.detail)}
                @remove=${() => this.removeParticipant(i)}
              ></app-participant-form>
            </li>
          `
        )}
      </ul>
      <div class="text-right my-6">
        <button
          type="button"
          .disabled=${this.participants.length < 2 ||
          this.participants.some((p) => p.name.length === 0 || p.publicKey.length === 0)}
          class="inline-flex transition-colors items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Save
        </button>
      </div>
    `;
  }

  private addParticipant(pubKey?: string) {
    const publicKey = new TextEncoder().encode(pubKey);
    this.participants = [...this.participants, Participant.fromPartial({ publicKey })];
  }

  private updateParticipant(index: number, participant: Participant) {
    this.participants = [...this.participants.slice(0, index), participant, ...this.participants.slice(index + 1)];
  }

  private removeParticipant(index: number) {
    this.participants = [...this.participants.slice(0, index), ...this.participants.slice(index + 1)];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-new': New;
  }
}
