import {ValueText} from 'onecore';
import {useEffect, useState} from 'react';
import * as React from 'react';
import {DispatchWithCallback, error, useRouter} from 'react-onex';
import {useHistory, useLocation} from 'react-router-dom';
import {handleError, inputEdit, resource as getResource, storage} from 'uione';
import femaleIcon from '../../assets/images/female.png';
import maleIcon from '../../assets/images/male.png';
import {buildId, message} from '../../core/hooks';
import {context} from '../app';
import {Role} from '../model/Role';
import {User} from '../model/User';
import {UsersLookup} from './users-lookup';

interface InternalState {
    role: Role;
    date: Date;
    userTypeList: ValueText[];
    users: any[];
    roleAssignToUsers?: any[];
    textSearch: string;
    isOpenModel: boolean;
    isShowCheckbox: boolean;
    checkBoxList: any[];
}

const initialState: InternalState = {
    role: {} as any,
    date: new Date(),
    userTypeList: [],
    users: [],
    roleAssignToUsers: null,
    textSearch: '',
    isOpenModel: false,
    isShowCheckbox: false,
    checkBoxList: []
};

const initialize = (id: number, set: DispatchWithCallback<Partial<InternalState>>, state) => {
    const userService = context.getUserService();
    const roleService = context.getRoleService();
    Promise.all([
        userService.loadUserByRoleID(id),
        roleService.load(id)
    ]).then(values => {
        const [roleAssignToUsers, role] = values;
        role.users = roleAssignToUsers;
        set({...state, roleAssignToUsers, role});
    }).catch(err => error(err, storage.resource().value, storage.alert));
};

