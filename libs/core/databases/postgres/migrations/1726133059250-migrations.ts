import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1726133059250 implements MigrationInterface {
    name = 'Migrations1726133059250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "review_translation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "review_id" uuid NOT NULL, "languageCode" character varying NOT NULL, "content" character varying NOT NULL, CONSTRAINT "UQ_00622232828c5e19f13eff59807" UNIQUE ("review_id", "languageCode"), CONSTRAINT "PK_365e37e548038e8ceacb207ba0f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9d742320f1c8189ba21979f08" ON "review_translation" ("review_id") `);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review_babysitters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "review_id" uuid NOT NULL, "babysitter_id" uuid NOT NULL, "parent_id" uuid NOT NULL, CONSTRAINT "PK_5379fbf749c561375abc4ee4046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b6fd3e084ae80cc3f0afa36663" ON "review_babysitters" ("review_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6c297dd6e4a4aef66b2869cd9" ON "review_babysitters" ("babysitter_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0cffc6e5307bba98d175d20e1" ON "review_babysitters" ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "rating_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "point" integer NOT NULL, "babysitter_id" uuid NOT NULL, "parent_id" uuid NOT NULL, CONSTRAINT "PK_a0711d87e1f30894eac82f7c8d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_57db132a4176f5bee557f23c12" ON "rating_users" ("babysitter_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8931c39dba4403eead4e5e4e24" ON "rating_users" ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "rating_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "content" text NOT NULL, "user_id" uuid NOT NULL, "rating_id" uuid, "parent_id" uuid, CONSTRAINT "REL_89902863791d8cb8c2613ce429" UNIQUE ("rating_id"), CONSTRAINT "PK_aa96a124b78a9e488e68905b69a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0e33c83f3f5d31f265dacc33ee" ON "rating_comments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_89902863791d8cb8c2613ce429" ON "rating_comments" ("rating_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_774360179311bf9e292c7f15e5" ON "rating_comments" ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "rating_comment_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deletedAt" TIMESTAMP, "url" character varying NOT NULL, "rating_comment_id" uuid NOT NULL, CONSTRAINT "PK_21b3e81c355be31bcca06192208" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8180f028120fa0f44403ef5912" ON "rating_comment_images" ("rating_comment_id") `);
        await queryRunner.query(`ALTER TABLE "review_translation" ADD CONSTRAINT "FK_f9d742320f1c8189ba21979f08a" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" ADD CONSTRAINT "FK_b6fd3e084ae80cc3f0afa36663f" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" ADD CONSTRAINT "FK_b6c297dd6e4a4aef66b2869cd9a" FOREIGN KEY ("babysitter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" ADD CONSTRAINT "FK_a0cffc6e5307bba98d175d20e1f" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_users" ADD CONSTRAINT "FK_57db132a4176f5bee557f23c124" FOREIGN KEY ("babysitter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_users" ADD CONSTRAINT "FK_8931c39dba4403eead4e5e4e243" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_comments" ADD CONSTRAINT "FK_774360179311bf9e292c7f15e56" FOREIGN KEY ("parent_id") REFERENCES "rating_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_comments" ADD CONSTRAINT "FK_89902863791d8cb8c2613ce4291" FOREIGN KEY ("rating_id") REFERENCES "rating_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_comments" ADD CONSTRAINT "FK_0e33c83f3f5d31f265dacc33eed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_comment_images" ADD CONSTRAINT "FK_8180f028120fa0f44403ef59128" FOREIGN KEY ("rating_comment_id") REFERENCES "rating_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating_comment_images" DROP CONSTRAINT "FK_8180f028120fa0f44403ef59128"`);
        await queryRunner.query(`ALTER TABLE "rating_comments" DROP CONSTRAINT "FK_0e33c83f3f5d31f265dacc33eed"`);
        await queryRunner.query(`ALTER TABLE "rating_comments" DROP CONSTRAINT "FK_89902863791d8cb8c2613ce4291"`);
        await queryRunner.query(`ALTER TABLE "rating_comments" DROP CONSTRAINT "FK_774360179311bf9e292c7f15e56"`);
        await queryRunner.query(`ALTER TABLE "rating_users" DROP CONSTRAINT "FK_8931c39dba4403eead4e5e4e243"`);
        await queryRunner.query(`ALTER TABLE "rating_users" DROP CONSTRAINT "FK_57db132a4176f5bee557f23c124"`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" DROP CONSTRAINT "FK_a0cffc6e5307bba98d175d20e1f"`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" DROP CONSTRAINT "FK_b6c297dd6e4a4aef66b2869cd9a"`);
        await queryRunner.query(`ALTER TABLE "review_babysitters" DROP CONSTRAINT "FK_b6fd3e084ae80cc3f0afa36663f"`);
        await queryRunner.query(`ALTER TABLE "review_translation" DROP CONSTRAINT "FK_f9d742320f1c8189ba21979f08a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8180f028120fa0f44403ef5912"`);
        await queryRunner.query(`DROP TABLE "rating_comment_images"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_774360179311bf9e292c7f15e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_89902863791d8cb8c2613ce429"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e33c83f3f5d31f265dacc33ee"`);
        await queryRunner.query(`DROP TABLE "rating_comments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8931c39dba4403eead4e5e4e24"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57db132a4176f5bee557f23c12"`);
        await queryRunner.query(`DROP TABLE "rating_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0cffc6e5307bba98d175d20e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6c297dd6e4a4aef66b2869cd9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6fd3e084ae80cc3f0afa36663"`);
        await queryRunner.query(`DROP TABLE "review_babysitters"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9d742320f1c8189ba21979f08"`);
        await queryRunner.query(`DROP TABLE "review_translation"`);
    }

}
