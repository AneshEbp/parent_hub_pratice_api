import { Controller, Get, HttpStatus, Res, Body, Post } from '@nestjs/common';
import { Response } from 'express';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AppleSingInController
 * @typedef {AppleSingInController}
 */
@Controller('apple')
export class AppleSingInController {
  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {*} body
   * @param {Response} res
   * @returns {Promise<void>}
   */
  @Post('signin-callback')
  async appleSignIn(@Body() body, @Res() res: Response) {
    console.log('urls is', `${process.env.ANDROID_SCHEME}?body=${JSON.stringify(body)}`);

    res.redirect(
      307,
      `intent://callback?${new URLSearchParams(
        body,
      ).toString()}#Intent;package=${process.env.ANDROID_PACKAGE_NAME};scheme=signinwithapple;end`,
    );
  }
  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {*} body
   * @param {Response} res
   * @returns {Promise<any>}
   */
  @Get('signin-callback')
  async appleSignInGetToken(@Body() body, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({});
  }
}
