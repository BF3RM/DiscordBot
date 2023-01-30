import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuggestionVotes1675116116113 implements MigrationInterface {
  name = "AddSuggestionVotes1675116116113";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."suggestion_vote_entity_type_enum" AS ENUM('UPVOTE', 'DOWNVOTE')`
    );
    await queryRunner.query(
      `CREATE TABLE "suggestion_vote_entity" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" text, "userId" character varying, "type" "public"."suggestion_vote_entity_type_enum" NOT NULL, "suggestionId" integer NOT NULL, CONSTRAINT "PK_b89e8920430328de1a9d062464c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion_entity" DROP COLUMN "upvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion_entity" DROP COLUMN "downvotes"`
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion_vote_entity" ADD CONSTRAINT "FK_21c5e3d02be7352180d5b937252" FOREIGN KEY ("suggestionId") REFERENCES "suggestion_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "suggestion_vote_entity" DROP CONSTRAINT "FK_21c5e3d02be7352180d5b937252"`
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion_entity" ADD "downvotes" text array NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "suggestion_entity" ADD "upvotes" text array NOT NULL`
    );
    await queryRunner.query(`DROP TABLE "suggestion_vote_entity"`);
    await queryRunner.query(
      `DROP TYPE "public"."suggestion_vote_entity_type_enum"`
    );
  }
}
