import {ValueText} from 'onecore';

export interface MasterDataService {
  getStatus(): Promise<ValueText[]>;
  getTitles(): Promise<ValueText[]>;
  getPositions(): Promise<ValueText[]>;
  getGenders(): Promise<ValueText[]>;
}
