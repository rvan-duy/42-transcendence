import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from '../user/prisma/prismaUser.service';
import * as fs from 'fs';
import * as https from 'https';

enum Debug {
  ENABLED = 0
}

/**
 * Service for managing authentication.
*/
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaUserService: PrismaUserService,
    private readonly jwtService: JwtService,
    ) {}
    
    /**
     * Validates a user and returns its data, if the user exists in the database, or creates it.
     * @param intraId Intra ID of the user to validate
     * @param name Name of the user to validate
     * @returns The user's data, if the user exists in the database
    */
   async validateUser(intraId: number, name: string): Promise<any> {
     let user;
     
     do {
       user = await this.prismaUserService.findOrCreateUser({ intraId, name });
       
       if (user === undefined) {
         name += 'Ruben';
        }
      } while (user === undefined);
      
      return user;
    }
    
    /**
     * Logs in a user and returns a JWT token.
     * @param user Data of the user to log in, JSON object containing the user's ID and name
     * @param isSecondFactorAuthenticated Whether the user has already been authenticated with a second factor
     * @returns The JWT token
    */
   login(user: any, isSecondFactorAuthenticated = false): any {
     const payload = {
       username: user.name,
       sub: user.id,
       isSecondFactorAuthenticated: isSecondFactorAuthenticated,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    
    /**
     * Downloads a user's profile picture.
     * @param userId User ID of the user to download the profile picture of
     * @param url URL of the profile picture to download
     * @param folderPath Path of the folder to download the profile picture to
     * @returns A promise that resolves when the profile picture has been downloaded
    */
   async downloadFile(userId: number, url: string, folderPath: string): Promise<void> {
     return new Promise<void>((resolve, reject) => {
       const fileName = 'user_' + userId + '.png';
       const filePath = `${folderPath}/${fileName}`;
       const file = fs.createWriteStream(filePath);
       
       https.get(url, (response) => {
         response.pipe(file);
         file.on('finish', () => {
           file.close();
           if (Debug.ENABLED)
            console.log(`📷 Profile picture downloaded to ${filePath}`);
           resolve();
          });
        }).on('error', (err) => {
          fs.unlink(filePath, () => {
            if (Debug.ENABLED)
              console.log('💥 Error downloading profile picture', err);
            reject(err);
          });
        });
      });
    }
  }