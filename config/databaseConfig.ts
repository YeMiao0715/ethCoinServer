import dotenv from 'dotenv';
dotenv.config({
  path: `${__dirname}/../.env`
});

export default {
  type: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [
    `${__dirname}/../src/database/entity/**/*.ts`
  ],
  migrations: [
    `${__dirname}/../src/database/migration/**/*.ts`
  ],
  subscribers: [
    `${__dirname}/../src/database/subscriber/**/*.ts`
  ],
}