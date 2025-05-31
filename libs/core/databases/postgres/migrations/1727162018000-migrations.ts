import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727162018000 implements MigrationInterface {
    name = 'Migrations1727162018000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "granted_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "granted_at" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
    }

}