export const RoleAssignmentForm = (props) => {
    const [state, setState] = useState(initialState);
    const roleService = context.getRoleService();
    const history = useHistory();
    const location = useLocation();
    const { push } = useRouter();
    const p = inputEdit();
    const resource = p.resource.resource();
    const {confirm, showMessage} = p;
    const {role, users, isOpenModel, textSearch} = state;
    let {roleAssignToUsers, checkBoxList, isShowCheckbox} = state;
    const resultRoleAssignToUsers = roleAssignToUsers ? roleAssignToUsers : role.users ? role.users : [];

    useEffect(() => {
        const id = buildId(props);
        initialize(id as any, setState as any, state);
    }, []);

    const getModel = (_users: User[]): string[] => {
        return _users ? _users.map(item => item.userId) : [];
    };
    const onSearch = (event) => {
        if (role.users) {
            const result = role.users.filter((value) => {
                return value['userId'].includes(event.target.value);
            });
            const obj = {[event.target.name]: event.target.value, roleAssignToUsers: result} as any;
            setState({...state, ...obj});
        }
    };
    const saveOnClick = (e: any) => {
        e.preventDefault();
        const userIDs = getModel(role.users);
        const msg = message(p.resource.value, 'msg_confirm_save', 'confirm', 'yes', 'no');
        p.confirm(msg.message, msg.title, () => {
            roleService.assign(userIDs, role.roleId).then(result => {
                showMessage(p.resource.resource().msg_save_success);
            }).catch(handleError);
        }, msg.no, msg.yes);
    };

    const onModelSave = (array: []) => {
        const usersTmp = roleAssignToUsers ? roleAssignToUsers : role.users ? role.users : [];
        array.map((value) => {
            usersTmp.push(value);
        });
        role.users = usersTmp;
        setState({...state, role, roleAssignToUsers, isOpenModel: false});
    };

    const onModelClose = () => {
        setState({...state, isOpenModel: false});
    };

    const onCheckBox = (userId) => {
        if (role.users) {
            const result = role.users.find((value) => {
                if (value) {
                    return value.userId === userId;
                }
            });
            if (result) {
                const index = checkBoxList.indexOf(result);
                if (index !== -1) {
                    delete checkBoxList[index];
                } else {
                    checkBoxList.push(result);
                }
            }
        }
        setState({...state, checkBoxList});
    };

    const onShowCheckBox = () => {
        if (isShowCheckbox === false) {
            isShowCheckbox = true;
        } else {
            isShowCheckbox = false;
        }
        setState({...state, isShowCheckbox});
    };

    const onDeleteCheckBox = () => {
        const r = getResource();
        confirm(r.value('msg_confirm_delete'), r.value('confirm'), () => {
            const rolesTmp = roleAssignToUsers ? roleAssignToUsers : role.users ? role.users : [];
            const arr = [];
            rolesTmp.map((value) => {
                const result = checkBoxList.find((v) => {
                    if (v) {
                        return v.userId === value.userId;
                    }
                });
                if (result === undefined) {
                    arr.push(value);
                }
            });
            roleAssignToUsers = arr;
            role.users = arr;
            checkBoxList = [];
            setState({...state, role, roleAssignToUsers, checkBoxList, isShowCheckbox: false});
        });
    };

    const onCheckAll = () => {
        if (role.users) {
            checkBoxList = role.users;
        }
        setState({...state, checkBoxList});
    };

    const onUnCheckAll = () => {
        setState({...state, checkBoxList: []});
    };

    const back = (e: any) => {
        push(`assignment`);
        return;
    };

    return (
        <div className='view-container'>
            <form id='roleAssignmentForm' name='roleAssignmentForm' model-name='role' ref={this.ref}>
                <header>
                    <button type='button' id='btnBack' name='btnBack' className='btn-back' onClick={back}/>
                    <h2>{resource.edit} {resource.role_assignment_subject}</h2>
                </header>
                <div>
                    <section className='row'>
                        <h4>{resource.role_assignment_subject}</h4>
                        <label className='col s12 m6'>
                            {resource.role_id}
                            <input type='text'
                                   id='roleId' name='roleId'
                                   value={role.roleId || ''}
                                   maxLength={255}
                                   placeholder={resource.roleId}
                                   disabled={true}/>
                        </label>
                        <label className='col s12 m6'>
                            {resource.role_name}
                            <input type='text'
                                   id='roleName' name='roleName'
                                   value={role.roleName || ''}
                                   maxLength={255}
                                   placeholder={resource.role_name}
                                   disabled={true}/>
                        </label>
                    </section>
                    <section className='row detail'>
                        <h4>
                            {resource.user}
                            <div className='btn-group'>
                                {!this.readOnly && <button type='button'
                                                           onClick={() => setState({
                                                               ...state,
                                                               isOpenModel: true
                                                           })}>{resource.add}</button>}
                                {!this.readOnly && <button type='button'
                                                           onClick={onShowCheckBox}>{isShowCheckbox ? resource.deselect : resource.select}</button>}
                                {isShowCheckbox ?
                                    <button type='button' onClick={onCheckAll}>{resource.check_all}</button> : ''}
                                {isShowCheckbox ? <button type='button'
                                                          onClick={onUnCheckAll}>{resource.uncheck_all}</button> : ''}
                                {isShowCheckbox ? <button type='button'
                                                          onClick={onDeleteCheckBox}>{resource.delete}</button> : ''}
                            </div>
                        </h4>
                        {!this.readOnly &&
                        <label className='col s12 search-input'>
                            <i className='btn-search'/>
                            <input type='text'
                                   id='textSearch'
                                   name='textSearch'
                                   onChange={onSearch}
                                   value={textSearch}
                                   maxLength={40}
                                   placeholder={resource.role_assignment_search_user}/>
                        </label>
                        }
                        <ul className='row list-view'>
                            {resultRoleAssignToUsers && resultRoleAssignToUsers?.map((value, i) => {
                                const result = checkBoxList.find((v) => {
                                    if (v) {
                                        return v.userId === value.userId;
                                    }
                                });
                                return (
                                    <li key={i} className='col s12 m6 l4 xl3'
                                        onClick={isShowCheckbox === true ? () => onCheckBox(value.userId) : () => {
                                        }}>
                                        <section>
                                            {isShowCheckbox === true ? <input type='checkbox' name='selected'
                                                                              checked={result ? true : false}/> : ''}
                                            <img src={value.gender === 'F' ? femaleIcon : maleIcon}
                                                 className='round-border'/>
                                            <div>
                                                <h3>{value.displayName}</h3>
                                                <p>{value.userId}</p>
                                            </div>
                                            <button className='btn-detail'/>
                                        </section>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>
                <footer>
                    {!this.readOnly &&
                    <button type='submit' id='btnSave' name='btnSave' onClick={saveOnClick}>
                        {resource.save}
                    </button>}
                </footer>
            </form>
            <UsersLookup
                location={location}
                history={history}
                props={props['props']}
                isOpenModel={isOpenModel}
                onModelClose={onModelClose}
                onModelSave={onModelSave}
                roleAssignToUsers={resultRoleAssignToUsers}
            />
        </div>
    );
};

