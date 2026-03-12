import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './app/auth/auth.module';
import appConfig from './infrastrucutre/config/app.config';
import databaseConfig from './infrastrucutre/config/database.config';
import jwtConfig from './infrastrucutre/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),
    AuthModule,
  ],
})
export class AppModule {}
