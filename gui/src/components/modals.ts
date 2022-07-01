import { animate } from '@lit-labs/motion';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ClientError, Metadata, Status } from 'nice-grpc-common';
import { BaseElement } from '../base-element';
import { pkiClient } from '../grpc/clients';

@customElement('app-modal')
export class Modal extends BaseElement {
  @property({ type: Boolean })
  public show = false;

  protected render() {
    return html`
      <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 duration-300 ease-in-out ${this.show
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'} "
          ${animate({
            properties: ['opacity', 'visibility'],
          })}
        ></div>
        <div
          class="fixed z-10 inset-0 overflow-y-auto ${this.show
            ? 'opacity-100 visible scale-100 translate-x-0'
            : 'opacity-0 invisible scale-95 translate-x-4'}"
          ${animate({
            properties: ['opacity', 'visibility', 'transform'],
          })}
        >
          <div
            class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0"
            @click=${() => this.dispatchEvent(new CustomEvent('close'))}
          >
            <div
              class="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6"
              @click=${(e: MouseEvent) => e.stopPropagation()}
            >
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

@customElement('app-confirm-modal')
export class ConfirmModal extends BaseElement {
  @property({ type: Boolean })
  public show = false;

  @property({ type: Boolean })
  public destructive = false;

  private get buttonColor() {
    return this.destructive
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
  }

  protected render() {
    return html`
      <app-modal .show=${this.show} @close=${() => this.dispatchEvent(new CustomEvent('close', { detail: false }))}>
        <slot></slot>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6">
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('close', { detail: true }))}
            class="${this
              .buttonColor} w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ${this.destructive ? 'Delete' : 'Confirm'}
          </button>
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('close', { detail: false }))}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </app-modal>
    `;
  }
}

@customElement('app-load-cert-modal')
export class LoadCertificateModal extends BaseElement {
  @property({ type: Boolean })
  public show = false;

  @state()
  private isLoading = false;

  @state()
  private host = '';

  @state()
  private apiKey = '';

  @state()
  private error?: ClientError;

  protected render() {
    return html`
      <app-modal .show=${this.show} @close=${() => this.dispatchEvent(new CustomEvent('close'))}>
        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Fetch Certificate from PKI</h3>
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            Please fill the PKI host (e.g. http://foobar.com) and the optional API key of the PKI you want to fetch the
            certificate for. <span class="font-bold">NOTE:</span> the PKI must be publicly accessible.
          </p>
        </div>
        <div class="mt-2">
          <app-form-input
            label="PKI Host*"
            placeholder="http://localhost:8080/"
            .value=${this.host}
            @change=${(e: CustomEvent<string>) => (this.host = e.detail)}
          ></app-form-input>
        </div>
        <div class="mt-4">
          <app-form-input
            label="API Key"
            placeholder="super-secure-key"
            type="password"
            .value=${this.apiKey}
            @change=${(e: CustomEvent<string>) => (this.apiKey = e.detail)}
          ></app-form-input>
        </div>
        ${this.error
          ? html`
              <div class="rounded-md bg-red-50 p-4 mt-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">There was an error during communication</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>${Status[this.error?.code]}</p>
                      <p>${this.error?.message} ${this.error?.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            `
          : null}
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-6">
          <app-loader-button .disabled=${!this.host} .loading=${this.isLoading} @click=${() => this.loadCertificate()}
            >Load Certificate</app-loader-button
          >
          <button
            type="button"
            @click=${() => this.dispatchEvent(new CustomEvent('close'))}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </app-modal>
    `;
  }

  private async loadCertificate() {
    try {
      this.isLoading = true;
      const client = pkiClient(this.host);
      const { certificate } = await client.getCA(
        {},
        {
          metadata: new Metadata({ authorization: this.apiKey }),
        }
      );
      this.error = undefined;
      this.host = '';
      this.apiKey = '';
      this.dispatchEvent(new CustomEvent('close', { detail: new TextDecoder().decode(certificate) }));
    } catch (err) {
      console.error(err);
      this.error = err as ClientError;
    } finally {
      this.isLoading = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-modal': Modal;
    'app-confirm-modal': ConfirmModal;
    'app-load-cert-modal': LoadCertificateModal;
  }
}
