import {ViewSearchService} from 'onecore';
import {Audit, AuditFilter} from '../model/Audit';

export interface AuditService extends ViewSearchService<Audit, string, AuditFilter> {
}
