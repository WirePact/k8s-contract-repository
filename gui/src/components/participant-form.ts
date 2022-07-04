import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseElement } from '../base-element';
import { DeepPartial, Participant } from '../grpc/generated/contracts';

@customElement('app-participant-form')
export class ParticipantForm extends BaseElement {
  @property({ type: Object })
  public participant: Participant = Participant.fromPartial({});

  protected render() {
    return html`
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <app-form-input
            label="PKI Name"
            placeholder="Cluster A"
            .value=${this.participant.name}
            @change=${(e: CustomEvent<string>) => this.updateParticipant({ name: e.detail })}
          ></app-form-input>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6 font-mono">
          <app-form-textarea
            label="Public Certificate"
            placeholder="--- BEGIN Certificate --- ..."
            .value=${new TextDecoder().decode(this.participant.publicKey)}
            @change=${(e: CustomEvent<string>) => this.updateParticipant({ publicKey: new TextEncoder().encode(e.detail) })}
          ></app-form-textarea>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6">
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('remove'))}
            class="bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    `;
  }

  private updateParticipant(data: DeepPartial<Participant>) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: Participant.fromPartial({
          ...this.participant,
          ...data,
        }),
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-participant-form': ParticipantForm;
  }
}
