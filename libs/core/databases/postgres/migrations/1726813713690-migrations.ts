import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726813713690 implements MigrationInterface {
    name = 'Migrations1726813713690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "name" jsonb NOT NULL, "is_active" boolean NOT NULL, CONSTRAINT "PK_fbd367b0f90f065f0e54f858a6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "name" jsonb NOT NULL, "is_active" boolean NOT NULL, CONSTRAINT "PK_388636ba602c312da6026dc9dbc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "category_id" uuid NOT NULL, "type_id" uuid, "title" character varying NOT NULL, "content" text NOT NULL, "files" text array NOT NULL, "target_user_type" character varying, "createdBy" character varying NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_fbd367b0f90f065f0e54f858a6a" FOREIGN KEY ("type_id") REFERENCES "post_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_388636ba602c312da6026dc9dbc" FOREIGN KEY ("category_id") REFERENCES "post_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_388636ba602c312da6026dc9dbc"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_fbd367b0f90f065f0e54f858a6a"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "post_category"`);
        await queryRunner.query(`DROP TABLE "post_type"`);
    }

}
