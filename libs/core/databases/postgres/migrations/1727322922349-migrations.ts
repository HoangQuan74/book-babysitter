import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727322922349 implements MigrationInterface {
    name = 'Migrations1727322922349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."requests_type_enum" AS ENUM('question', 'report', 'contact_request', 'absence')`);
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'in_progress', 'success')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "type" "public"."requests_type_enum" NOT NULL, "status" "public"."requests_status_enum" NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "request_id" uuid NOT NULL, "user_id" uuid NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_8a52662b6675543392c42e613ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "request_id" uuid NOT NULL, "accuser_id" uuid NOT NULL, "accused_id" uuid NOT NULL, "reason" text NOT NULL, "answer" text, "answer_id" uuid, "answered_at" TIMESTAMP, CONSTRAINT "REL_84fa7b7f66ed31b4baec1ffc1a" UNIQUE ("request_id"), CONSTRAINT "PK_0c224d3c050ff241390da56f127" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "request_id" uuid NOT NULL, "user_id" uuid NOT NULL, "phone" character varying NOT NULL, CONSTRAINT "REL_e780837bcd8e2c566fad78bfc1" UNIQUE ("request_id"), CONSTRAINT "PK_a56a2230fdf271ee0445ed985ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "notification_id" character varying NOT NULL, "platforms" text array NOT NULL, CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_targetreciever_enum" AS ENUM('all', 'special', 'babysitter', 'parent')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, "content" text NOT NULL, "targetReciever" "public"."notification_entity_targetreciever_enum" NOT NULL, "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "request_question" ADD CONSTRAINT "FK_7f5f31ebccf5912ebf6a2dd098e" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_question" ADD CONSTRAINT "FK_27e267869482fc1fa7e133e68ae" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD CONSTRAINT "FK_84fa7b7f66ed31b4baec1ffc1a3" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD CONSTRAINT "FK_4f6d78b8e7684c136d29028f1fa" FOREIGN KEY ("accuser_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD CONSTRAINT "FK_ac03f340730219c746e806e9e80" FOREIGN KEY ("accused_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_report" ADD CONSTRAINT "FK_e60d6096634673192f798adc597" FOREIGN KEY ("answer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_contact" ADD CONSTRAINT "FK_e780837bcd8e2c566fad78bfc13" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_contact" ADD CONSTRAINT "FK_6068324d576015dd3aadc167ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_contact" DROP CONSTRAINT "FK_6068324d576015dd3aadc167ca5"`);
        await queryRunner.query(`ALTER TABLE "request_contact" DROP CONSTRAINT "FK_e780837bcd8e2c566fad78bfc13"`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "FK_e60d6096634673192f798adc597"`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "FK_ac03f340730219c746e806e9e80"`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "FK_4f6d78b8e7684c136d29028f1fa"`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "FK_84fa7b7f66ed31b4baec1ffc1a3"`);
        await queryRunner.query(`ALTER TABLE "request_question" DROP CONSTRAINT "FK_27e267869482fc1fa7e133e68ae"`);
        await queryRunner.query(`ALTER TABLE "request_question" DROP CONSTRAINT "FK_7f5f31ebccf5912ebf6a2dd098e"`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_targetreciever_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP TABLE "push_notification"`);
        await queryRunner.query(`DROP TABLE "request_contact"`);
        await queryRunner.query(`DROP TABLE "request_report"`);
        await queryRunner.query(`DROP TABLE "request_question"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."requests_type_enum"`);
    }

}
