import { ValueText } from 'onecore';
import * as React from 'react';
import 'react-day-picker/lib/style.css';
import { createModel, DispatchWithCallback, error } from 'react-hook-core';
import { RouteComponentProps } from 'react-router';
import { EditComponentParam, useEditProps } from 'src/core/hooks/useEdit';
import { formatter } from 'ui-plus';
import { emailOnBlur, Gender, inputEdit, phoneOnBlur, Status, storage } from 'uione';
import '../../assets/css//datepicker.css';
import { context } from '../app';
import { User } from '../model/User';

interface InternalState {
  user: User;
  titleList: ValueText[];
  positionList: ValueText[];
}

const createUser = (): User => {
  const user = createModel<User>();
  user.status = Status.Active;
  return user;
};

const initialize = (id: number, load: (id: number) => void, set: DispatchWithCallback<Partial<InternalState>>) => {
  const masterDataService = context.getMasterDataService();
  Promise.all([
    masterDataService.getTitles(),
    masterDataService.getPositions()
  ]).then(values => {
    const [titleList, positionList] = values;
    set({ titleList, positionList }, () => load(id));
  }).catch(err => error(err, storage.resource().value, storage.alert));
};
const updateTitle = (title: string, user: User, set: DispatchWithCallback<Partial<InternalState>>) => {
  user.title = title;
  user.gender = (user.title === 'Mr' ? Gender.Male : Gender.Female);
  set({ user });
};

const initialState: InternalState = {
  user: {} as User,
  titleList: [],
  positionList: []
};

const param: EditComponentParam<User, number, InternalState> = {
  createModel: createUser,
  initialize
};
export const UserForm = (props: RouteComponentProps) => {
  const refForm = React.useRef();
  const { state, setState, back, flag, updateState, saveOnClick, updatePhoneState, resource } = useEditProps<User, number, InternalState, RouteComponentProps>(props, refForm, initialState, context.getUserService(), inputEdit(), param);
  const user = state.user;
  return (
    <div className='view-container'>
      <form id='userForm' name='userForm' model-name='user' ref={refForm}>
        <header>
          <button type='button' id='btnBack' name='btnBack' className='btn-back' onClick={back} />
          <h2>{flag.newMode ? resource.create : resource.edit} {resource.user}</h2>
        </header>
        <div className='row'>
          <label className='col s12 m6'>
            {resource.user_id}
            <input
              type='text'
              id='userId'
              name='userId'
              value={user.userId}
              readOnly={!flag.newMode}
              onChange={updateState}
              maxLength={20} required={true}
              placeholder={resource.user_id} />
          </label>
          <label className='col s12 m6'>
            {resource.display_name}
            <input
              type='text'
              id='displayName'
              name='displayName'
              value={user.displayName}
              onChange={updateState}
              maxLength={40} required={true}
              placeholder={resource.display_name} />
          </label>
          <label className='col s12 m6'>
            {resource.person_title}
            <select
              id='title'
              name='title'
              value={user.title}
              onChange={e => updateTitle(e.target.value, state.user, setState)}>
              <option selected={true} value=''>{resource.please_select}</option>
              )
              {state.titleList.map((item, index) => (
                <option key={index} value={item.value}>{item.text}</option>)
              )}
            </select>
          </label>
          <label className='col s12 m6'>
            {resource.position}
            <select
              id='position'
              name='position'
              value={user.position}
              onChange={updateState}>
              <option selected={true} value=''>{resource.please_select}</option>
              {
                state.positionList.map((item, index) => (<option key={index} value={item.value}>{item.text}</option>))
              }
            </select>
          </label>
          <label className='col s12 m6'>
            {resource.phone}
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formatter.formatPhone(user.phone)}
              onChange={updatePhoneState}
              onBlur={phoneOnBlur}
              maxLength={17}
              placeholder={resource.phone} />
          </label>
          <label className='col s12 m6'>
            {resource.email}
            <input
              type='text'
              id='email'
              name='email'
              data-type='email'
              value={user.email}
              onChange={updateState}
              onBlur={emailOnBlur}
              maxLength={100}
              placeholder={resource.email} />
          </label>
          <label className='col s12 m6'>
            {resource.gender}
            <div className='radio-group'>
              <label>
                <input
                  type='radio'
                  id='gender'
                  name='gender'
                  onChange={updateState}
                  disabled={user.title !== 'Dr'}
                  value={Gender.Male} checked={user.gender === Gender.Male} />
                {resource.male}
              </label>
              <label>
                <input
                  type='radio'
                  id='gender'
                  name='gender'
                  onChange={updateState}
                  disabled={user.title !== 'Dr'}
                  value={Gender.Female} checked={user.gender === Gender.Female} />
                {resource.female}
              </label>
            </div>
          </label>
          <div className='col s12 m6 radio-section'>
            {resource.status}
            <div className='radio-group'>
              <label>
                <input
                  type='radio'
                  id='active'
                  name='status'
                  onChange={updateState}
                  value={Status.Active} checked={user.status === Status.Active} />
                {resource.yes}
              </label>
              <label>
                <input
                  type='radio'
                  id='inactive'
                  name='status'
                  onChange={updateState}
                  value={Status.Inactive} checked={user.status === Status.Inactive} />
                {resource.no}
              </label>
            </div>
          </div>
        </div>
        <footer>
          {!flag.readOnly &&
            <button type='submit' id='btnSave' name='btnSave' onClick={saveOnClick}>
              {resource.save}
            </button>}
        </footer>
      </form>
    </div>
  );
};
