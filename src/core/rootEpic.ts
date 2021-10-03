import {combineEpics} from 'redux-observable';
import {EpicFormatter} from 'redux-plus';
/*
import {bankEpics} from '../setup/component/bank/BankObservableEpics';
import {externalSysEpics} from '../setup/component/external-system/ExternalSystemObservableEpics';
import {payeeEpics} from '../setup/component/payee/PayeeObservableEpics';
import {payerEpics} from '../setup/component/payer/PayerObservableEpics';
import {transactionFeeEpics} from '../setup/component/transaction-fee/TransasctionFeeObservableEpics';
*/
const epicComponents = [
  /*
  payerEpics,
  payeeEpics,
  externalSysEpics,
  bankEpics,
  transactionFeeEpics,
  */
];
export const rootEpic = combineEpics(
  ...EpicFormatter.formatEpicComponents(epicComponents)
);
