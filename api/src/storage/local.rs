use std::{collections::HashMap, path::Path};

use log::{debug, info, warn};
use prost::Message;
use tokio::fs::{create_dir_all, read, read_dir, remove_file, write};

use crate::{grpc::contracts::Contract, utils::participants_to_contract};

use super::{Storage, StorageError};

#[cfg(not(test))]
const LOCAL_CONTRACTS_PATH: &str = "./data/contracts";

#[cfg(test)]
const LOCAL_CONTRACTS_PATH: &str = "./tmp/data/contracts";

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

    async fn get(&self, id: &str) -> Result<Contract, StorageError> {
        let mut entries = read_dir(LOCAL_CONTRACTS_PATH)
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;

        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| StorageError::StorageIO { err: e.to_string() })?
        {
            let contract_id = entry.file_name().to_string_lossy().replace(".contract", "");
            if contract_id == id {
                info!("Fetch contract with id '{}'.", id);
                let data = read(entry.path())
                    .await
                    .map_err(|e| StorageError::StorageIO { err: e.to_string() })?;
                let contract = Contract::decode(&data[..])
                    .map_err(|e| StorageError::Conversion { err: e.to_string() })?;
                return Ok(contract);
            }
        }

        warn!("No contract with id '{}' found.", id);
        Err(StorageError::NotFound { id: id.to_string() })
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

#[cfg(test)]
mod tests {
    use crate::utils::participant_hash;

    use super::*;
    use serial_test::serial;

    const PKI_A_KEY: &str = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlDeVRDQ0FiR2dBd0lCQWdJQkFUQU5CZ2txaGtpRzl3MEJBUXNGQURBb01Rd3dDZ1lEVlFRRERBTlFTMGt4DQpHREFXQmdOVkJBb01EMWRwY21WUVlXTjBJRkJMU1NCRFFUQWVGdzB5TWpBMk1UTXhNekl6TVRSYUZ3MHlOekEyDQpNVEl4TXpJek1UUmFNQ2d4RERBS0JnTlZCQU1NQTFCTFNURVlNQllHQTFVRUNnd1BWMmx5WlZCaFkzUWdVRXRKDQpJRU5CTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF6V1hIQ25Ia0xwZTNLdlRzDQpzUTMyMjAyQi9TaHZXRjdWaFArOGFMZXVkblRJc2w3MUxUNFhYVU5FdFRJWWdQcmx4YzZyemJPclBVTmNjbUNaDQpnbit6L3Y3ODZPTmVKdFNxTWxQQmFTQ3BVSjNDM1lLSlNnUHFPdCtJdHYrQVpwTTBWeWhQdFBqVGVhU0hFT2xoDQp0b2dFY2IzaFdRTUhnY2VtemZVZlZMZnpvZHVUN25PclhqMUpKSTY2dEMxYTYvbmcrK0dDVkROdGdTNjJrdUgxDQp1SWR1UDEvcjBYT2JQWTNnUGtiL1ROUlFSYko5czBSRVVCYWtseks1Wmh0bzdFOWF1TE9EWDcydUVvckF6WFIyDQpTblNveWw3Skx3UHNydEthOFlSN0p1UkROTDhka3NiT1lBN1lwdXhIWnQ5L3k0MEliYk5iMTlEODZqeGlrUGhGDQpwZ0dFZndJREFRQUJNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUFDZXNFc29GSWVaV1ZSMlhydlMrd21jN21sDQovejBxOERFeFB1RHRsRm94RmsydTg3bHMyT2dHc1RXSUZqaTZsM2krdHhieUE5N01SVXNhR3B2UUNLNWhyMTlxDQo4ME5uZmFxcTNXbzExMzNueCtKaVRCK1I3amVYelVsa1FWUUVlOFU0R0xPWDkyUzV4Ly8ydzZGeWhyclFJYmE5DQpuNjdZUkRkcHJlcEIzOTJ2UWd0KzR3MFY2Vmg1N0ZJNFJyWDFJaEFtUklUbE5CZ2tETUxNam9hbU90dkpEYzJNDQpDN25IMVViVDFzN1JVSFBXdWZTME5qWWlJb0s1dmxqV2V4Ym1kYTM3M2RVMUJWZE45Umt4SjA1cTE3dHRXdU10DQpXbDM2eGYwa0M4VnA5bkRDRW0xWWNIYU9ZaEZNVm0vTUtCdjJRcmRoMFByV0pibmMrK0VZZXEvOWVjREYNCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0NCg==";
    const PKI_B_KEY: &str = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tDQpNSUlDeVRDQ0FiR2dBd0lCQWdJQkFUQU5CZ2txaGtpRzl3MEJBUXNGQURBb01Rd3dDZ1lEVlFRRERBTlFTMGt4DQpHREFXQmdOVkJBb01EMWRwY21WUVlXTjBJRkJMU1NCRFFUQWVGdzB5TWpBMk1qRXdOek13TURGYUZ3MHlOekEyDQpNakF3TnpNd01ERmFNQ2d4RERBS0JnTlZCQU1NQTFCTFNURVlNQllHQTFVRUNnd1BWMmx5WlZCaFkzUWdVRXRKDQpJRU5CTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF6NVhKVVh2dllPYnRuTHhpDQpsMlJ0UW91UWFVaHhyaDFtajg4VHVpVktaQmNsZ3F0UDhFUHFvQ254NTh5Zk8yRUZibDhxZjJaQ1VTR2pjdnQ5DQppZDc3VnNTZjI5WkJMTEdtZWllUVdVQ3hmOW9xN2RPU0I3bWpOVlJuaWtyYTlwV01QTUhSbmxBUnhYSFE2Q3FMDQp1YVlUSUZGNE1VcHBPdXlkc0FoeWQ3RXQxV0JacWdlK0tmZ2RLZGtRYkVnNHUwR2tEMFFucWNyTjNtOUdCUGJkDQpsSVB5b1NFTVpYSVpETWFhaTZGdUhlazRHcGk0RTFIN1JsR1kvVjV0L1RqTmgwWGdJZElnK0p4ZlFmUVNWYzF4DQpiS2l5eHFNUG5VUU9TckFweHJZTnAreE85Rzl1U1RSMmlGY2UyQ2VaREx3QkJxekg2N2E2bEptWHR2U051RVQyDQo3OEd0NFFJREFRQUJNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUNSU2dLZXFhdkhVUm1ocXgyeDYzajJGV3dyDQpTWGRRazAzWUhJdXBBSnk1U1VsdysxNUhUd3RlbHloZjFLSmtKMVZFQml5S0ZJcXplQlAwNExZaVpQa2FmZkVjDQp3NFcrMTJ5QXpRMFY5T1NWVU9rWlorT0U3SUFNTnJXZHFnNDVyWTA4UXdxMUZQeHpQT0hBeFpEblpqc2QwSGlKDQpMY2VTanhaRGRXVHlOVVJ5Y29vbExwS1o5SjFjOExwNnhDVk5ocXdUcG50aHdlTW1MbnhrMVFJSEpLcDRJeE8yDQpicEVFOERjZ2I3SDZ5SWNOVzhWMkt3R1BLVWQ0NkU3elliS0Y4SVNqakxkQTU4blQ1N3ZIMkpMd082NmJwWkdMDQpacGtYbDhKOXdaU3ZFYWd3bzYvd1NwbTByOXZCcDhBWDd0UjE2UDhwamFCSVlYZmY3QTRhSy9sZXJLME8NCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0NCg==";
    const A_B_ID: &str = "67e3f28d6de06a0969786b2669cd150eb1b76bc9e064c70830ddac6ffeb56c3a";

