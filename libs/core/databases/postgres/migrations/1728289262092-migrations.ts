import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1728289262092 implements MigrationInterface {
    name = 'Migrations1728289262092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'confirmed', 'canceled', 'completed')`);
        await queryRunner.query(`CREATE TYPE "public"."booking_num_of_children_enum" AS ENUM('one', 'two', 'greater or equal three')`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "bookCode" character varying NOT NULL, "babysitter_id" uuid NOT NULL, "parent_id" uuid NOT NULL, "prices" integer NOT NULL, "currency_id" uuid NOT NULL, "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending', "address" character varying NOT NULL, "city_id" uuid NOT NULL, "num_of_children" "public"."booking_num_of_children_enum" NOT NULL, "confirmed_at" TIMESTAMP, "reasonCancel" character varying, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booking_time" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "booking_id" uuid NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "has_break_time" boolean NOT NULL, CONSTRAINT "PK_cc7698d79beedb6e236836eb342" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."booking_children_gender_enum" AS ENUM('son', 'daughter')`);
        await queryRunner.query(`CREATE TABLE "booking_children" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "booking_id" uuid NOT NULL, "gender" "public"."booking_children_gender_enum" NOT NULL, "dob" TIMESTAMP NOT NULL, CONSTRAINT "PK_efc2dcde3786fef5d56b79c1a67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "notification_id" character varying NOT NULL, "platforms" text array NOT NULL, CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_targetreciever_enum" AS ENUM('all', 'special', 'babysitter', 'parent')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, "content" text NOT NULL, "targetReciever" "public"."notification_entity_targetreciever_enum" NOT NULL, "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overal_rating"`);
        await queryRunner.query(`ALTER TABLE "post_comment_entity" ADD "comment_root_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "overall_rating" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avg_rating" double precision`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_98425caeb8e8902fbbf56bbfdcd" FOREIGN KEY ("babysitter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_674c5d06eb760bba9335c077ed8" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_c2d9dcdb58ce7445ab137457cf6" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_bbbeb01d72795492e9d468cc802" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_time" ADD CONSTRAINT "FK_7b363c05d57b54c6934eb4beaff" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_children" ADD CONSTRAINT "FK_7c653e1e4b6d7439b53f927cfdc" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_children" DROP CONSTRAINT "FK_7c653e1e4b6d7439b53f927cfdc"`);
        await queryRunner.query(`ALTER TABLE "booking_time" DROP CONSTRAINT "FK_7b363c05d57b54c6934eb4beaff"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_bbbeb01d72795492e9d468cc802"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_c2d9dcdb58ce7445ab137457cf6"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_674c5d06eb760bba9335c077ed8"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_98425caeb8e8902fbbf56bbfdcd"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avg_rating"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "overall_rating"`);
        await queryRunner.query(`ALTER TABLE "post_comment_entity" DROP COLUMN "comment_root_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "overal_rating" character varying`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_targetreciever_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "push_notification"`);
        await queryRunner.query(`DROP TABLE "booking_children"`);
        await queryRunner.query(`DROP TYPE "public"."booking_children_gender_enum"`);
        await queryRunner.query(`DROP TABLE "booking_time"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`DROP TYPE "public"."booking_num_of_children_enum"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    }

}
