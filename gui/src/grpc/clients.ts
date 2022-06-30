import { createChannel, createClient } from 'nice-grpc-web';
import { ContractsServiceClient, ContractsServiceDefinition } from './generated/contracts';

export const contractsClient = (): ContractsServiceClient => createClient(ContractsServiceDefinition, createChannel(''));
