import {ViewSearchService} from 'onecore';
import {Audit, AuditSM} from '../model/Audit';

export interface AuditService extends ViewSearchService<Audit, string, AuditSM> {
}
