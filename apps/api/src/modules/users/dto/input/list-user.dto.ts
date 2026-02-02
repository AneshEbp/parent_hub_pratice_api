import { BasePaginationParams } from '@api/common/dto/base-pagination.dto';
import { InputType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ListUseProfilesDTO
 * @typedef {ListUseProfilesDTO}
 * @extends {BasePaginationParams}
 */
@InputType()
export class ListUseProfilesDTO extends BasePaginationParams {}
