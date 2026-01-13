# Centralized Logging with RabbitMQ

## Overview

OrdersService now publishes structured logs to a centralized RabbitMQ exchange for aggregation and monitoring.

## Architecture

- **Exchange**: `logs.exchange` (type: topic)
- **Queue**: `logs.queue`
- **Routing Keys**: `{service}.{level}` (e.g., `ordersservice.info`, `ordersservice.error`)
- **Binding Pattern**: `#` (all logs)

## Log Format

```
<timestamp> <LogType> <URL> <CorrelationId> <serviceName> - <message>
```

Example:
```
2026-01-13T18:44:24.103Z Info queue://payment.result abc-123-def OrdersService - Received payment result for order: ord_456
```

## Log Message Structure (RabbitMQ)

```json
{
  "timestamp": "2026-01-13T18:44:24.103Z",
  "level": "Info",
  "service": "OrdersService",
  "correlationId": "abc-123-def-456",
  "url": "queue://payment.result",
  "message": "Received payment result for order: ord_456",
  "error": {
    "message": "Error details here",
    "stack": "Error stack trace"
  }
}
```

## Viewing Logs

### 1. RabbitMQ Management UI

Access: http://localhost:15672
- Username: `admin`
- Password: `admin123`

Navigate to:
1. **Exchanges** → `logs.exchange` to see routing statistics
2. **Queues** → `logs.queue` to see queued logs
3. **Get messages** to view log content

### 2. Docker Logs (Console Output)

```bash
# View OrdersService logs
docker compose logs ordersservice

# Follow logs in real-time
docker compose logs -f ordersservice

# View last 100 lines
docker compose logs ordersservice --tail 100
```

### 3. Consume Logs from Queue (CLI)

Using `rabbitmqadmin`:

```bash
# Install rabbitmqadmin
docker exec rabbitmq rabbitmqadmin get queue=logs.queue count=10
```

## Log Levels and Routing

| Level | Routing Key | Description |
|-------|-------------|-------------|
| Info  | `ordersservice.info` | Informational messages |
| Error | `ordersservice.error` | Error messages with stack traces |
| Warn  | `ordersservice.warn` | Warning messages |

## Correlation ID Tracking

Every RabbitMQ message exchange generates a unique correlation ID that tracks the operation through the system:

1. **Order Created** → Correlation ID generated
2. **Payment Request** → Same correlation ID
3. **Payment Result** → Same correlation ID returned
4. **Order Updated** → Same correlation ID

This enables end-to-end tracing of requests across services.

## Consuming Logs Programmatically

To create a log consumer service:

```typescript
import { rabbitMQ } from './messaging/rabbitmq';
import { QUEUES } from './messaging/types';

const channel = rabbitMQ.getChannel();

channel.consume(QUEUES.LOGS, (msg) => {
  if (!msg) return;
  
  const log = JSON.parse(msg.content.toString());
  console.log(`[${log.service}] ${log.level}: ${log.message}`);
  
  // Store in database, send to monitoring service, etc.
  
  channel.ack(msg);
});
```

## Future Enhancements

- [ ] Dedicated log consumer service
- [ ] Integration with ELK stack (Elasticsearch, Logstash, Kibana)
- [ ] Log rotation and retention policies
- [ ] Real-time log streaming dashboard
- [ ] Alert triggers based on error patterns
