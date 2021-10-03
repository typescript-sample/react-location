import {Tracking} from 'onecore';

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
