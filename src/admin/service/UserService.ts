import {ResultInfo, UserSM} from 'onecore';
import {GenericSearchDiffApprService} from 'onecore';
import {User} from '../model/User';

export interface UserService extends GenericSearchDiffApprService<User, number, number | ResultInfo<User>, UserSM> {
    loadUserByRoleID(id: number): Promise<User[]>;
}
