import { DataSource } from "typeorm";
import {
  getDatabaseHost,
  getDatabasePort,
  getDatabaseUsername,
  getDatabasePassword,
  getDatabaseName,
} from "../config";

import { SuggestionEntity } from "../entities";

let dataSource: DataSource | undefined;

export const getDatabaseDataSource = () => {
  if (!dataSource) {
    dataSource = new DataSource({
      type: "postgres",
      host: getDatabaseHost(),
      port: getDatabasePort(),
      username: getDatabaseUsername(),
      password: getDatabasePassword(),
      database: getDatabaseName(),
      entities: [SuggestionEntity],
      migrationsRun: false,
      synchronize: false,
    });
  }

  return dataSource;
};

export const getDatabaseConnection = async (): Promise<DataSource> => {
  dataSource = getDatabaseDataSource();

  if (!dataSource.isInitialized) {
    dataSource = await dataSource.initialize();
  }

  return dataSource;
};

export const runMigrations = async () => {
  const dataSource = await getDatabaseConnection();
  return dataSource.runMigrations();
};
