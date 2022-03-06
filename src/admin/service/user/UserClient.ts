import {ResultInfo, UserSM} from 'onecore';
import {GenericSearchDiffApprClient, json, resources} from 'web-clients';
import {HttpRequest} from 'web-clients';
import {userModel} from '../../metadata/UserModel';
import {User} from '../../model/User';
import {UserService} from '../UserService';

export class UserClient extends GenericSearchDiffApprClient<User, number, number|ResultInfo<User>, UserSM> implements UserService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, userModel.attributes, null);
    this.searchGet = true;
  }
  async load(id: number, ctx?: any): Promise<User> {
      let url = this.serviceUrl + '/' + id;
      url = this.serviceUrl + '/' + id;
      const obj = await this.http.get<User>(url);
      return json(obj, this._metamodel);
  }

  async loadUserByRoleID(id: number): Promise<User[]> {
      const url = `${this.serviceUrl}?roleId=${id}`;
      return this.http.get<User[]>(url);
  }
  protected postOnly(s: UserSM): boolean {
    return true;
  }
  patch(obj: User, ctx?: any): Promise<ResultInfo<User>> {
    let url = this.serviceUrl;
    const ks = this.keys();
    if (ks && ks.length > 0) {
      for (const name of ks) {
        url += '/' + obj[name];
      }
    }
    const me = this._metamodel;
    return this.http.patch<ResultInfo<User>>(url, obj).then(res => {
      if (!me) {
        return res;
      }
      return res;
    }).catch(err => {
      if (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data.status === 404 || data.status === 410) {
          let x: any = 0;
          if (resources.status) {
            x = resources.status.not_found;
          }
          return x;
        } else if (data.status === 409) {
          let x: any = -1;
          if (resources.status) {
            x = resources.status.version_error;
          }
          return x;
        } else if (data.status === 422) {
          if (err.response && err.response.data) {
            return err.response.data;
          } else {
            throw err;
          }
        }
      }
      throw err;
    });
    /*
    if (!this._metamodel) {
      return res;
    }
    return res;
    try {
      let url = this.serviceUrl;
      const ks = this.keys();
      if (ks && ks.length > 0) {
        for (const name of ks) {
          url += '/' + obj[name];
        }
      }
      const res = await this.http.patch<ResultInfo<User>>(url, obj);
      if (!this._metamodel) {
        return res;
      }
      return res;
      // return this.formatResultInfo(res, ctx);
    } catch (err) {
      if (err) {
        const data = (err &&  err.response) ? err.response : err;
        if (data.status === 404 || data.status === 410) {
          let x: any = 0;
          if (resources.status) {
            x = resources.status.NotFound;
          }
          return x;
        } else if (data.status === 409) {
          let x: any = -1;
          if (resources.status) {
            x = resources.status.VersionError;
          }
          return x;
        }
      }
      throw err;
    }
    */
  }
}
