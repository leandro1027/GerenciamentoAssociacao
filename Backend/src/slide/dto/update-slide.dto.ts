import { IsString, IsOptional } from 'class-validator';

export class UpdateSlideDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;
}
