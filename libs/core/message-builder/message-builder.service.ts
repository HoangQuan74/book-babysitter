import {
  HttpException,
  Injectable,
  OnApplicationShutdown,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { catchError, firstValueFrom, lastValueFrom, of } from 'rxjs';

@Injectable()
export class MessageBuilder implements OnApplicationShutdown {
  private instances: Map<string, ClientProxy> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onApplicationShutdown(signal?: string) {
    this.instances.clear();
  }

  createInstance(service: string) {
    if (this.instances.has(service)) return this.instances.get(service);
    const client = ClientProxyFactory.create(this.configService.get(service));
    this.instances.set(service, client);
    return client;
  }

  async sendMessage(
    service: string,
    message: unknown,
    pattern: {
      cmd: string;
    },
  ) {
    try {
      const response = this.createInstance(service)
        .send(pattern, message)
        .pipe();
      const result = await firstValueFrom(response);
      console.log('🚀 ~ MessageBuilder ~ result:', result);
      const { data = null, errorMessage, errorCode } = result;
      if (errorMessage) {
        throw new HttpException({ message: errorMessage, data }, errorCode);
      }
      return result;
    } catch (error) {
      throw new HttpException(
        { message: error?.message || error, data: null },
        error?.status || 503,
      );
    }
  }
}
