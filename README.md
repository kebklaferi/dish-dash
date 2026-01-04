# Dish-Dash

**SUA Projekt** – Microservices-based application  

## Services & API Docs

| Service            | URL                                      | Notes                                                                 |
|-------------------|------------------------------------------|-----------------------------------------------------------------------|
| **Catalog Service**  | [http://localhost:8088/api/catalog/swagger/index.html](http://localhost:8088/api/catalog/swagger/index.html) | Browse endpoints for catalog operations                                |
| **Delivery Service** | [http://localhost:8088/api/delivery/swagger/index.html](http://localhost:8088/api/delivery/swagger/index.html) | Browse endpoints for delivery operations                               |
| **Orders Service**   | [http://localhost:8088/api/orders/api-docs/](http://localhost:8088/api/orders/api-docs/) | Browse endpoints for orders operations                                  |
| **Identity Service** | [http://localhost:8088/api/identity/api-docs/](http://localhost:8088/api/identity/api-docs/) | Generate JWT using `/auth/register` and apply the token in OpenAPI Bearer Auth |
| **Payment Service** | [http://localhost:8088/api/payment/api-docs/](http://localhost:8088/api/payment/api-docs/) |  Browse endpoints for pyment operations  |
| **Notification Service**  | [http://localhost:8088/api/notification/api-docs/](http://localhost:8088/api/notification/api-docs/) | Browse endpoints for Notification operations                                |
| **Restaurant Service**  | [http://localhost:8088/api/restaurant/api-docs/](http://localhost:8088/api/restaurant/api-docs/) | Browse endpoints for Restaurant operations
---
Adminer: http://localhost:8081
Login with credetials you've set for postgres db.
(postgres -> identity-db -> postgres -> password -> identity_db)



