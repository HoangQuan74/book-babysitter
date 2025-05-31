import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1725506522679 implements MigrationInterface {
    name = 'Migrations1725506522679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "babysitter_special_service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "special_service_id" uuid NOT NULL, CONSTRAINT "PK_5e8959128ecadbda3869de3a343" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb8d95e9ba2788a54806b6302b" ON "babysitter_special_service" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_db820ffdcdb1cc6a0fcc0106df" ON "babysitter_special_service" ("special_service_id") `);
        await queryRunner.query(`CREATE TABLE "email_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "subject" character varying NOT NULL, "title" character varying NOT NULL, "action" character varying NOT NULL, "is_active" boolean NOT NULL, CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_071a95abc8068c7d82d21795dc" ON "email_template" ("action") `);
        await queryRunner.query(`CREATE TYPE "public"."user_otp_type_enum" AS ENUM('admin_login', 'user_signup', 'user_reset_password')`);
        await queryRunner.query(`ALTER TABLE "user_otp" ADD "type" "public"."user_otp_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'babysitter', 'parent')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_47732e92bab0d3dedaf94941a6" ON "user_otp" ("type") `);
        await queryRunner.query(`ALTER TABLE "babysitter_special_service" ADD CONSTRAINT "FK_bb8d95e9ba2788a54806b6302bd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "babysitter_special_service" ADD CONSTRAINT "FK_db820ffdcdb1cc6a0fcc0106dff" FOREIGN KEY ("special_service_id") REFERENCES "special_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "babysitter_special_service" DROP CONSTRAINT "FK_db820ffdcdb1cc6a0fcc0106dff"`);
        await queryRunner.query(`ALTER TABLE "babysitter_special_service" DROP CONSTRAINT "FK_bb8d95e9ba2788a54806b6302bd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47732e92bab0d3dedaf94941a6"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('admin', 'babysister', 'parent')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user_otp" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."user_otp_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_071a95abc8068c7d82d21795dc"`);
        await queryRunner.query(`DROP TABLE "email_template"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db820ffdcdb1cc6a0fcc0106df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb8d95e9ba2788a54806b6302b"`);
        await queryRunner.query(`DROP TABLE "babysitter_special_service"`);
    }

}
