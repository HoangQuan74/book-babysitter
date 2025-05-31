import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1728471945611 implements MigrationInterface {
    name = 'Migrations1728471945611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_search" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "user_id" uuid NOT NULL, "search" text NOT NULL, CONSTRAINT "PK_b295b8ae981c72b0f10dad740eb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "notification_id" character varying NOT NULL, "platforms" text array NOT NULL, CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_targetreciever_enum" AS ENUM('all', 'special', 'babysitter', 'parent')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, "content" text NOT NULL, "targetReciever" "public"."notification_entity_targetreciever_enum" NOT NULL, "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_targetreciever_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "push_notification"`);
        await queryRunner.query(`DROP TABLE "post_search"`);
    }

}
