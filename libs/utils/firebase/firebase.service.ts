import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(private readonly configService: ConfigService) {
    this.init();
  }

  init() {
    const firebaseConfig = this.configService.get('fcm');
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
  }

  async sendFCM(deviceToken: string, notification, params) {
    try {
      const message = {
        token: deviceToken,
        notification,
        data: params,
      };
      await admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log('🚀 ~ FirebaseService ~ .then ~ response:', response);
        });
    } catch (error) {
      console.log('🚀 ~ FirebaseService ~ sendFCM ~ error:', error);
    }
  }
}
