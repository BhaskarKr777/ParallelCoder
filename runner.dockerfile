# One image with every toolchain the sandboxed code runner needs
# (see Backend/src/services/runner.service.js), instead of pulling a
# separate upstream image per language (node/python/gcc/jdk). Build
# and version this yourself:
#
#   docker build -f runner.dockerfile -t parallel-coder-runner:latest .
#
# runner.service.js execs this image directly via `docker run` - it
# is never started as a long-running container itself.
FROM node:20.18.0-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      build-essential \
      default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

