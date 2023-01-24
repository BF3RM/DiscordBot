import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameToDescription1672096819849 implements MigrationInterface {
    name = 'RenameToDescription1672096819849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suggestion_entity" RENAME COLUMN "message" TO "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suggestion_entity" RENAME COLUMN "description" TO "message"`);
    }

}
