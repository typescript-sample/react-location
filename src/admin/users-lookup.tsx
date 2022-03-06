import {SearchModel, UserSM} from 'onecore';
import * as React from 'react';
import Modal from 'react-modal';
// import {HistoryProps, SearchComponent, SearchState} from 'react-onex';
import PageSizeSelect from 'react-page-size-select';
import Pagination from 'react-pagination-x';
import { HistoryProps, SearchComponent, SearchState } from 'src/core/hooks';
import {initForm, inputSearch, registerEvents, storage} from 'uione';
import {context} from './app';
import {User} from './model/User';

interface InternalState extends SearchState<User, UserSM> {
  users: User[];
  availableUsers: User[];
  textSearch?: string;
}
interface Props extends HistoryProps {
  isOpenModel?: boolean;
  roleAssignToUsers?: User[];
  onModelClose?: (e: any) => void;
  onModelSave?: (e: any) => void;
  props?: any;
}

export class UsersLookup extends SearchComponent<User, SearchModel, Props, InternalState> {
  constructor(props: Props) {
    super(props, context.getUserService(), inputSearch());
    this.createSearchModel = this.createSearchModel.bind(this);
    this.state = {
      list: [],
      users: [],
      availableUsers: null,
      model: {
        keyword: '',
        userId: '',
      }
    };
  }
  componentDidMount() {
    this.form = initForm(this.ref.current, registerEvents);
    this.load(this.createSearchModel(), storage.autoSearch);
  }
  createSearchModel(): SearchModel {
    const obj: any = {};
    return obj;
  }
  onCheckUser = (event: any) => {
    const { users, list } = this.state;
    const result = list.find((value) => value.userId === event.target.value);
    if (result) {
      const index = users.indexOf(result);
      if (index !== -1) {
        delete users[index];
      } else {
        users.push(result);
      }
      this.setState({ users });
    }
  }

  onModelSave = () => {
    this.setState({ users: [], availableUsers: null, textSearch: '' });
    this.props.onModelSave(this.state.users);
  }

  onModelClose = (event) => {
    this.setState({ users: [], availableUsers: null, textSearch: '' });
    this.props.onModelClose(event);
  }

  protected clearUserId = () => {
    const m = this.state.model;
    m.userId = '';
    this.setState({model: m});
  }

  onChangeText = (event) => {
    const {model} = this.state;
    this.setState({model: {...model, ...{[event.target.name]: event.target.value} as any}});
  }

  onSearch = (e) => {
    this.setState({ list: [] });
    this.searchOnClick(e);
  }

  render() {
    const { isOpenModel, roleAssignToUsers } = this.props;
    const { list, model } = this.state;
    const resource = this.resource;
    let index = 0;
    return (
      <Modal
        isOpen={isOpenModel}
        onRequestClose={this.props.onModelClose}
        contentLabel='Modal'
        // portalClassName='modal-portal'
        className='modal-portal-content'
        bodyOpenClassName='modal-portal-open'
        overlayClassName='modal-portal-backdrop'
      >
        <div className='view-container'>
          <header>
            <h2>{resource.users_lookup}</h2>
            <button type='button' id='btnClose' name='btnClose' className='btn-close' onClick={this.onModelClose}/>
          </header>
          <div>
            <form id='usersLookupForm' name='usersLookupForm' noValidate={true} ref={this.ref}>
              <section className='row search-group'>
                <label className='col s12 m6 search-input'>
                  <PageSizeSelect pageSize={this.pageSize} pageSizes={this.pageSizes} onPageSizeChanged={this.pageSizeChanged}/>
                  <input type='text'
                    id='userId'
                    name='userId'
                    onChange={this.onChangeText}
                    value={model.userId}
                    maxLength={40}
                    placeholder={resource.user_lookup}/>
                  <button type='button' hidden={!model.userId} className='btn-remove-text' onClick={this.clearUserId}/>
                  <button type='submit' className='btn-search' onClick={this.onSearch}/>
                </label>
                <Pagination className='col s12 m6' totalRecords={this.itemTotal} itemsPerPage={this.pageSize} maxSize={this.pageMaxSize} currentPage={this.pageIndex} onPageChanged={this.pageChanged} initPageSize={this.initPageSize}/>
              </section>
            </form>
            <form className='list-result'>
              <div className='table-responsive'>
                <table>
                  <thead>
                    <tr>
                      <th>{resource.sequence}</th>
                      <th data-field='userId'><button type='button' id='sortUserId' onClick={this.sort}>{resource.user_id}</button></th>
                      <th data-field='username'><button type='button' id='sortUsername' onClick={this.sort}>{resource.username}</button></th>
                      <th data-field='email'><button type='button' id='sortEmail' onClick={this.sort}>{resource.email}</button></th>
                      <th data-field='displayname'><button type='button' id='sortDisplayName' onClick={this.sort}>{resource.display_name}</button></th>
                      <th data-field='status'><button type='button' id='sortStatus' onClick={this.sort}>{resource.status}</button></th>
                      <th data-field=''>{resource.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state && list && list.map((item, i) => {
                      const result = roleAssignToUsers.find((v) => {
                        if (v) {
                          return v.userId === item.userId;
                        }
                        return false;
                      });
                      if (!result) {
                        index++;
                        return (
                          <tr key={i}>
                            <td className='text-right'>{index}</td>
                            <td>{item.userId}</td>
                            <td>{item.username}</td>
                            <td>{item.email}</td>
                            <td>{item.displayName}</td>
                            <td>{item.status}</td>
                            <td>
                              <input type='checkbox' id={'chkSelect' + i} value={item.userId} onClick={this.onCheckUser} />
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </form>
          </div>
          <footer>
            <button type='button' onClick={this.onModelSave}>{resource.select}</button>
          </footer>
        </div>
      </Modal>
    );
  }
}
