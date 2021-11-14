import {ResultInfo, RoleFilter} from 'onecore';
import {GenericSearchDiffApprClient} from 'web-clients';
import {HttpRequest} from 'web-clients';
import {json} from 'web-clients/src/json';
import {roleModel} from '../../metadata/RoleModel';
import {Privilege, Role} from '../../model/Role';
import {RoleService} from '../RoleService';

export class RoleClient extends GenericSearchDiffApprClient<Role, any, number|ResultInfo<Role>, RoleFilter> implements RoleService {
  constructor(http: HttpRequest, url: string, protected privilegeUrl) {
    super(http, url, roleModel.attributes, null);
  }
  assign(objs: string[], roleId: string, ctx?: any): Promise<any> {
    return this.http.put<string[]>(`${this.serviceUrl}/${roleId}/assign`, objs).then(res => {
      if (!this._metamodel) {
        return res;
      }
      return this.formatResultInfo(res, ctx);
    });
  }
  protected formatResultInfo(result: any, ctx?: any): any {
    if (this._metamodel && result && typeof result === 'object' && result.status === 1 && result.value && typeof result.value === 'object') {
      result.value = json(result.value, this._metamodel);
    }
    return result;
  }

  getPrivileges(ctx?: any): Promise<Privilege[]> {
    return this.http.get<Privilege[]>(this.privilegeUrl);
  }
/*
  protected formatObject(obj): AccessRole {
    const role: AccessRole = super.formatObject(obj);
    if (role.modules) {
      role.modules.forEach(module => {
          module.showName = module.parentId ? module.parentId + '->' + module.moduleName : module.moduleName;
      });
    }
    return role;
  }
  */
}
