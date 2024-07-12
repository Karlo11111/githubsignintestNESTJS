import { Controller, Get, Req, Res, UseGuards, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class TokenStorage {
  private tokens: Map<string, string> = new Map();

  setToken(userId: string, token: string) {
    this.tokens.set(userId, token);
  }

  getToken(userId: string): string | undefined {
    return this.tokens.get(userId);
  }
}

@Controller('api/github')
export class GitHubController {
  constructor(
    private configService: ConfigService,
    private tokenStorage: TokenStorage
  ) {}

  @Get('auth')
  async initiateGitHubAuth(@Res() res: Response) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI');
    const scope = 'repo'; // Request access to repositories

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    return res.json({ authUrl });
  }

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    // After successful GitHub auth, you'll have access to the GitHub access token
    const githubAccessToken = req.user['accessToken'];

    // Here, we're storing the token locally
    // In a real app, you'd use the actual user ID instead of a hardcoded value
    const userId = 'testUser123';
    this.tokenStorage.setToken(userId, githubAccessToken);

    console.log(`Stored GitHub token for user ${userId}`);

    // Redirect back to the frontend
    res.redirect('/profile');
  }

  @Get('token')
  getGithubToken(@Req() req: Request, @Res() res: Response) {
    // In a real app, you'd get the userId from the authenticated session
    const userId = 'testUser123';
    const token = this.tokenStorage.getToken(userId);

    if (token) {
      res.json({ token });
    } else {
      res.status(404).json({ message: 'Token not found' });
    }
  }
}