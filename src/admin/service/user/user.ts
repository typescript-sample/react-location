import {GenericSearchDiffApprService, Model, ResultInfo, Tracking, UserSM} from 'onecore';

export interface User extends Tracking {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  imageURL?: string;
  status: string;
  gender?: string;
  phone?: string;
  title?: string;
  position?: string;
  roles?: string[];
}
export interface UserService extends GenericSearchDiffApprService<User, number, number | ResultInfo<User>, UserSM> {
  loadUserByRoleID(id: number): Promise<User[]>;
}

export const userModel: Model = {
  name: 'user',
  attributes: {
    userId: {
      length: 40,
      required: true,
      key: true
    },
    username: {
      length: 100,
      required: true
    },
    displayName: {
      length: 100,
      required: true
    },
    imageURL: {
      length: 255
    },
    gender: {
      length: 10
    },
    title: {
      length: 20
    },
    position: {
      length: 20
    },
    phone: {
      format: 'phone',
      length: 14
    },
    email: {
      length: 100
    },
    status: {
      length: 1
    },
    createdBy: {
      length: 40
    },
    createdAt: {
      type: 'datetime'
    },
    updatedBy: {
      length: 40
    },
    updatedAt: {
      type: 'datetime'
    }
  }
};
