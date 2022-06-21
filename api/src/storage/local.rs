use std::{collections::HashMap, path::Path};

use log::{debug, info, warn};
use prost::Message;
use tokio::fs::{create_dir_all, read, read_dir, remove_file, write};

use crate::{grpc::contracts::Contract, utils::participants_to_contract};

use super::{Storage, StorageError};

const LOCAL_CONTRACTS_PATH: &str = "./data/contracts";

pub(super) struct LocalStorage {}

impl LocalStorage {
    pub(crate) async fn new() -> Result<Self, StorageError> {
        debug!("Create local storage adapter and ensure directories.");
        create_dir_all(LOCAL_CONTRACTS_PATH)
            .await
            .map_err(|e| StorageError::CouldNotCreate { err: e.to_string() })?;
        Ok(Self {})
    }
}

#[tonic::async_trait]
impl Storage for LocalStorage {
    async fn all(&self) -> Result<Vec<Contract>, StorageError> {
        let mut entries = read_dir(LOCAL_CONTRACTS_PATH)
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;
        let mut contracts = Vec::new();
        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?
        {
            let data = read(entry.path())
                .await
                .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;
            let contract = Contract::decode(&data[..])
                .map_err(|e| StorageError::Conversion { err: e.to_string() })?;
            debug!(
                "Loaded contract with id '{}' from '{}'.",
                contract.id,
                entry.file_name().to_string_lossy()
            );
            contracts.push(contract);
        }

        info!("Fetched {} contracts from local storage.", contracts.len());
        Ok(contracts)
    }

    async fn create_contract(
        &self,
        participants: &HashMap<String, Vec<u8>>,
    ) -> Result<Contract, StorageError> {
        let contract = participants_to_contract(participants)
            .map_err(|e| StorageError::Conversion { err: e.to_string() })?;

        let path = format!("{}/{}.contract", LOCAL_CONTRACTS_PATH, contract.id);
        let path = Path::new(&path);

        if path.exists() {
            warn!("Contract with id '{}' already exists.", contract.id);
            return Err(StorageError::ContractAlreadyExists { id: contract.id });
        }

        let data = contract.encode_to_vec();
        write(path, data)
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;

        info!(
            "Created contract with id '{}' in local storage.",
            contract.id
        );
        Ok(contract)
    }

    async fn delete_contract(&self, id: &str) -> Result<(), StorageError> {
        let path = format!("{}/{}.contract", LOCAL_CONTRACTS_PATH, id);
        let path = Path::new(&path);

        if !path.exists() {
            warn!("Contract with id '{}' does not exist.", id);
            return Err(StorageError::NotFound { id: id.to_string() });
        }

        remove_file(path)
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;

        info!("Deleted contract with id '{}' from local storage.", id);
        Ok(())
    }
}
