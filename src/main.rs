use std::path::Path;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use hull::Hull;
use hull::server;

fn announce(host: &str, port: u16) {
    if is_wildcard(host) {
        println!("Hull is on http://127.0.0.1:{port}");
        eprintln!("hull: listening on every interface, no login");
    } else if is_loopback(host) {
        println!("Hull is on http://127.0.0.1:{port}");
    } else {
        println!("Hull is on http://{host}:{port}");
    }
}

fn is_wildcard(host: &str) -> bool {
    matches!(host, "0.0.0.0" | "::" | "[::]")
}

fn is_loopback(host: &str) -> bool {
    matches!(host, "127.0.0.1" | "localhost" | "::1" | "[::1]")
}

fn main() {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(4471);
    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let modules = std::env::var("HULL_MODULES").unwrap_or_else(|_| "modules".into());
    let hull = Hull::boot_dir(Path::new(&modules));
    if let Some(fault) = hull.fault() {
        eprintln!("hull boot fault: {fault}");
    }
    let listener = server::bind_preferred(&host, port).unwrap_or_else(|error| {
        eprintln!("hull could not bind {host}:{port}: {error}");
        std::process::exit(1);
    });
    let bound = listener
        .local_addr()
        .map(|addr| addr.port())
        .unwrap_or(port);
    if port != 0 && bound != port {
        eprintln!("hull: {host}:{port} is taken, asking the OS for a free port");
    }
    announce(&host, bound);
    let hull = Arc::new(Mutex::new(hull));
    if std::env::var("HULL_WATCH").ok().as_deref() != Some("0") {
        let watched = Arc::clone(&hull);
        let modules = modules.clone();
        thread::spawn(move || {
            loop {
                thread::sleep(Duration::from_millis(400));
                let mut guard = watched.lock().unwrap_or_else(|poison| poison.into_inner());
                guard.reload_dir(Path::new(&modules));
            }
        });
    }
    server::serve(listener, hull);
}
