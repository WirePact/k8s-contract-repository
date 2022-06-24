use std::{collections::HashMap, sync::Arc};

use itertools::Itertools;
use log::info;

use crate::{
    grpc::contracts::{Contract, Participant},
    StorageAdapter,
};
use custom_error::custom_error;
mod kubernetes;
mod local;

custom_error! {pub(crate) StorageError
    NotFound{id: String} = "Contract with id '{id}' not found",
    ContractAlreadyExists{id: String} = "Contract with id '{id}' already exists",
    CouldNotCreate{err: String} = "Could not create storage adapter: {err}",
    StorageIO{err: String} = "An error occured during storage I/O: {err}",
    Conversion{err: String} = "An error occured during conversion: {err}",
}

#[tonic::async_trait]
pub(crate) trait Storage: Send + Sync {
    /// Return a list of all contracts in the storage.
    async fn all(&self) -> Result<Vec<Contract>, StorageError>;

    /// Fetch a specific contract from the storage.
    async fn get(&self, id: &str) -> Result<Contract, StorageError>;

    /// Create a new contract with the given participants.
    /// The participants map is a hash map where the keys are the "names" of
    /// participants and the values are the public keys of the certificates.
    async fn create_contract(
        &self,
        participants: &HashMap<String, Vec<u8>>,
    ) -> Result<Contract, StorageError>;

    /// Delete the contract with the given id.
    async fn delete_contract(&self, id: &str) -> Result<(), StorageError>;

    /// Fetch a list of all participants that are part of a contract of the given participant.
    /// The given public key is the search key to search for all contracts where the given
    /// participant is a part of. The returning list contains all participants of the
    /// origin.
    async fn involved_participants(
        &self,
        participant_hash: &str,
    ) -> Result<Vec<Participant>, StorageError> {
        let contracts = self.all().await?;
        Ok(contracts
            .iter()
            .filter(|c| c.participants.iter().any(|p| p.hash == participant_hash))
            .flat_map(|c| &c.participants)
            .unique_by(|p| &p.hash)
            .cloned()
            .collect::<Vec<Participant>>())
    }
}

pub(crate) async fn create_storage(
    adapter: StorageAdapter,
) -> Result<Arc<dyn Storage>, StorageError> {
    match adapter {
        StorageAdapter::Local => {
            info!("Create local storage adapter.");
            let storage = local::LocalStorage::new().await?;
            Ok(Arc::new(storage))
        }
        StorageAdapter::Kubernetes => {
            info!("Create Kubernetes storage adapter.");
            let storage = kubernetes::KubernetesStorage::new().await?;
            Ok(Arc::new(storage))
        }
    }
}
