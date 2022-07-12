mod contracts_service;
mod grpc;
mod storage;
mod utils;

use clap::{ArgEnum, Parser};
use log::info;
use tonic::{service::interceptor, transport::Server};

use crate::{
    contracts_service::ContractsService, grpc::api_key_interceptor, storage::create_storage,
};

#[derive(Clone, Debug, ArgEnum)]
pub(crate) enum StorageAdapter {
    Local,
    Kubernetes,
}

#[derive(Parser, Debug)]
#[clap(version, about, long_about = None)]
struct Cli {
    /// The port that the server will listen on.
    #[clap(short, long, env, default_value = "8080")]
    port: u16,

    /// The storage adapter to use.
    ///
    /// Possible values: local, kubernetes
    ///
    /// Local will use local filesystem to store the contracts,
    /// while kubernetes will use kubernetes secrets.
    ///
    /// Defaults to "local".
    #[clap(arg_enum, short, long, env, default_value = "local")]
    storage: StorageAdapter,

    /// If set, debug log messages are printed as well.
    #[clap(short, long, env)]
    debug: bool,

    /// Defines the API key that acts as shared secret for the contract API.
    /// This is used to authenticate the API calls.
    /// All calls to the API must have the HTTP `Authorization` header set to the value of this key.
    /// Example: `Authorization: <API_KEY>`.
    #[clap(long, env)]
    api_key: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    env_logger::builder()
        .filter_module(
            "k8s_contract_repository",
            match cli.debug {
                true => log::LevelFilter::Debug,
                false => log::LevelFilter::Info,
            },
        )
        .init();

    let address = format!("0.0.0.0:{}", cli.port);

    info!("Creating and starting server @ {}.", address);
    let storage = create_storage(cli.storage).await?;
    Server::builder()
        .accept_http1(true)
        .layer(interceptor(api_key_interceptor(&cli.api_key)))
        .add_service(tonic_web::enable(ContractsService::grpc_service(storage)))
        .serve_with_shutdown(address.parse()?, signal())
        .await?;

    Ok(())
}

#[cfg(windows)]
async fn signal() {
    use tokio::signal::windows::ctrl_c;
    let mut stream = ctrl_c().unwrap();
    stream.recv().await;
    info!("Signal received. Shutting down server.");
}

#[cfg(unix)]
async fn signal() {
    use log::debug;
    use tokio::signal::unix::{signal, SignalKind};

    let mut int = signal(SignalKind::interrupt()).unwrap();
    let mut term = signal(SignalKind::terminate()).unwrap();

    tokio::select! {
        _ = int.recv() => debug!("SIGINT received."),
        _ = term.recv() => debug!("SIGTERM received."),
    }

    info!("Signal received. Shutting down server.");
}
