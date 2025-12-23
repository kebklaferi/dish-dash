# Payment Service

A microservice for handling payment processing in the dish-dash application.

## Features

- ✅ Create and process card payments
- ✅ Payment status tracking (PENDING → PROCESSING → COMPLETED/FAILED)
- ✅ Payment history tracking
- ✅ Simulated card processing (90% approval rate)
- ✅ Refund support
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful API with Swagger documentation

## API Endpoints

### Payments
- `POST /api/payments` - Create a new payment
- `POST /api/payments/:id/process` - Process a payment
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/order/:orderId` - Get all payments for an order
- `GET /api/payments/:id/history` - Get payment history
- `POST /api/payments/:id/refund` - Refund a payment

### Health Check
- `GET /health` - Service health status

### Documentation
- `GET /api-docs` - Swagger API documentation

## Payment Flow

1. **Create Payment**: Client creates a payment with order details and card information
2. **Process Payment**: Service simulates card processing (1-second delay)
3. **Status Update**: Payment status updates through states (PENDING → PROCESSING → COMPLETED/FAILED)
4. **History Tracking**: All status changes are logged in payment history

## Example Usage

### Create Payment
```bash
POST http://localhost:3002/api/payments
{
  "orderId": "uuid-here",
  "amount": 29.99,
  "currency": "EUR",
  "paymentMethod": "CARD",
  "cardNumber": "4532123456789012",
  "cardExpiry": "12/25",
  "cardCvv": "123",
  "cardholderName": "John Doe"
}
```

### Process Payment
```bash
POST http://localhost:3002/api/payments/{paymentId}/process
```

## Database Schema

### Payment Table
- `id` - UUID primary key
- `orderId` - Reference to order
- `amount` - Payment amount
- `currency` - Currency code (default: EUR)
- `status` - Payment status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- `paymentMethod` - Payment method (currently only CARD)
- `cardLast4` - Last 4 digits of card
- `cardBrand` - Card brand (Visa, Mastercard, Amex, etc.)
- `transactionId` - Unique transaction identifier
- `createdAt`, `updatedAt`, `processedAt` - Timestamps

### PaymentHistory Table
- `id` - UUID primary key
- `paymentId` - Reference to payment
- `status` - Status at this point
- `message` - Optional message
- `createdAt` - Timestamp

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev

# Build
npm run build

# Start production server
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://payment_user:payment_password@localhost:5432/payment_db
```

## Docker

The service is containerized and integrated with docker-compose:

```bash
# Build and start all services
docker compose up --build

# Start just payment service
docker compose up paymentservice
```

## Card Testing

The service simulates card processing with a 90% success rate. Use any valid card number format:

- Visa: 4532123456789012
- Mastercard: 5425233430109903
- Amex: 374245455400126

## Future Enhancements

- [ ] Support for multiple payment methods (PayPal, bank transfer, etc.)
- [ ] Webhook notifications for payment status changes
- [ ] Payment amount validation against order total
- [ ] Card tokenization and secure storage
- [ ] Integration with real payment providers
- [ ] Retry logic for failed payments
- [ ] Payment analytics and reporting
