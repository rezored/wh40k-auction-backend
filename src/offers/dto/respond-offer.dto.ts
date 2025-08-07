import { IsEnum } from 'class-validator';

export class RespondOfferDto {
  @IsEnum(['accept', 'reject'])
  response: 'accept' | 'reject';
}
