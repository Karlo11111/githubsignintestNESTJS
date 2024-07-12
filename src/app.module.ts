import { Module } from '@nestjs/common';
import { GitHubController, TokenStorage } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [GitHubController],
  providers: [TokenStorage, GitHubController],
})
export class AppModule {}
