import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PagMetaDTO } from './page.dto';

@InputType()
export class ListingDto {
  @Field({ description: 'Pagination details.' })
  pageMeta: PagMetaDTO;
  @Field({
    nullable: true,
    description: 'Search text to search on the list.',
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @Field({
    nullable: true,
    description: 'Status',
  })
  @IsOptional()
  status?: string;
}
