import * as React from 'react';
import { EditComponent, HistoryProps } from 'src/core/hooks';
// import {EditComponent, HistoryProps} from 'react-onex';
import {handleError, inputEdit} from 'uione';
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
function isCheckedAll<S extends InternalState, P>(privileges: string[], all: string[], setState2: <K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), callback?: () => void) => void) {
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
export class RoleForm extends EditComponent<Role, any, HistoryProps, InternalState> {
  constructor(props: HistoryProps) {
    super(props, context.getRoleService(), inputEdit());
    this.setState = this.setState.bind(this);
    this.patchable = false;
    this.state = {
      role: this.createModel(),
      allPrivileges: [],
      shownPrivileges: [],
      keyword: ''
    };
  }
  private readonly masterDataService = context.getMasterDataService();
  private readonly roleService = context.getRoleService();

  async load(id: any) {
    Promise.all([
      this.roleService.getPrivileges()
    ]).then(values => {
      const [allPrivileges] = values;
      const all: string[] = [];
      buildAll(all, allPrivileges);
      this.setState({ all, allPrivileges, shownPrivileges: allPrivileges }, () => super.load(id));
    }).catch(handleError);
  }
  showModel(role: Role) {
    if (!role) {
      return;
    }
    const { all } = this.state;
    if (!role.privileges) {
      role.privileges = [];
    } else {
      role.privileges = role.privileges.map(p => p.split(' ', 1)[0]);
    }
    this.setState({role}, () => isCheckedAll(role.privileges, all, this.setState));
  }
  handleCheckAll = (event: any) => {
    const { role, all } = this.state;
    event.persist();
    const checkedAll = event.target.checked;
    role.privileges = (checkedAll ? all : []);
    this.setState({role, checkedAll});
  }
  handleCheck = (event: any) => {
    const { role, all, allPrivileges } = this.state;
    event.persist();
    const target = event.target;
    const id = target.getAttribute('data-id');
    const type = target.getAttribute('data-type');
    role.privileges = buildPrivileges(id, type, role.privileges, allPrivileges);
    this.setState({ role }, () => isCheckedAll(role.privileges, all, this.setState));
  }
  onChangekeyword = (event: any) => {
    const keyword = event.target.value;
    const { allPrivileges } = this.state;
    const shownPrivileges = buildShownModules(keyword, allPrivileges);
    this.setState({ keyword, shownPrivileges });
  }

   assign = (e: any, id: string) => {
    e.preventDefault();
    this.props.history.push(`/roles/${id}/assign`);
    return;
  }

  renderForms = (role: Role, modules: Privilege[], parentId: string, disabled: boolean, allPrivileges: Privilege[]) => {
    if (!modules || modules.length === 0) {
      return '';
    }
    return modules.map(m => this.renderForm(role, m, parentId, disabled, allPrivileges));
  }
  renderForm = (role: Role, m: Privilege, parentId: string, disabled: boolean, allPrivileges: Privilege[]) => {
    if (m.children && m.children.length > 0) {
      const checked = containOne(role.privileges, m.children);
      return (
        <section className='col s12'>
          <label className='checkbox-container'>
            <input
              type='checkbox'
              name='modules'
              disabled={disabled}
              data-id={m.id}
              data-type='parent'
              checked={checked}
              onChange={this.handleCheck} />
            {m.name}
          </label>
          <section className='row checkbox-group'>
            {this.renderForms(role, m.children, m.id, disabled, allPrivileges)}
          </section>
          <hr />
        </section>
      );
    } else {
      return (
        <label className='col s6 m4 l3'>
          <input
            type='checkbox'
            name='modules'
            data-id={m.id}
            data-parent={parentId}
            checked={role.privileges ? (role.privileges.find(item => item === m.id) ? true : false) : false}
            onChange={this.handleCheck}
          />
          {m.name}
        </label>
      );
    }
  }

  render() {
    const resource = this.resource;
    const { shownPrivileges, allPrivileges, keyword, role } = this.state;
    const disabled = (keyword !== '');
    return (
      <div className='view-container'>
        <form id='roleForm' name='roleForm' model-name='role' ref={this.ref}>
          <header>
            <button type='button' id='btnBack' name='btnBack' className='btn-back' onClick={this.back} />
            <h2>{this.newMode ? resource.create : resource.edit} {resource.role}</h2>
            <i onClick={e => this.assign(e, role.roleId)} className='btn material-icons'>group</i>
          </header>
          <div>
            <section className='row'>
              <label className='col s12 m6'>
                {resource.role_id}
                <input type='text'
                  id='roleId' name='roleId'
                  value={role.roleId}
                  onChange={this.updateState}
                  maxLength={20} required={true}
                  readOnly={!this.newMode}
                  placeholder={resource.role_id} />
              </label>
              <label className='col s12 m6'>
                {resource.role_name}
                <input type='text'
                  id='roleName' name='roleName'
                  value={role.roleName}
                  onChange={this.updateState}
                  maxLength={255}
                  placeholder={resource.role_name} />
              </label>
              <label className='col s12 m6'>
                {resource.remark}
                <input type='text'
                  id='remark' name='remark'
                  value={role.remark}
                  onChange={this.updateState}
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
                    onChange={this.updateState}
                    value='A' checked={role.status === 'A'} />
                  {resource.active}
                </label>
                <label>
                  <input
                    type='radio'
                    id='inactive'
                    name='status'
                    onChange={this.updateState}
                    value='I' checked={role.status === 'I'} />
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
                  disabled={keyword !== ''}
                  data-type='all'
                  checked={this.state.checkedAll}
                  onChange={this.handleCheckAll} />
                {resource.all_privileges}
              </label>
              <label className='col s12 search-input'>
                <i className='btn-search' />
                <input type='text'
                  id='keyword'
                  name='keyword'
                  maxLength={40}
                  placeholder={resource.role_filter_modules}
                  value={keyword}
                  onChange={this.onChangekeyword} />
              </label>
            </h4>
            <section className='row hr-height-1'>
              {this.renderForms(role, shownPrivileges, '', disabled, allPrivileges)}
            </section>
          </div>
          <footer>
            {!this.readOnly &&
              <button type='submit' id='btnSave' name='btnSave' onClick={this.saveOnClick}>
                {resource.save}
              </button>}
          </footer>
        </form>
      </div>
    );
  }
}
