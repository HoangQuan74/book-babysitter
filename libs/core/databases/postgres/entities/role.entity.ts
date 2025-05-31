import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity('roles')
export class RoleEntity extends BaseEntity{
  @Column()
  name: string;
}