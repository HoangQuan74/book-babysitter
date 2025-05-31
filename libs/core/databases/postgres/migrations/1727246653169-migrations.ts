import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1727246653169 implements MigrationInterface {
    name = 'Migrations1727246653169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "points" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "total_point" double precision NOT NULL DEFAULT '0', "baby_sitter_id" uuid NOT NULL, CONSTRAINT "REL_c58d339ebbc037e0220f8ce62d" UNIQUE ("baby_sitter_id"), CONSTRAINT "PK_57a558e5e1e17668324b165dadf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c58d339ebbc037e0220f8ce62d" ON "points" ("baby_sitter_id") `);
        await queryRunner.query(`CREATE TYPE "public"."point_logs_type_enum" AS ENUM('login', 'comment', 'post', 'rating')`);
        await queryRunner.query(`CREATE TABLE "point_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "point_added" double precision NOT NULL, "point_after" double precision NOT NULL, "point_id" uuid NOT NULL, "type" "public"."point_logs_type_enum" NOT NULL, CONSTRAINT "PK_c78d8cfd7aee69249ede4098534" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f30c43f62339442ee622d645ed" ON "point_logs" ("point_id") `);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_channel_enum" AS ENUM('push', 'email', 'sms')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_entity_status_enum" AS ENUM('waiting', 'sending', 'canceled', 'success')`);
        await queryRunner.query(`CREATE TABLE "notification_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "channel" "public"."notification_entity_channel_enum" NOT NULL, "status" "public"."notification_entity_status_enum" NOT NULL, CONSTRAINT "PK_112676de71a3a708b914daed289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "points" ADD CONSTRAINT "FK_c58d339ebbc037e0220f8ce62de" FOREIGN KEY ("baby_sitter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "point_logs" ADD CONSTRAINT "FK_f30c43f62339442ee622d645ed1" FOREIGN KEY ("point_id") REFERENCES "points"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "point_logs" DROP CONSTRAINT "FK_f30c43f62339442ee622d645ed1"`);
        await queryRunner.query(`ALTER TABLE "points" DROP CONSTRAINT "FK_c58d339ebbc037e0220f8ce62de"`);
        await queryRunner.query(`DROP TABLE "notification_entity"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entity_channel_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f30c43f62339442ee622d645ed"`);
        await queryRunner.query(`DROP TABLE "point_logs"`);
        await queryRunner.query(`DROP TYPE "public"."point_logs_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c58d339ebbc037e0220f8ce62d"`);
        await queryRunner.query(`DROP TABLE "points"`);
    }

}
