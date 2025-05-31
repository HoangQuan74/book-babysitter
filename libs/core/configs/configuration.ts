import { scheduler } from 'timers/promises';

export const configuration = () => ({
  docs: 'api',
  adminGateway: {
    port: process.env.ADMIN_GATEWAY_PORT || 3000,
  },
  userGateway: {
    port: process.env.USER_GATEWAY_PORT || 3030,
  },
  socketGateway: {
    host: process.env.SOCKET_GATEWAY_HOST || '0.0.0.0',
    port: process.env.SOCKET_GATEWAY_PORT || 3060,
  },
  authService: {
    transport: 0,
    options: {
      host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
      port: process.env.AUTH_SERVICE_PORT || 3001,
    },
  },
  notifyService: {
    transport: 0,
    options: {
      host: process.env.NOTIFY_SERVICE_HOST || '0.0.0.0',
      port: process.env.NOTIFY_SERVICE_PORT || 3002,
    },
  },
  configService: {
    transport: 0,
    options: {
      host: process.env.CONFIG_SERVICE_HOST || '0.0.0.0',
      port: process.env.CONFIG_SERVICE_PORT || 3003,
    },
  },
  chatService: {
    transport: 0,
    options: {
      host: process.env.CHAT_SERVICE_HOST || '0.0.0.0',
      port: process.env.CHAT_SERVICE_PORT || 3004,
    },
  },
  postService: {
    transport: 0,
    options: {
      host: process.env.POST_SERVICE_HOST || '0.0.0.0',
      port: process.env.POST_SERVICE_PORT || 3005,
    },
  },
  pointService: {
    transport: 0,
    options: {
      host: process.env.POINT_SERVICE_HOST || '0.0.0.0',
      port: process.env.POINT_SERVICE_PORT || 3006,
    },
  },
  reportService: {
    transport: 0,
    options: {
      host: process.env.REPORT_SERVICE_HOST || '0.0.0.0',
      port: process.env.REPORT_SERVICE_PORT || 3007,
    },
  },
  bookingService: {
    transport: 0,
    options: {
      host: process.env.BOOKING_SERVICE_HOST || '0.0.0.0',
      port: process.env.BOOKING_SERVICE_PORT || 3008,
    },
  },
  cronService: {
    transport: 0,
    options: {
      host: process.env.CRON_SERVICE_HOST || '0.0.0.0',
      port: process.env.CRON_SERVICE_PORT || 3010,
    },
  },
  scheduler: {
    time: process.env.SCHEDULER_TIME || '*/30 * * * *',
    reminder3HoursLeftTime: process.env.REMINDER_3HOURS_LEFT_TIME || '0 * * * *',
    reminder23HoursLeftTime: process.env.REMINDER_23HOURS_LEFT_TIME || '15 * * * *',
    rejectedAfter48Hours: process.env.REJECTED_AFTER_48HOURS || '30 * * * *',
    hardDeleteUser: process.env.HARD_DELETE_USER || '0 0 * * *',
    updateStatusBookingComplete: process.env.UPDATE_STATUS_BOOKING_COMPLETE || '45 * * * *',
  },
  db: {
    postgres: {
      type: process.env.DB_TYPE || 'postgres',
      synchronize: process.env.ENV !== 'develop' ? true : false,
      autoLoadEntities: true,
      logging: process.env.ENV !== 'develop' ? true : false,
      host: process.env.DB_HOST || '0.0.0.0',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'genutrip',
      // ssl: {
      //   rejectUnauthorized: false,
      // },
    },
    mongodb: {
      uri: `mongodb://${process.env.MONGO_USER || 'admin'}:${
        process.env.MONGO_PASSWORD || 'admin'
      }@${process.env.DB_MONGO_HOST || '127.0.0.1'}:${
        process.env.DB_MONGO_PORT || 27017
      }?directConnection=true`,
    },
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'admin',
      },
    },
  },
  jwt: {
    accessExpired: 36000,
    refreshExpired: 96000,
  },
  aws: {
    s3: {
      region: process.env.S3_REGION || 'ap-southeast-1',
      bucket: process.env.S3_BUCKET || 'dev-gtrip',
      expiredTime: process.env.S3_URL_EXPIRED || 3600,
      credentials: {
        secretAccessKey: process.env.S3_SECRET_KEY,
        accessKeyId: process.env.S3_ACCESS_KEY,
      },
    },
    ses: {
      region: process.env.S3_REGION || 'ap-southeast-1',
      sender: process.env.SES_SENDER || 'noreply@sanbul.net',
      credentials: {
        secretAccessKey: process.env.S3_SECRET_KEY,
        accessKeyId: process.env.S3_ACCESS_KEY,
      },
    },
  },
  googleAuthId: process.env.OAUTH_GOOGLE_ID,
  googleAuthSecret: process.env.OAUTH_GOOGLE_SECRET,
  googleAuthRedirectUrl: process.env.OAUTH_GOOGLE_REDIRECT_URL,
  fcm: {
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PROJECT_KEY,
    clientEmail: process.env.CLIENT_MAIL,
  },
});
