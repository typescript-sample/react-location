import {Tracking} from 'onecore';
import {User} from './User';

export interface Role extends Tracking {
  roleId: string;
  roleName: string;
  status: string;
  remark?: string;
  privileges?: string[];
  users?: User[];
}

export interface Privilege {
  id: string;
  name: string;
  children?: Privilege[];
}
