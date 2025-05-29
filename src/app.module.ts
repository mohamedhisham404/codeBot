import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeModule } from './code/code.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DatabaseLlmModule } from './database-llm/database-llm.module';
import { DatabasePindingModule } from './database-pinding/database-pinding.module';

@Module({
  imports: [
    CodeModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    DatabaseLlmModule,
    DatabasePindingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
