import { compareSync, hashSync, genSaltSync } from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const saltRounds = genSaltSync(parseInt(process.env.SALT_ROUNDS));

export const hashPassword = (password: string): string => {
  return hashSync(password, saltRounds);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};
