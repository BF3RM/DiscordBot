import "reflect-metadata";

import { DataSource, Logger, QueryRunner } from "typeorm";
import {
  getDatabaseHost,
  getDatabasePort,
  getDatabaseUsername,
  getDatabasePassword,
  getDatabaseName,
} from "../config";

import { SuggestionEntity, SuggestionVoteEntity } from "../entities";

import migrationChangeSets from "../migrations/change-sets";
import { LoggerFactory } from "../logger.factory";

const logger = LoggerFactory.getLogger("DB");

let dataSource: DataSource | undefined;

export const getDatabaseDataSource = () => {
  dataSource ??= new DataSource({
    type: "postgres",
    host: getDatabaseHost(),
    port: getDatabasePort(),
    username: getDatabaseUsername(),
    password: getDatabasePassword(),
    database: getDatabaseName(),
    entities: [SuggestionEntity, SuggestionVoteEntity],
    migrations: [...migrationChangeSets],
    migrationsRun: false,
    synchronize: false,
    logger: new TypeORMLogger(),
  });

  return dataSource;
};

export const getDatabaseConnection = async (): Promise<DataSource> => {
  dataSource = getDatabaseDataSource();

  if (!dataSource.isInitialized) {
    logger.info("Initializing...");
    dataSource = await dataSource.initialize();
  }

  return dataSource;
};

export const runMigrations = async () => {
  const dataSource = await getDatabaseConnection();
  logger.info("Running migrations...");
  return dataSource.runMigrations();
};

export class TypeORMLogger implements Logger {
  logQuery(
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    logger.debug({ query, parameters }, "query");
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    logger.error({ error, query, parameters }, "query failed: %o");
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    logger.warn(
      { query, parameters },
      "query is slow, excecution time: %d",
      time
    );
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner | undefined) {
    logger.info(message);
  }

  logMigration(message: string, queryRunner?: QueryRunner | undefined) {
    logger.info(message);
  }

  log(
    level: "warn" | "info" | "log",
    message: any,
    queryRunner?: QueryRunner | undefined
  ) {
    switch (level) {
      case "log":
        logger.trace(message);
        break;
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
    }
  }
}
