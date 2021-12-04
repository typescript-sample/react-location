import * as React from 'react';
import { DispatchWithCallback } from 'react-onex';
import { useHistory, useParams } from 'react-router-dom';
import { createModel, EditComponent, HistoryProps, ModelProps } from 'src/core/hooks';
import {EditComponentParam, useEdit} from 'src/core/hooks/useEdit';
// import {EditComponent, HistoryProps} from 'react-onex';
import {error, handleError, inputEdit, Status, storage} from 'uione';
import {context} from '../app';
import {Privilege, Role} from '../model/Role';

interface InternalState {
  role: Role;
  allPrivileges: Privilege[];
  shownPrivileges: Privilege[];
  checkedAll?: boolean;
  keyword: string;
  all?: string[];
}
const initialState: InternalState = {
  role: {} as Role,
  allPrivileges: [],
  shownPrivileges: [],
  keyword: '',
  checkedAll: false,
  all: [],
};
const createRole = (): Role => {
  const user = createModel<Role>();
  user.status = Status.Active;
  return user;
};
function getPrivilege(id: string, all: Privilege[]): Privilege {
  if (!all || !id) {
    return null;
  }
  for (const root of all) {
    if (root.id === id) {
      return root;
    }
    if (root.children && root.children.length > 0) {
      const m = getPrivilege(id, root.children);
      if (m) {
        return m;
      }
    }
  }
  return null;
}
function containOne(privileges: string[], all: Privilege[]): boolean {
  if (!privileges || privileges.length === 0 || !all || all.length === 0) {
    return false;
  }
  for (const m of all) {
    if (privileges.includes(m.id)) {
      return true;
    }
  }
  return false;
}
function buildAll(privileges: string[], all: Privilege[]): void {
  for (const root of all) {
    privileges.push(root.id);
    if (root.children && root.children.length > 0) {
      buildAll(privileges, root.children);
    }
  }
}
function buildPrivileges(id: string, type: string, privileges: string[], all: Privilege[]): string[] {
  if (type === 'parent') {
    const parent = getPrivilege(id, all);
    const ids = parent.children.map(i => i.id);
    const ms = privileges.filter(i => !ids.includes(i));
    if (containOne(privileges, parent.children)) {
      return ms;
    } else {
      return ms.concat(parent.children.map(i => i.id));
    }
  } else {
    let checked = true;
    if (privileges && privileges.length > 0) {
      const m = privileges.find(item => item === id);
      checked = (m != null);
    } else {
      checked = false;
    }
    if (!checked) {
      return privileges.concat([id]);
    } else {
      return privileges.filter(item => item !== id);
    }
  }
}
function isCheckedAll<S extends InternalState, P>(privileges: string[], all: string[], setState2: DispatchWithCallback<Partial<InternalState>>) {
  const checkedAll = privileges && all && privileges.length === all.length;
  setState2({ checkedAll });
}
function buildShownModules(keyword: string, allPrivileges: Privilege[]): Privilege[] {
  if (!keyword || keyword === '') {
    return allPrivileges;
  }
  const w = keyword.toLowerCase();
  const shownPrivileges = allPrivileges.map(parent => {
    const parentCopy = Object.assign({}, parent);
    if (parentCopy.children) {
      parentCopy.children = parentCopy.children.filter(child => child.name.toLowerCase().includes(w));
    }
    return parentCopy;
  }).filter(item => item.children && item.children.length > 0 || item.name.toLowerCase().includes(w));
  return shownPrivileges;
}
const initialize = async (roleId: any, load: (id: number) => void, set: DispatchWithCallback<Partial<InternalState>>) => {
  const roleService = context.getRoleService();
  Promise.all([
    roleService.getPrivileges()
  ]).then(values => {
    const [allPrivileges] = values;
    const all: string[] = [];
    buildAll(all, allPrivileges);
    set({ all, allPrivileges, shownPrivileges: allPrivileges }, () => load(roleId));
  }).catch(err => error(err, storage.resource().value, storage.alert));
};
const param: EditComponentParam<Role, number, InternalState> = {
  createModel: createRole,
  initialize
};
export function RoleForm(props: ModelProps) {
  const refForm = React.useRef();
  const history = useHistory();
  const { state, setState, back, flag, updateState, saveOnClick, resource } = useEdit<Role, number, InternalState, ModelProps>(props, refForm, initialState, context.getRoleService(), inputEdit(), param);
  React.useEffect(() => {
    showModel(state.role);
  }, [state.role]);
  function showModel(role: Role) {
    if (!role) {
      return;
    }
    const { all } = state;
    if (!role.privileges) {
      role.privileges = [];
    } else {
      role.privileges = role.privileges.map(p => p.split(' ', 1)[0]);
    }
    setState({role}, () => isCheckedAll(role.privileges, all, setState));
  }
  const handleCheckAll = (event: any) => {
    const { role, all } = state;
    event.persist();
    const checkedAll = event.target.checked;
    role.privileges = (checkedAll ? all : []);
    setState({role, checkedAll});
  };
  const handleCheck = (event: any) => {
    const { role, all, allPrivileges } = state;
    event.persist();
    const target = event.target;
    const id = target.getAttribute('data-id');
    const type = target.getAttribute('data-type');
    role.privileges = buildPrivileges(id, type, role.privileges, allPrivileges);
    setState({ role }, () => isCheckedAll(role.privileges, all, setState));
  };
  const onChangekeyword = (event: any) => {
    const keyword = event.target.value;
    const { allPrivileges } = state;
    const shownPrivileges = buildShownModules(keyword, allPrivileges);
    setState({ keyword, shownPrivileges });
  };

  const assign = (e: any, id: string) => {
    e.preventDefault();
    history.push(`/roles/${id}/assign`);
    return;
  };

  const renderForms = (roles: Role, modules: Privilege[], parentId: string, disableds: boolean, allPrivilege: Privilege[]) => {
    if (!modules || modules.length === 0) {
      return '';
    }
    return modules.map(m => renderForm(roles, m, parentId, disableds, allPrivilege));
  };

  const renderForm = (roles: Role, m: Privilege, parentId: string, disableds: boolean, allPrivilege: Privilege[]) => {
    if (m.children && m.children.length > 0) {
      const checked = containOne(roles.privileges, m.children);
      return (
        <section className='col s12' key={m.id}>
          <label className='checkbox-container'>
            <input
              type='checkbox'
              name='modules'
              disabled={disableds}
              data-id={m.id}
              data-type='parent'
              checked={checked}
              onChange={handleCheck} />
            {m.name}
          </label>
          <section className='row checkbox-group'>
            {renderForms(roles, m.children, m.id, disableds, allPrivilege)}
          </section>
          <hr />
        </section>
      );
    } else {
      return (
        <section className='col s12 m4 l3' key={m.id}>
          <label className='checkbox-container'>
            <input
              type='checkbox'
              name='modules'
              data-id={m.id}
              data-parent={parentId}
              checked={roles.privileges ? (roles.privileges.find(item => item === m.id) ? true : false) : false}
              onChange={handleCheck}
            />
            {m.name}
          </label>
        </section>
      );
    }
  };
  return (
    <div className='view-container'>
      <form id='roleForm' name='roleForm' model-name='role' ref={refForm}>
        <header>
          <button type='button' id='btnBack' name='btnBack' className='btn-back' onClick={back} />
          <h2>{refForm ? resource.create : resource.edit} {resource.role}</h2>
          <i onClick={e => assign(e, state.role.roleId)} className='btn material-icons'>group</i>
        </header>
        <div>
          <section className='row'>
            <label className='col s12 m6'>
              {resource.role_id}
              <input type='text'
                id='roleId' name='roleId'
                value={state.role.roleId}
                onChange={updateState}
                maxLength={20} required={true}
                readOnly={!flag.newMode}
                placeholder={resource.role_id} />
            </label>
            <label className='col s12 m6'>
              {resource.role_name}
              <input type='text'
                id='roleName' name='roleName'
                value={state.role.roleName}
                onChange={updateState}
                maxLength={255}
                placeholder={resource.role_name} />
            </label>
            <label className='col s12 m6'>
              {resource.remark}
              <input type='text'
                id='remark' name='remark'
                value={state.role.remark}
                onChange={updateState}
                maxLength={255}
                placeholder={resource.remark} />
            </label>
            <div className='col s12 m6 radio-section'>
            {resource.status}
            <div className='radio-group'>
              <label>
                <input
                  type='radio'
                  id='active'
                  name='status'
                  onChange={(e) => updateState(e, () => setState)}
                  value='A' checked={state.role.status === 'A'} />
                {resource.active}
              </label>
              <label>
                <input
                  type='radio'
                  id='inactive'
                  name='status'
                  onChange={(e) => updateState(e, () => setState)}
                  value='I' checked={state.role.status === 'I'} />
                {resource.inactive}
              </label>
            </div>
          </div>
          </section>
          <h4>
            <label>
              <input
                type='checkbox'
                value='all'
                disabled={state.keyword !== ''}
                data-type='all'
                checked={state.checkedAll}
                onChange={handleCheckAll} />
              {resource.all_privileges}
            </label>
            <label className='col s12 search-input'>
              <i className='btn-search' />
              <input type='text'
                id='keyword'
                name='keyword'
                maxLength={40}
                placeholder={resource.role_filter_modules}
                value={state.keyword}
                onChange={onChangekeyword} />
            </label>
          </h4>
          <section className='row hr-height-1'>
            {
            renderForms(state.role, state.shownPrivileges, '', state.keyword !== '', state.allPrivileges)}
          </section>
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
}
