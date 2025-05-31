import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726718748896 implements MigrationInterface {
    name = 'Migrations1726718748896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "special_service" RENAME COLUMN "sort_content" TO "short_content"`);
        await queryRunner.query(`ALTER TABLE "special_service" DROP COLUMN "short_content"`);
        await queryRunner.query(`ALTER TABLE "special_service" ADD "short_content" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "special_service" DROP COLUMN "short_content"`);
        await queryRunner.query(`ALTER TABLE "special_service" ADD "short_content" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "special_service" RENAME COLUMN "short_content" TO "sort_content"`);
    }

}
