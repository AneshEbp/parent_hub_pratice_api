import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

export const decodeJwtToken = async (
  token: string,
  secret: string,
): Promise<any> => {
  try {
    const jwt = new JwtService();
    return await jwt.verifyAsync(token, {
      secret: secret,
    });
  } catch (e: any) {
    if (e instanceof TokenExpiredError) {
      throw new UnauthorizedException('Token expired');
    } else {
      throw new UnauthorizedException('Token malformed');
    }
  }
};
