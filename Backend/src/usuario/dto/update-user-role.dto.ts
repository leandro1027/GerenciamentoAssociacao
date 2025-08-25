import { IsString, IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['USER', 'ADMIN'])
  role: string;
}
