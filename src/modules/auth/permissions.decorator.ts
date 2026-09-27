import { SetMetadata } from '@nestjs/common';
import { ModuleKey } from '../../common/rbac';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...perms: ModuleKey[]) => SetMetadata(PERMISSIONS_KEY, perms);
