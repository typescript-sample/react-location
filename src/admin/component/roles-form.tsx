import { RoleFilter, ValueText } from 'onecore';
import * as React from 'react';
import { buildFromUrl, DispatchWithCallback } from 'react-hook-core';
import PageSizeSelect from 'react-page-size-select';
import Pagination from 'react-pagination-x';
import { useHistory } from 'react-router-dom';
import { mergeFilter } from 'search-core';
import { pageSizes, SearchComponentState, useSearch } from 'src/core/hooks/useSearch';
import { handleError, inputSearch } from 'uione';
import { context } from '../app';
import { Role } from '../model/Role';

interface RoleSearch extends SearchComponentState<Role, RoleFilter> {
  statusList: ValueText[];
}

const sm: RoleFilter = {
  roleId: '',
  roleName: '',
};

const RoleSearch: RoleSearch = {
  statusList: [],
  list: [],
  model: sm
};

const initialize = (load: (s: RoleFilter, auto?: boolean) => void, setPrivateState: DispatchWithCallback<RoleSearch>, c?: SearchComponentState<Role, RoleFilter>) => {
  const masterDataService = context.getMasterDataService();
  Promise.all([
    masterDataService.getStatus()
  ]).then(values => {
    const s2 = mergeFilter(buildFromUrl(), sm, pageSizes, ['activate']);
    const [activationStatuses] = values;
    setPrivateState({ statusList: activationStatuses }, () => load(s2, true));
  }).catch(handleError);
};

const RolesForm = () => {
  const history = useHistory();
  const refForm = React.useRef();
  const getFilter = (): RoleFilter => {
    return RoleSearch.model;
  };
  const p = { initialize, getFilter };
  const hooks = useSearch<Role, RoleFilter, RoleSearch>(refForm, RoleSearch, context.getRoleService(), inputSearch(), p);
  const { state, resource, component, updateState } = hooks;

  const edit = (e: any, id: string) => {
    e.preventDefault();
    history.push('roles/' + id);
  };

  return (
    <div className='view-container'>
      <header>
        <h2>{resource.role_list}</h2>
        <div className='btn-group'>
        {component.view !== 'table' && <button type='button' id='btnTable' name='btnTable' className='btn-table' data-view='table' onClick={hooks.changeView} />}
          {component.view === 'table' && <button type='button' id='btnListView' name='btnListView' className='btn-list-view' data-view='listview' onClick={hooks.changeView} />}
          {component.addable && <button type='button' id='btnNew' name='btnNew' className='btn-new' onClick={hooks.add} />}
        </div>
      </header>
      <div>
        <form id='rolesForm' name='rolesForm' noValidate={true} ref={refForm}>
          <section className='row search-group inline'>
            <label className='col s12 m6'>
              {resource.role_name}
              <input
                type='text'
                id='roleName'
                name='roleName'
                value={state.model.roleName}
                onChange={updateState}
                maxLength={240}
                placeholder={resource.roleName} />
            </label>
            <label className='col s12 m6'>
              {resource.status}
              <section className='checkbox-group'>
                <label>
                  <input
                    type='checkbox'
                    id='active'
                    name='status'
                    value='A'
                    checked={state.model && state.model.status && state.model.status.includes('A')}
                    onChange={updateState} />
                  {resource.active}
                </label>
                <label>
                  <input
                    type='checkbox'
                    id='inactive'
                    name='status'
                    value='I'
                    checked={state.model && state.model.status && state.model.status.includes('I')}
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
        {component.view === 'table' && <div className='table-responsive'>
            <table>
              <thead>
                <tr>
                  <th>{resource.sequence}</th>
                  <th data-field='roleId'><button type='button' id='sortRoleId' onClick={hooks.sort}>{resource.role_id}</button></th>
                  <th data-field='roleName'><button type='button' id='sortRoleName' onClick={hooks.sort}>{resource.role_name}</button></th>
                  <th data-field='remark'><button type='button' id='sortRemark' onClick={hooks.sort}>{resource.remark}</button></th>
                  <th data-field='status'><button type='button' id='sortStatus' onClick={hooks.sort}>{resource.status}</button></th>
                </tr>
              </thead>
              {state.list && state.list.length > 0 && state.list.map((item, i) => {
                return (
                  <tr key={i}>
                    <td className='text-right'>{(item as any).sequenceNo}</td>
                    <td>{item.roleId}</td>
                    <td>{item.roleName}</td>
                    <td>{item.remark}</td>
                    <td>{item.status}</td>
                  </tr>
                );
              })}
            </table>
          </div>}
          {component.view !== 'table' && <ul className='row list-view'>
            {state.list && state.list.length > 0 && state.list.map((item, i) => {
              return (
                <li key={i} className='col s12 m6 l4 xl3' onClick={e => edit(e, item.roleId)}>
                  <section>
                    <div>
                      <h3 className={item.status === 'I' ? 'inactive' : ''}>{item.roleName}</h3>
                      <p>{item.remark}</p>
                    </div>
                    <button className='btn-detail' />
                  </section>
                </li>
              );
            })}
          </ul>}
          <Pagination className='col s12 m6' totalRecords={component.itemTotal} itemsPerPage={component.pageSize} maxSize={component.pageMaxSize} currentPage={component.pageIndex} onPageChanged={hooks.pageChanged} />
        </form>
      </div>
    </div>
  );
};
export default RolesForm;
