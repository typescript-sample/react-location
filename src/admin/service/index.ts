import axios from 'axios';
import { HttpRequest } from 'axios-core';
import { options, storage } from 'uione';
import { AuditClient } from './audit-log';
import { MasterDataClient, MasterDataService } from './master-data';
import { RoleClient } from './role';
import { UserClient } from './user';

export * from './role';
export * from './user';
export * from './audit-log';

const httpRequest = new HttpRequest(axios, options);
export interface Config {
  user_url: string;
  role_url: string;
  privilege_url: string;
  audit_log_url: string;
}
class ApplicationContext {
  private masterDataService: MasterDataService;
  private roleService: RoleClient;
  private userService: UserClient;
  private auditService: AuditClient;
  getConfig(): Config {
    return storage.config();
  }
  getMasterDataService(): MasterDataService {
    if (!this.masterDataService) {
      this.masterDataService = new MasterDataClient();
    }
    return this.masterDataService;
  }

  getRoleService(): RoleClient {
    if (!this.roleService) {
      const c = this.getConfig();
      this.roleService = new RoleClient(httpRequest, c.role_url, c.privilege_url);
    }
    return this.roleService;
  }
  getUserService(): UserClient {
    if (!this.userService) {
      const c = this.getConfig();
      this.userService = new UserClient(httpRequest, c.user_url);
    }
    return this.userService;
  }
  getAuditService(): AuditClient {
    if (!this.auditService) {
      const c = this.getConfig();
      this.auditService = new AuditClient(httpRequest, c.audit_log_url);
    }
    return this.auditService;
  }
}

export const context = new ApplicationContext();
