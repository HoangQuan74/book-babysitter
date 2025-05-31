import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726628127115 implements MigrationInterface {
    name = 'Migrations1726628127115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD "name" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "cities" ADD "name" character varying NOT NULL`);
    }

}
