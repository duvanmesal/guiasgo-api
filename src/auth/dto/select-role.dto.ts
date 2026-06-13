import { IsIn } from 'class-validator';
import { API_ROLES } from '../../users/user-role.mapper';
import type { ApiRole } from '../../users/user-role.mapper';

export class SelectRoleDto {
  @IsIn(API_ROLES)
  role!: ApiRole;
}
