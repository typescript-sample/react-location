import { ValueText } from 'onecore';
import * as React from 'react';
import PageSizeSelect from 'react-page-size-select';
import Pagination from 'react-pagination-x';
import {useHistory} from 'react-router-dom';
import { SearchComponentState, useSearch } from 'src/core/hooks/useSearch';
import { inputSearch } from 'uione';
import { context } from '../app';
import { Audit, AuditFilter } from '../model/Audit';

interface AuditSearch extends SearchComponentState<Audit, AuditFilter> {
  statusList: ValueText[];
}

const sm: AuditFilter = {
  id: '',
  action: '',
};

const AuditSearch: AuditSearch = {
  statusList: [],
  list: [],
  model: sm
};

const RolesForm = () => {
  const history = useHistory();
  const refForm = React.useRef();
  const getFilter = (): AuditFilter => {
    return AuditSearch.model;
  };
  const p = {getFilter};
  const hooks = useSearch<Audit, AuditFilter, AuditSearch>(refForm, AuditSearch, context.getAuditService(), p, inputSearch());
  const { state, resource, component, updateState } = hooks;

  const edit = (e: any, id: string) => {
    e.preventDefault();
    history.push('audit-logs/' + id );
  };

  return (
    <div className='view-container'>
        <header>
          <h2>{resource.role_list}</h2>
          {component.addable && <button type='button' id='btnNew' name='btnNew' className='btn-new' onClick={hooks.add} />}
        </header>
        <div>
          <form id='rolesForm' name='rolesForm' noValidate={true} ref={refForm}>
            <section className='row search-group inline'>
              <label className='col s12 m6'>
                Action
                <input
                  type='text'
                  id='action'
                  name='action'
                  value={state.model.action}
                  onChange={updateState}
                  maxLength={240}
                 />
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
            <ul className='row list-view'>
            {state.list && state.list.length > 0 && state.list.map((item, i) => {
              return (
                <li key={i} className='col s12 m6 l4 xl3' onClick={e => edit(e, item.userId)}>
                  <section>
                    <div>
                      <h3>{item.userId}</h3>
                      <h4>{item.action}</h4>
                      <p>{item.remark}</p>
                    </div>
                    <button className='btn-detail' />
                  </section>
                </li>
              );
            })}
            </ul>
            <Pagination className='col s12 m6' totalRecords={component.itemTotal} itemsPerPage={component.pageSize} maxSize={component.pageMaxSize} currentPage={component.pageIndex} onPageChanged={hooks.pageChanged} />
          </form>
        </div>
      </div>
  );
};
export default RolesForm;
