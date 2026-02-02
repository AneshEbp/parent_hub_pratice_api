import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DisposableEmailRepository } from '@app/data-access';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly disposableEmailRepository: DisposableEmailRepository,
    private readonly i18nService: I18nService,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    try {
      const splitted = value.split('@');
      const domain = splitted[splitted.length - 1];
      const exists = await this.disposableEmailRepository.findOne({
        domain,
      });
      return !exists;
    } catch (err) {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return this.i18nService.t('users.disposable_email_not_allowed');
  }
}

export function IsNonDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsNonDisposableEmail',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsValidEmailConstraint,
    });
  };
}
