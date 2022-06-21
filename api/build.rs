const INCLUDES: &[&str; 1] = &["proto"];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let profile = std::env::var("PROFILE")?;

    tonic_build::configure()
        .build_server(true)
        .build_client(profile == "debug")
        .compile(&["proto/contracts.proto"], INCLUDES)?;

    println!("cargo:rerun-if-changed=proto/contracts.proto");

    Ok(())
}
