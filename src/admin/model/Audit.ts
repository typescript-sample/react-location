import {SearchModel} from 'onecore';

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

export interface Privilege {
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
