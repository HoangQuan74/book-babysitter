import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727861197004 implements MigrationInterface {
    name = 'Migrations1727861197004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_view_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "postId" character varying NOT NULL, "viewerId" character varying NOT NULL, "post_id" uuid, CONSTRAINT "PK_c79987d4e75a9dba8616351486e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_comment_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "post_id" uuid NOT NULL, "user_id" character varying NOT NULL, "content" text NOT NULL, "comment_parent_id" character varying NOT NULL, CONSTRAINT "PK_090b8b67b6e7e02dc514bb296da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "notification_id" character varying NOT NULL, "platforms" text array NOT NULL, CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_targetreciever_enum" AS ENUM('all', 'special', 'babysitter', 'parent')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, "content" text NOT NULL, "targetReciever" "public"."notification_entity_targetreciever_enum" NOT NULL, "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post_view_entity" ADD CONSTRAINT "FK_9c35aafdc6dccc6d3fb69455366" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_comment_entity" ADD CONSTRAINT "FK_f25ad17441371ae83c09ab9f6a5" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_comment_entity" DROP CONSTRAINT "FK_f25ad17441371ae83c09ab9f6a5"`);
        await queryRunner.query(`ALTER TABLE "post_view_entity" DROP CONSTRAINT "FK_9c35aafdc6dccc6d3fb69455366"`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_targetreciever_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "push_notification"`);
        await queryRunner.query(`DROP TABLE "post_comment_entity"`);
        await queryRunner.query(`DROP TABLE "post_view_entity"`);
    }

}
