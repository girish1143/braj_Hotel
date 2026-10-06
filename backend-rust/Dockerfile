# Build stage
FROM rust:slim AS builder

WORKDIR /usr/src/app

# Copy manifests
COPY Cargo.toml ./

# Cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src target/release/deps/brijnidhi_admin_backend*

# Copy actual source code
COPY src ./src

# Build the release binary
RUN cargo build --release

# Final minimal runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/app/target/release/brijnidhi-admin-backend /app/brijnidhi-admin-backend

EXPOSE 5001

CMD ["/app/brijnidhi-admin-backend"]
