# Dish-Dash

**SUA Projekt** – Microservices-based application  

## Services & API Docs

| Service            | URL                                      | Notes                                                                 |
|-------------------|------------------------------------------|-----------------------------------------------------------------------|
| **Catalog Service**  | [http://localhost:8080/swagger](http://localhost:8080/swagger) | Browse endpoints for catalog operations                                |
| **Delivery Service** | [http://localhost:8090/swagger](http://localhost:8090/swagger) | Browse endpoints for delivery operations                               |
| **Orders Service**   | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | Browse endpoints for orders operations                                  |
| **Identity Service** | [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/) | Generate JWT using `/auth/register` and apply the token in OpenAPI Bearer Auth |

---
Adminer: http://localhost:8081
Login with credetials you've set for postgres db.
(postgres -> identity-db -> postgres -> password -> identity_db)