    fn clean_up() -> Result<(), Box<dyn std::error::Error>> {
        use std::fs::remove_dir_all;

        let path = Path::new("./tmp");
        if !path.exists() {
            return Ok(());
        }

        remove_dir_all(path)?;
        Ok(())
    }

    fn get_pkis() -> HashMap<String, Vec<u8>> {
        let mut pkis = HashMap::new();
        pkis.insert("pki_A".to_string(), base64::decode(PKI_A_KEY).unwrap());
        pkis.insert("pki_B".to_string(), base64::decode(PKI_B_KEY).unwrap());
        pkis
    }

    #[tokio::test]
    #[serial]
    async fn initialize_empty_storage() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();
        let contracts = storage.all().await.unwrap();
        assert_eq!(contracts.len(), 0);
    }

    #[tokio::test]
    #[serial]
    async fn store_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        storage.create_contract(&get_pkis()).await.unwrap();
        let contracts = storage.all().await.unwrap();
        assert_eq!(contracts.len(), 1);
        assert_eq!(contracts[0].id, A_B_ID);
    }

    #[tokio::test]
    #[serial]
    async fn throw_on_duplicate_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        storage.create_contract(&get_pkis()).await.unwrap();
        assert!(storage.create_contract(&get_pkis()).await.is_err());
    }

    #[tokio::test]
    #[serial]
    async fn fetch_single_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        let contract = storage.create_contract(&get_pkis()).await.unwrap();
        let contract = storage.get(&contract.id).await.unwrap();
        assert_eq!(contract.id, A_B_ID);
    }

    #[tokio::test]
    #[serial]
    async fn throw_on_not_found_single_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        let result = storage.get(A_B_ID).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    #[serial]
    async fn delete_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();
        storage.create_contract(&get_pkis()).await.unwrap();

        let result = storage.delete_contract(A_B_ID).await;
        assert!(result.is_ok());

        let contracts = storage.all().await.unwrap();
        assert_eq!(contracts.len(), 0);
    }

    #[tokio::test]
    #[serial]
    async fn throw_on_not_found_contract() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        let result = storage.delete_contract(A_B_ID).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    #[serial]
    async fn return_empty_participants() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();

        let result = storage
            .involved_participants(&participant_hash(&base64::decode(PKI_A_KEY).unwrap()).unwrap())
            .await
            .unwrap();
        assert_eq!(result.len(), 0);
    }

    #[tokio::test]
    #[serial]
    async fn return_correct_participants() {
        clean_up().unwrap();
        let storage = LocalStorage::new().await.unwrap();
        storage.create_contract(&get_pkis()).await.unwrap();
        let result = storage
            .involved_participants(&participant_hash(&base64::decode(PKI_A_KEY).unwrap()).unwrap())
            .await
            .unwrap();
        assert_eq!(result.len(), 1);
    }
}
