import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import * as fs from 'fs';
import * as https from 'https';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaUserService: PrismaUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(intraId: number, name: string): Promise<any>{
    return await this.prismaUserService.findOrCreateUser({intraId, name});
  }

  async downloadFile(url: string, folderPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const fileName = url.substring(url.lastIndexOf('/') + 1);
      const filePath = `${folderPath}/${fileName}`;
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {
          reject(err);
        });
      });
    });
  }

  login(user: any) {
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
