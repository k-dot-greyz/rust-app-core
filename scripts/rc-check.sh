#!/bin/sh
# Release check for the hull and the shorthand.
# cargo test stays the Rust suite. It does not grow a Node dependency.
# This script is the check that runs both. Zero crates. No Playwright.
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$root"

# Floor. stable may be newer. Older than 1.99.1 is not this tree.
ver=$(rustc --version | awk 'NR==1 { print $2 }')
awk -v v="$ver" 'BEGIN {
  n = split(v, a, ".")
  split("1.99.1", b, ".")
  if (n < 3) exit 1
  for (i = 1; i <= 3; i++) {
    if ((a[i] + 0) < (b[i] + 0)) exit 1
    if ((a[i] + 0) > (b[i] + 0)) exit 0
  }
}' || {
  echo "rustc ${ver} is below the floor 1.99.1" >&2
  exit 1
}

cargo test
cd "$root/shorthand"
pnpm test
pnpm typecheck
