import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuggestions1670273970376 implements MigrationInterface {
    name = 'AddSuggestions1670273970376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."suggestion_entity_status_enum" AS ENUM('PENDING', 'APPROVED', 'DENIED', 'IMPLEMENTED')`);
        await queryRunner.query(`CREATE TABLE "suggestion_entity" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" text, "channelId" character varying NOT NULL, "messageId" character varying, "threadId" character varying, "suggestedBy" character varying NOT NULL, "status" "public"."suggestion_entity_status_enum" NOT NULL DEFAULT 'PENDING', "title" character varying NOT NULL, "message" character varying NOT NULL, "imageUrl" character varying, "responseBy" character varying, "responseReason" character varying, "upvotes" text array NOT NULL, "downvotes" text array NOT NULL, CONSTRAINT "PK_14e03963551474b08b8f91ceafa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "suggestion_entity"`);
        await queryRunner.query(`DROP TYPE "public"."suggestion_entity_status_enum"`);
    }

}
