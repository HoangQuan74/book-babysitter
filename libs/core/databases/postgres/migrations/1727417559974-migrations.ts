import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727417559974 implements MigrationInterface {
    name = 'Migrations1727417559974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "FK_4f6d78b8e7684c136d29028f1fa"`);
        await queryRunner.query(`ALTER TABLE "request_contact" DROP CONSTRAINT "FK_6068324d576015dd3aadc167ca5"`);
        await queryRunner.query(`CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "notification_id" character varying NOT NULL, "platforms" text array NOT NULL, CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_targetreciever_enum" AS ENUM('all', 'special', 'babysitter', 'parent')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, "content" text NOT NULL, "targetReciever" "public"."notification_entity_targetreciever_enum" NOT NULL, "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP COLUMN "accuser_id"`);
        await queryRunner.query(`ALTER TABLE "request_contact" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_question" ADD "isRead" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_9e5e2eb56e3837b43e5a547be2" ON "requests" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_9e5e2eb56e3837b43e5a547be23" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_9e5e2eb56e3837b43e5a547be23"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e5e2eb56e3837b43e5a547be2"`);
        await queryRunner.query(`ALTER TABLE "request_question" DROP COLUMN "isRead"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "request_contact" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD "accuser_id" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_targetreciever_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "push_notification"`);
        await queryRunner.query(`ALTER TABLE "request_contact" ADD CONSTRAINT "FK_6068324d576015dd3aadc167ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD CONSTRAINT "FK_4f6d78b8e7684c136d29028f1fa" FOREIGN KEY ("accuser_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
