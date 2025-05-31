import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727077294959 implements MigrationInterface {
    name = 'Migrations1727077294959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."faqs_faq_type_enum" AS ENUM('babysitter', 'parent')`);
        await queryRunner.query(`CREATE TYPE "public"."faqs_display_status_enum" AS ENUM('display', 'hidden')`);
        await queryRunner.query(`CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "content" character varying NOT NULL, "order" integer NOT NULL, "language_id" uuid NOT NULL, "faq_type" "public"."faqs_faq_type_enum" NOT NULL, "display_status" "public"."faqs_display_status_enum" NOT NULL, CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cbe9f170319e1265206003acbc" ON "faqs" ("language_id") `);
        await queryRunner.query(`ALTER TABLE "faqs" ADD CONSTRAINT "FK_cbe9f170319e1265206003acbc7" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_cbe9f170319e1265206003acbc7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cbe9f170319e1265206003acbc"`);
        await queryRunner.query(`DROP TABLE "faqs"`);
        await queryRunner.query(`DROP TYPE "public"."faqs_display_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."faqs_faq_type_enum"`);
    }

}
