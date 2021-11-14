import { UserFilter, ValueText } from 'onecore';
import * as React from 'react';
import { buildFromUrl, DispatchWithCallback, ModelProps } from 'react-onex';
import PageSizeSelect from 'react-page-size-select';
import Pagination from 'react-pagination-x';
import { useHistory } from 'react-router-dom';
import { mergeFilter } from 'search-utilities';
import { pageSizes, SearchComponentState, useSearch } from 'src/core/hooks/useSearch';
import UserCarousel from 'src/users_carousel/app';
import { handleError, inputSearch, storage } from 'uione';
import femaleIcon from '../../assets/images/female.png';
import maleIcon from '../../assets/images/male.png';
import { context } from '../app';
import { User } from '../model/User';

interface UserSearch extends SearchComponentState<User, UserFilter> {
  statusList: ValueText[];
}
const sm: UserFilter = {
  userId: '',
  username: '',
  displayName: '',
  email: '',
  status: []
};

const initialState: UserSearch = {
  statusList: [],
  list: [],
  model: sm
};
let currentState = initialState;
const initialize = (load: (s: UserFilter, auto?: boolean) => void, setPrivateState: DispatchWithCallback<UserSearch>, c?: SearchComponentState<User, UserFilter>) => {
  const masterDataService = context.getMasterDataService();
  Promise.all([
    masterDataService.getStatus()
  ]).then(values => {
    const s2 = mergeFilter(buildFromUrl(), sm, pageSizes, ['activate']);
    const [activationStatuses] = values;
    setPrivateState({ statusList: activationStatuses }, () => load(s2, true));
  }).catch(handleError);
};
export const UsersForm = (props: ModelProps) => {
  const refForm = React.useRef();
  const history = useHistory();
  const [listStatus, setListStatus]  = React.useState(true);

  const getFilter = (): UserFilter => {
    return currentState.model;
  };
  const p = { initialize, getFilter };
  const hooks = useSearch<User, UserFilter, UserSearch>(refForm, initialState, context.getUserService(), p, inputSearch());
  const { state, resource, component, updateState } = hooks;
  currentState = state;
  component.viewable = true;
  component.editable = true;

  const edit = (e: any, id: string) => {
    e.preventDefault();
    history.push(`users/${id}`);
  };

  const handleNavigateToUpload = (e: any, userId: string) => {
    e.preventDefault();
    history.push(`uploads/${userId}/image`);
  };

  const { model, list } = state;
  return (
    <div className='view-container'>
      <header>
        <h2>{resource.users}</h2>
        <div className='btn-group'>
          {component.view !== 'table' && <button type='button' id='btnTable' name='btnTable' className='btn-table' data-view='table' onClick={hooks.changeView} />}
          {component.view === 'table' && <button type='button' id='btnListView' name='btnListView' className='btn-list-view' data-view='listview' onClick={hooks.changeView} />}
          {component.addable && <button type='button' id='btnNew' name='btnNew' className='btn-new' onClick={hooks.add} />}
        </div>
      </header>
      <div>
        <form id='usersForm' name='usersForm' noValidate={true} ref={refForm}>
          <section className='row search-group inline'>
            <label className='col s12 m4 l4'>
              {resource.username}
              <input type='text'
                id='username' name='username'
                value={model.username}
                onChange={updateState}
                maxLength={255}
                placeholder={resource.username} />
            </label>
            <label className='col s12 m4 l4'>
              {resource.display_name}
              <input type='text'
                id='displayName' name='displayName'
                value={model.displayName}
                onChange={updateState}
                maxLength={255}
                placeholder={resource.display_name} />
            </label>
            <label className='col s12 m4 l4 checkbox-section'>
              {resource.status}
              <section className='checkbox-group'>
                <label>
                  <input
                    type='checkbox'
                    id='A'
                    name='status'
                    value='A'
                    checked={model && model.status && model.status.includes('A')}
                    onChange={updateState} />
                  {resource.active}
                </label>
                <label>
                  <input
                    type='checkbox'
                    id='I'
                    name='status'
                    value='I'
                    checked={model && model.status && model.status.includes('I')}
                    onChange={updateState} />
                  {resource.inactive}
                </label>
              </section>
            </label>
          </section>
          <section className='btn-group'>
            <label>
              {resource.page_size}
              <PageSizeSelect pageSize={component.pageSize} pageSizes={component.pageSizes} onPageSizeChanged={hooks.pageSizeChanged} />
            </label>
            <button type='submit' className='btn-search' onClick={hooks.searchOnClick}>{resource.search}</button>
          </section>
        </form>
        <form className='list-result'>
          <section className='btn-group' style={{paddingLeft : '16px'}}>
            <div className='btn-search' style={{textAlign : 'center', padding : '6px 0'}} onClick={() => setListStatus(l => !l)}>{listStatus ? 'Carousel' : 'Items'}</div>
          </section>
          {component.view === 'table' && <div className='table-responsive'>
            <table>
              <thead>
                <tr>
                  <th>{resource.sequence}</th>
                  <th data-field='userId'><button type='button' id='sortUserId' onClick={hooks.sort}>{resource.user_id}</button></th>
                  <th data-field='username'><button type='button' id='sortUserName' onClick={hooks.sort}>{resource.username}</button></th>
                  <th data-field='email'><button type='button' id='sortEmail' onClick={hooks.sort}>{resource.email}</button></th>
                  <th data-field='displayname'><button type='button' id='sortDisplayName' onClick={hooks.sort}>{resource.display_name}</button></th>
                  <th data-field='status'><button type='button' id='sortStatus' onClick={hooks.sort}>{resource.status}</button></th>
                </tr>
              </thead>
              {list && list.length > 0 && list.map((item, i) => {
                return (
                  <tr key={i}>
                    <td className='text-right'>{(item as any).sequenceNo}</td>
                    <td>{item.userId}</td>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                    <td>{item.displayName}</td>
                    <td>{item.status}</td>
                  </tr>
                );
              })}
            </table>
          </div>}
          {component.view !== 'table' && <ul className='row list-view'>
            {list && list.length > 0 && list.map((item, i) => {
              return (
                <>
                {
                  listStatus ? (
                    <li key={i} className='col s12 m6 l4 xl3'>
                      <section>
                        <img onClick={(e) => handleNavigateToUpload(e, item.userId)} src={item.imageURL && item.imageURL.length > 0 ? item.imageURL : (item.gender === 'F' ? femaleIcon : maleIcon)} className='round-border'/>
                        <div>
                          <h3 onClick={e => edit(e, item.userId)} className={item.status === 'I' ? 'inactive' : ''}>{item.displayName}</h3>
                          <p>{item.email}</p>
                        </div>
                        <button className='btn-detail'/>
                      </section>
                    </li>
                  ) : (
                    <li key={i} className='col s12 m6 l4 xl3'>
                      <section>
                        <UserCarousel user={item} edit={edit}/>
                      </section>
                    </li>
                  )
                }
                </>
              );
            })}
          </ul>}
          <Pagination className='col s12 m6' totalRecords={component.itemTotal} itemsPerPage={component.pageSize} maxSize={component.pageMaxSize} currentPage={component.pageIndex} onPageChanged={hooks.pageChanged} initPageSize={component.initPageSize} />
        </form>
      </div>
    </div>
  );
};
