import {Model, SearchModel, ViewSearchService} from 'onecore';

export interface Audit {
  id: string;
  resource: string;
  userId: string;
  ip: string;
  action: string;
  timestamp: string;
  status: string;
  remark?: string;
}
interface Privilege {
  id: string;
  name: string;
  children?: Privilege[];
}
export interface AuditSM extends SearchModel {
  id?: string;
  resource?: string;
  userId?: string;
  ip?: string;
  action?: string;
  timestamp?: string;
  status?: string;
}
export interface AuditService extends ViewSearchService<Audit, string, AuditSM> {
}


export const auditModel: Model = {
  name: 'audit',
  attributes: {
    id: {
      length: 40,
      required: true,
      key: true
    },
    resource: {
      length: 100,
      required: true
    },
    userId: {
      length: 20
    },
    ip: {
      length: 20
    },
    action: {
      length: 20
    },
    timestamp: {
      type: 'datetime'
    },
    status: {
      length: 10
    },
    remark: {
      length: 100
    },
  }
};
