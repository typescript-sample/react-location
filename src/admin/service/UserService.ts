import {ResultInfo, UserFilter} from 'onecore';
import {GenericSearchDiffApprService} from 'onecore';
import {User} from '../model/User';

export interface UserService extends GenericSearchDiffApprService<User, number, number | ResultInfo<User>, UserFilter> {
    loadUserByRoleID(id: number): Promise<User[]>;
}
