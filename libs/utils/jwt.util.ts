import { IJwtPayload } from '@lib/common/interfaces';
import * as jwt from 'jsonwebtoken';

export class JwtUtil {
  constructor() {}

  generate(payload: object, secretKey: string): string {
    return jwt.sign(payload, secretKey);
  }

  static decode(token: string) {
    return jwt.decode(token);
  }

  static verify(token: string, secretKeyJwt: string) {
    return jwt.verify(token, secretKeyJwt, { ignoreExpiration: false });
  }
}
