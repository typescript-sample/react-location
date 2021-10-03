import {Model} from 'onecore';

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
