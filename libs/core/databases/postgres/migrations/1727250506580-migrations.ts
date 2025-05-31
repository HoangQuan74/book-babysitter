import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727250506580 implements MigrationInterface {
    name = 'Migrations1727250506580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_devcie" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "device_id" character varying NOT NULL, "fcm_token" character varying NOT NULL, "platform" character varying, "metadata" jsonb NOT NULL, CONSTRAINT "PK_13b23edb51c69257df285f02856" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_devcie" ADD CONSTRAINT "FK_42a2b766e4fe8a512c5302093f2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_devcie" DROP CONSTRAINT "FK_42a2b766e4fe8a512c5302093f2"`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "user_devcie"`);
    }

}
