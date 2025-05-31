import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727079815200 implements MigrationInterface {
    name = 'Migrations1727079815200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "created_by" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_f301b1a7645cc70f7c15f982e66" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_f301b1a7645cc70f7c15f982e66"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "created_by" character varying NOT NULL`);
    }

}
