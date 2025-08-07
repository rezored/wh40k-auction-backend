import { IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
