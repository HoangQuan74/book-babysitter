import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727079117204 implements MigrationInterface {
    name = 'Migrations1727079117204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "is_visiable" TO "is_visible"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "is_visible" TO "is_visiable"`);
    }

}
