import { HttpRequest, ViewSearchClient } from 'web-clients';
import { auditModel } from '../../metadata/AuditModel';
import { Audit, AuditSM } from '../../model/Audit';
import { AuditService } from '../AuditService';

export class AuditClient extends ViewSearchClient<Audit, string, AuditSM> implements AuditService {
  constructor(http: HttpRequest, url: string) {
    super(http, url, auditModel.attributes);
  }
}
