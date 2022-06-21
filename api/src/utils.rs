use std::collections::{BTreeMap, HashMap};

use openssl::{hash::MessageDigest, stack::Stack, x509::X509};
use sha2::{Digest, Sha256};

use crate::grpc::contracts::{Contract, Participant};

pub(crate) fn participants_to_contract(
    participants: &HashMap<String, Vec<u8>>,
) -> Result<Contract, Box<dyn std::error::Error>> {
    let mut btree = BTreeMap::new();
    for (name, public_key) in participants {
        btree.insert(name, public_key);
    }

    let mut contract = Contract::default();
    let mut contract_hash = Sha256::new();
    for (name, public_key) in btree {
        let participant = Participant {
            name: name.to_string(),
            public_key: public_key.clone(),
            hash: participant_hash(public_key)?,
        };
        contract.participants.push(participant);
        contract_hash.update(name.as_bytes());
        contract_hash.update(public_key);
    }
    let hash = contract_hash.finalize().to_ascii_lowercase();
    let hash = hex::encode(hash);
    contract.id = hash;

    Ok(contract)
}

pub(crate) fn participant_hash(public_key: &Vec<u8>) -> Result<String, Box<dyn std::error::Error>> {
    let cert = X509::from_pem(public_key)?;
    let hash = cert.digest(MessageDigest::sha256())?;
    Ok(hex::encode(hash))
}
