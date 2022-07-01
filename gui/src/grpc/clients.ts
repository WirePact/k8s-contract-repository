import { createChannel, createClient } from 'nice-grpc-web';
import { ContractsServiceClient, ContractsServiceDefinition } from './generated/contracts';
import { PkiServiceClient, PkiServiceDefinition } from './generated/pki';

export const contractsClient = (): ContractsServiceClient => createClient(ContractsServiceDefinition, createChannel(''));

export const pkiClient = (host: string): PkiServiceClient => createClient(PkiServiceDefinition, createChannel(host));
