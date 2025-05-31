import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726641465725 implements MigrationInterface {
    name = 'Migrations1726641465725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currencies" RENAME COLUMN "unix" TO "unit"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currencies" RENAME COLUMN "unit" TO "unix"`);
    }

}
