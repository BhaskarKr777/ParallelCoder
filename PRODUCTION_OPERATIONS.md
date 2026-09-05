# Parallel Coder Production Operations & Scaling Guide

This guide details the architectural plan and operational instructions for running **Parallel Coder** in high-availability, multi-node production environments.

---

## 1. Horizontal Scaling Plan

### Socket.IO Horizontal Scaling
By default, Socket.IO stores sockets, rooms, and state in-memory on a single node. For multi-node API scaling behind an L7 Load Balancer (e.g. AWS ALB, NGINX, HAProxy):

1. **Redis Adapter Integration**:
   Install `@socket.io/redis-adapter` and `ioredis` in `Backend`:
   ```bash
   npm install @socket.io/redis-adapter ioredis
   ```
2. **Cluster Adapter Configuration**:
   ```javascript
   import { createAdapter } from "@socket.io/redis-adapter";
   import { Cluster } from "ioredis";

   const pubClient = new Cluster(REDIS_ENDPOINTS);
   const subClient = pubClient.duplicate();

   io.adapter(createAdapter(pubClient, subClient));
   ```
3. **Sticky Sessions**:
   Ensure the load balancer enforces **Sticky Sessions** (via HTTP Cookie or IP affinity) during the HTTP Long-Polling phase before WebSocket upgrade.

### Yjs Document Server Horizontal Scaling
The Yjs WebSocket server manages live document updates in LevelDB/memory. To scale Yjs horizontally across multiple servers:

1. **Yjs Redis Provider (`y-redis`)**:
   Use `y-redis` or a Redis Pub/Sub adapter to synchronize document updates between Yjs worker instances.
2. **Consistent Hashing Router**:
   Configure the ingress proxy to route WebSocket connections for the same `fileId` to the same primary Yjs node, using Redis for cross-node document state broadcasting if failover occurs.

---

## 2. Automated Backups Strategy

### PostgreSQL Automated Backup Routine
Run a daily cron job container or host service executing `pg_dump` with compressed output sent to secure cloud storage (AWS S3 / GCP Storage):

#### Backup Shell Script (`/scripts/backup-db.sh`)
```bash
#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
FILE_NAME="parallel_coder_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "${BACKUP_DIR}/${FILE_NAME}"

# Upload to S3 (retention 30 days)
aws s3 cp "${BACKUP_DIR}/${FILE_NAME}" "s3://${S3_BACKUP_BUCKET}/postgres/${FILE_NAME}"

# Cleanup local backups older than 7 days
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +7 -delete
```

### Yjs Volume Snapshot Strategy
LevelDB persistence files in `/data/yjs` must be snapshotted daily during off-peak hours:

```bash
#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "/backups/yjs/yjs_data_${TIMESTAMP}.tar.gz" -C /data/yjs .
aws s3 cp "/backups/yjs/yjs_data_${TIMESTAMP}.tar.gz" "s3://${S3_BACKUP_BUCKET}/yjs/"
```

---

## 3. Monitoring & Alerting Setup

### Metrics Collection with Prometheus
1. Add `prom-client` to `Backend`:
   ```bash
   npm install prom-client
   ```
2. Instrument `/metrics` endpoint on `app.js`:
   ```javascript
   import client from "prom-client";

   const collectDefaultMetrics = client.collectDefaultMetrics;
   collectDefaultMetrics({ timeout: 5000 });

   app.get("/metrics", async (_req, res) => {
     res.set("Content-Type", client.register.contentType);
     res.end(await client.register.metrics());
   });
   ```

### Recommended Alert Rules (`prometheus-rules.yml`)
- **API High Error Rate**: Alert when 5xx HTTP response rate exceeds 2% over 5 minutes.
- **WebSocket Disconnection Spike**: Alert when active Socket.IO connections drop by >30% within 1 minute.
- **Runner Sandbox Pool Starvation**: Alert when active code executions remain at max capacity (`MAX_CONCURRENT_RUNS = 4`) for > 3 minutes.
- **Postgres Storage Threshold**: Alert when PostgreSQL disk usage exceeds 85%.

---

## 4. Disaster Recovery & Rollback Procedure

1. **Image Rollback**:
   To rollback a release, deploy the previously tagged immutable container image:
   ```bash
   docker compose pull api:<previous_tag>
   docker compose up -d --no-deps api
   ```
2. **Database Migration Rollback**:
   Execute Prisma down migrations via `npx prisma migrate resolve`.
