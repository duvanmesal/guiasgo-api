import { IsIn } from 'class-validator';

export const USER_STATUSES = ['active', 'pending', 'suspended'] as const;
export type ApiUserStatus = (typeof USER_STATUSES)[number];

export class UpdateUserStatusDto {
  @IsIn(USER_STATUSES)
  status!: ApiUserStatus;
}
