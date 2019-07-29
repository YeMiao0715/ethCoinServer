import "reflect-metadata";
import { createConnection } from "typeorm";
import connectionOption from '../../config/databaseConfig';

export const db = async function() {
  return await createConnection(connectionOption as any).then(connect => {
    return connect;
  })
}
