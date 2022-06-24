use std::sync::Arc;

use log::debug;
use tonic::{Request, Response, Status};

use crate::grpc::contracts::GetRequest;
use crate::storage::{Storage, StorageError};

use crate::grpc::contracts::{
    contracts_service_server::ContractsServiceServer, Contract, CreateRequest, DeleteRequest,
    Empty, GetCertificatesRequest, GetCertificatesResponse, ListRequest, ListResponse,
};
use crate::utils::participant_hash;

pub(crate) struct ContractsService {
    storage: Arc<dyn Storage>,
}

impl ContractsService {
    pub(crate) fn grpc_service(
        storage: Arc<dyn Storage>,
    ) -> ContractsServiceServer<ContractsService> {
        ContractsServiceServer::new(Self { storage })
    }
}

#[tonic::async_trait]
impl crate::grpc::contracts::contracts_service_server::ContractsService for ContractsService {
    async fn list(&self, _: Request<ListRequest>) -> Result<Response<ListResponse>, Status> {
        debug!("Fetch list of all contracts for client");
        let contracts = self
            .storage
            .all()
            .await
            .map_err(|e| Status::internal(format!("Internal server error: {}", e)))?;

        Ok(Response::new(ListResponse { contracts }))
    }

    async fn get(&self, request: Request<GetRequest>) -> Result<Response<Contract>, Status> {
        let id = request.into_inner().id;
        debug!("Fetch contract with id {} for client", &id);
        let contract = self
            .storage
            .get(&id)
            .await
            .map_err(|e| Status::internal(format!("Internal server error: {}", e)))?;

        Ok(Response::new(contract))
    }

    async fn create(&self, request: Request<CreateRequest>) -> Result<Response<Contract>, Status> {
        debug!("Create new contract.");
        let contract = self
            .storage
            .create_contract(&request.into_inner().participants)
            .await
            .map_err(|e| match e {
                StorageError::ContractAlreadyExists { id: _ } => {
                    Status::already_exists("Contract already exists.".to_string())
                }
                _ => Status::internal(format!("Internal server error: {}", e)),
            })?;

        Ok(Response::new(contract))
    }

    async fn delete(&self, request: Request<DeleteRequest>) -> Result<Response<Empty>, Status> {
        debug!("Delete contract.");

        self.storage
            .delete_contract(&request.into_inner().id)
            .await
            .map_err(|e| match e {
                StorageError::NotFound { id: _ } => {
                    Status::not_found("Contract not found.".to_string())
                }
                _ => Status::internal(format!("Internal server error: {}", e)),
            })?;

        Ok(Response::new(Empty {}))
    }

    async fn get_certificates(
        &self,
        request: Request<GetCertificatesRequest>,
    ) -> Result<Response<GetCertificatesResponse>, Status> {
        debug!("Create Certificate Chain for client.");
        let participant_hash = participant_hash(&request.into_inner().public_key).map_err(|e| {
            Status::failed_precondition(format!("Provided public key is not valid: {}", e))
        })?;
        let certificates = self
            .storage
            .involved_participants(&participant_hash)
            .await
            .map_err(|e| Status::internal(format!("Internal server error: {}", e)))?
            .iter()
            .map(|p| p.public_key.clone())
            .collect::<Vec<Vec<u8>>>();

        Ok(Response::new(GetCertificatesResponse { certificates }))
    }
}
