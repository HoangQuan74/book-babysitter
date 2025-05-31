import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726627305608 implements MigrationInterface {
    name = 'Migrations1726627305608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "postTypeId" character varying NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_58a149c4e88bf49036bc4c8c79f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "country" ADD "name" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "country" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "country" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "post_entity"`);
    }

}
