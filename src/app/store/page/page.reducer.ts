import { IPayloadAction } from '../helpers';
import { PageActions } from './page.actions';
import { IPageRecord } from './page.types';
import {
  INITIAL_STATE
} from './page.initial-state';

import {
  StatusMessagesFactory
} from '../helpers';

export function pageReducer(
  state: IPageRecord = INITIAL_STATE,
  action: IPayloadAction): IPageRecord {
  switch (action.type) {
    case PageActions.SET_MESSAGES:
      return state.merge({
        messages: StatusMessagesFactory(action.payload)
      });
    case PageActions.CLEAR_MESSAGES:
      return state.merge({
        messages: StatusMessagesFactory()
      });
    default:
      return state;
  }
}