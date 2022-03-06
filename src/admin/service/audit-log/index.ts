import { HttpRequest, ViewSearchClient } from 'web-clients';
import { Audit, auditModel, AuditService, AuditSM } from './audit-log';

export * from './audit-log';

export class AuditClient extends ViewSearchClient<Audit, string, AuditSM> implements AuditService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, auditModel.attributes);
  }
}
