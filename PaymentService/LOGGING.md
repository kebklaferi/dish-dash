# Centralized Logging with RabbitMQ - PaymentService

## Overview

PaymentService now publishes structured logs to a centralized RabbitMQ exchange for aggregation and monitoring, matching the OrdersService implementation.

## Architecture

- **Exchange**: `logs.exchange` (type: topic) - Shared across all services
- **Queue**: `logs.queue` - Centralized queue for all service logs
- **Routing Keys**: `{service}.{level}` (e.g., `paymentservice.info`, `paymentservice.error`)
- **Binding Pattern**: `#` (all logs)

## Log Format

```
<timestamp> <LogType> <URL> <CorrelationId> <serviceName> - <message>
```

Example:
```
2026-01-13T18:52:42.744Z Info queue://payment.process abc-123-def PaymentService - Received payment request for order: ord_456, amount: 100.00 EUR
```

## Correlation ID Flow

Payment processing now tracks correlation IDs end-to-end:

1. **OrdersService** generates correlation ID when creating payment request
2. **PaymentService** receives and uses same correlation ID throughout processing
3. **PaymentService** returns correlation ID in payment result
4. **OrdersService** logs result with same correlation ID

This enables full request tracing across both services.

## Files Modified

### Core Infrastructure
- [src/messaging/types.ts](src/messaging/types.ts) - Added EXCHANGES, LOG_ROUTING_KEYS, LogMessage interface, correlationId fields
- [src/messaging/rabbitmq.ts](src/messaging/rabbitmq.ts) - Added setupInfrastructure() to create exchange/queue
- [src/utils/logger.ts](src/utils/logger.ts) - Created logger utility with RabbitMQ publisher
- [src/server.ts](src/server.ts) - Initialize logger with RabbitMQ channel

### Messaging Components
- [src/messaging/consumer.ts](src/messaging/consumer.ts) - Updated with structured logging and correlation ID tracking

## Message Format Updates

### ProcessPaymentMessage (OrdersService → PaymentService)
```typescript
{
  correlationId: string;  // NEW: Tracks request across services
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
}
```

### PaymentResultMessage (PaymentService → OrdersService)
```typescript
{
  correlationId: string;  // NEW: Returns same correlation ID
  orderId: string;
  paymentId: string;
  status: 'COMPLETED' | 'FAILED';
  transactionId?: string;
  errorMessage?: string;
}
```

## Example Log Flow

### 1. Order Created (OrdersService)
```
2026-01-13T18:47:14.740Z Info queue://payment.process c36ddc1a-ecb4-4d96-b933-8e704167d85b OrdersService - Requesting payment processing for order: 421f7125-f118-4eda-97e0-7c50557f4d30, amount: 2603.99 EUR
```

### 2. Payment Processed (PaymentService)
```
2026-01-13T18:47:15.000Z Info queue://payment.process c36ddc1a-ecb4-4d96-b933-8e704167d85b PaymentService - Received payment request for order: 421f7125-f118-4eda-97e0-7c50557f4d30, amount: 2603.99 EUR
2026-01-13T18:47:15.800Z Info order://421f7125-f118-4eda-97e0-7c50557f4d30 c36ddc1a-ecb4-4d96-b933-8e704167d85b PaymentService - Payment processed for order: 421f7125-f118-4eda-97e0-7c50557f4d30 - SUCCESS (Transaction: TXN-1768330035813-L1MMF)
```

### 3. Result Returned (OrdersService)
```
2026-01-13T18:47:15.835Z Info order://421f7125-f118-4eda-97e0-7c50557f4d30 c36ddc1a-ecb4-4d96-b933-8e704167d85b OrdersService - Order 421f7125-f118-4eda-97e0-7c50557f4d30 confirmed - Payment successful (Transaction: TXN-1768330035813-L1MMF)
```

All three log entries share the same correlation ID: `c36ddc1a-ecb4-4d96-b933-8e704167d85b`

## Viewing Logs

### RabbitMQ Management UI
Access: http://localhost:15672 (admin/admin123)

1. Navigate to **Queues** → `logs.queue`
2. Click **Get messages**
3. View structured log entries from both services

### Filter by Service
In RabbitMQ UI, set up a consumer with routing key:
- `paymentservice.*` - Only PaymentService logs
- `ordersservice.*` - Only OrdersService logs
- `*.error` - All error logs from all services
- `*.info` - All info logs from all services

### Docker Logs
```bash
# PaymentService console logs
docker compose logs -f paymentservice

# OrdersService console logs
docker compose logs -f ordersservice

# Both services
docker compose logs -f ordersservice paymentservice
```

## Next Steps

The same logging infrastructure can be implemented for:
- DeliveryService
- CatalogService
- RestaurantService
- NotificationService
- identity-service

All services will publish to the same `logs.queue` for centralized monitoring.
