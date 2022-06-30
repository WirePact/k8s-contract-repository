import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';
import { Participant } from '../grpc/generated/contracts';

@customElement('app-participant-card')
export class ParticipantCard extends BaseElement {
  @property({ type: Object })
  public participant: Participant = Participant.fromPartial({});

  protected render() {
    return html`
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">${this.participant.name}</h3>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Certificate Digest (SHA-256 Hash)</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">${this.participant.hash}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Public Certificate</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono whitespace-pre-line">
                ${new TextDecoder('utf-8').decode(this.participant.publicKey).trim()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-participant-card': ParticipantCard;
  }
}
