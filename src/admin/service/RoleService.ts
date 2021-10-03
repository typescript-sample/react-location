import {ResultInfo, RoleSM} from 'onecore';
import {GenericSearchDiffApprService} from 'onecore';
import {Privilege, Role} from '../model/Role';

export interface RoleService extends GenericSearchDiffApprService<Role, any, number|ResultInfo<Role>, RoleSM> {
  getPrivileges?(ctx?: any): Promise<Privilege[]>;
}
