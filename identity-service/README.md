Creating migration with TypeORM

Generating migration (checks entites and compares them to current db schema -> generates SQL in a migration file)
1. npm run build

typeorm migration:generate -d <path/to/datasource> <path/to/migrations>/<migration-name>
2. npx typeorm migration:generate -d dist/config/database.js src/migrations/CreateUserTable --outputJs

Running the migration (executes all pending migrations on the database defined in AppDataSource)

typeorm migration:run -- -d path-to-datasource-config
npx typeorm migration:run -d dist/config/database.js
npx typeorm migration:run -d src/config/database.ts

npx typeorm-ts-node-commonjs migration:run -- -d path-to-datasource-config

