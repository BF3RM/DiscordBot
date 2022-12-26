import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImplementedBy1672096678696 implements MigrationInterface {
    name = 'AddImplementedBy1672096678696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suggestion_entity" ADD "implementedBy" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suggestion_entity" DROP COLUMN "implementedBy"`);
    }

}
