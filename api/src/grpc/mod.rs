use log::warn;
use tonic::{Request, Status};

pub(crate) mod contracts {
    tonic::include_proto!("wirepact.contracts");
}

pub fn api_key_interceptor(api_key: &str) -> impl tonic::service::Interceptor + Clone {
    let api_key = api_key.to_string();
    move |request: Request<()>| {
        let auth_header = request.metadata().get("Authorization");
        if let Some(header) = auth_header {
            let header_key = header.to_str();
            if header_key.is_err() {
                warn!("Could not parse auth header to string");
                return Err(Status::unauthenticated("Invalid Authorization header"));
            }

            let header_key = header_key.unwrap();
            let result = header_key == api_key;
            if !result {
                warn!(
                    "Authorization key ({}) in request does not match configured key ({})",
                    api_key, header_key
                );
                return Err(Status::unauthenticated("Authorization does not match"));
            }

            Ok(request)
        } else {
            warn!("No Authorization header found in request.");
            Err(Status::unauthenticated("No Authorization header provided"))
        }
    }
}
