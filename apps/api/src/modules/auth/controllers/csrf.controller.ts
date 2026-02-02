import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';

declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

@Controller('csrf')
export class CsrfController {
  @SkipThrottle()
  @Get('getCsrfToken')
  getCsrfToken(@Req() request: Request) {
    // Return the CSRF token
    console.log(request.cookies);
    return { csrfToken: request.csrfToken() };
  }
}
