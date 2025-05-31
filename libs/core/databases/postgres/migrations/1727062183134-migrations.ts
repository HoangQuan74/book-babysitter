import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727062183134 implements MigrationInterface {
    name = 'Migrations1727062183134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "is_published" TO "is_visiable"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" RENAME COLUMN "is_visiable" TO "is_published"`);
    }

}
