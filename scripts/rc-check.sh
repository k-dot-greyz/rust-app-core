#!/bin/sh
# Release check for the hull and the shorthand.
# cargo test stays the Rust suite. It does not grow a Node dependency.
# This script is the check that runs both. Zero crates. No Playwright.
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$root"
cargo test
cd "$root/shorthand"
pnpm test
pnpm typecheck
