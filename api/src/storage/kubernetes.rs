use std::collections::HashMap;

use crate::grpc::contracts::Contract;

use super::{Storage, StorageError};

pub(super) struct KubernetesStorage {}

#[tonic::async_trait]
impl Storage for KubernetesStorage {
    async fn all(&self) -> Result<Vec<Contract>, StorageError> {
        todo!()
    }

    async fn create_contract(
        &self,
        participants: &HashMap<String, Vec<u8>>,
    ) -> Result<Contract, StorageError> {
        todo!()
    }

    async fn delete_contract(&self, id: &str) -> Result<(), StorageError> {
        todo!()
    }
}
