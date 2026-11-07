//! Hull is a hosted web app shell.
//! Cards and pipes are JSON. The airlock is default-deny. Nothing here opens an outbound socket.

pub mod airlock;
mod embed;
pub mod http;
pub mod hull;
pub mod json;
pub mod load;
mod render;
pub mod schema;
pub mod sync;

#[cfg(not(target_arch = "wasm32"))]
pub mod server;

#[cfg(target_arch = "wasm32")]
mod wasm;

pub use http::{Request, Response};
pub use hull::Hull;
