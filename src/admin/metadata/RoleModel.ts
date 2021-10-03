import {Model} from 'onecore';
import {userModel} from './UserModel';

export const roleModel: Model = {
  name: 'role',
  attributes: {
    roleId: {
      length: 40,
      key: true
    },
    roleName: {
      type: 'string' ,
      length: 120
    },
    remark: {
      length: 255
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
    },
    modules: {
      type: 'array'
    },
    users: {
      type: 'array',
      typeof: userModel.attributes
    }
  }
};
