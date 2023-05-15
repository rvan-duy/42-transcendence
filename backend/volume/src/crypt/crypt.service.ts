import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  async hashPassword(password: string): Promise<string> {
    if (password === undefined)
      return undefined;
    const saltRounds = 4; // less secure but faster on codam macs
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    if (password === undefined)
      return false;
    return bcrypt.compare(password, hash);
  }
}
