oxinus-task
==============

Dependencies: Node 18>=, PostgreSQL, NPM

Development
===========

Install PostgreSQL, create user and database.
Run the following commands:

    psql YOUR_DATABASE_NAME -c 'CREATE SCHEMA IF NOT EXISTS extensions; CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions; GRANT ALL ON SCHEMA extensions TO YOUR_USER_NAME;'

Create a `.env` file using `.env.sample` and fill your database details.


Start the app

    npm start -- --migrate clean_and_migrate

If everything goes well, you should see the app at localhost:3000.

JWT Key Pair
============

* For authentication of secured api routes we have used JWT tokens.
* For creation and verification of JWT token we have user ES512 alogorithm.
* JWT token are created using jwt-private.pem file located in root project.
* JWT token verification is done using jwt-public.pem file located in root project.
* If you want to update the file name please update it in the .env file as well.

Commands to create JWT token key pair.

`openssl ecparam -genkey -name secp521r1 -noout -out jwt-private.pem`

`openssl ec -in jwt-private.pem -pubout > jwt-public.pem`

NPM Scrpits
===========

`npm run create:migration YOUR_MIGRATION_NAME`

This command will create your migration in migrations directory along with up and down migration sqls in migrations/sqls directory.

`npm run db:migrate`

This command will run your migration in migrations directory.

`npm run db:migrate`

This command will clean your database. It uses down migration to clean up the database.


`npm start`
Starts the development server

`npm start -- --migrate migrate`

This command will start your application and run migrations before starting server.

`npm start -- --migrate clean_and_migrate`

This command will start your application and clean db plus run migrations before starting server.

`npm run lint`

This command would show you linting errors in console log.


Docker
===========

If you wish to use docker to start this app, run the following command:

`sudo docker-compose up` or `docker-compose up`

(assuming docker and docker-compose is pre-installed on the system)

This command will initialise the containers and run the containers using `docker-compose.yml` file.

Further the `startup.sh` file in `./scripts` folder will run the following commands:

`npm install`

`npm run db:migrate`

`npm start`

The above mentioned commands in `startup.sh` file will install npm packages and it's dependencies & run all the necessary database migration.

If everything goes well, you should see the app at localhost:8080.

To clean up all the running docker container, run the following command:
`sudo docker-compose down` or `docker-compose down`