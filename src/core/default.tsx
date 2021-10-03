import axios from 'axios';
import { HttpRequest } from 'axios-core';
import * as React from 'react';
import { BaseComponent, HistoryProps, ModelHistoryProps, navigate } from 'react-onex';
import PageSizeSelect from 'react-page-size-select';
import { Link } from 'react-router-dom';
import { getLocale, handleError, Privilege, removeError, storage } from 'uione';
import { options } from 'uione';
import { isArray } from 'util';
import logoTitle from '../assets/images/logo-title.png';
import logo from '../assets/images/logo.png';
import AvataIcon from '../assets/images/male.png';
import topBannerLogo from '../assets/images/top-banner-logo.png';
import config from '../config';

interface InternalState {
  pageSizes: number[];
  pageSize: number;
  authenticationService: any;
  se: any;
  isToggleMenu: boolean;
  isToggleSidebar: boolean;
  isToggleSearch: boolean;
  keyword: string;
  classProfile: string;
  forms: Privilege[];
  username: string;
  userType: string;
  pinnedModules: Privilege[];
}

export default class DefaultWrapper extends BaseComponent<ModelHistoryProps, InternalState> {
  constructor(props) {
    super(props, getLocale, removeError);
    this.resource = storage.resource().resource();
    this.renderForm = this.renderForm.bind(this);
    this.renderForms = this.renderForms.bind(this);
    // this.menuItemOnBlur = this.menuItemOnBlur.bind(this);
    this.state = {
      pageSizes: [10, 20, 40, 60, 100, 200, 400, 10000],
      pageSize: 10,
      authenticationService: undefined,
      se: {} as any,
      keyword: '',
      classProfile: '',
      isToggleMenu: false,
      isToggleSidebar: false,
      isToggleSearch: false,
      forms: [],
      username: '',
      userType: '',
      pinnedModules: [],
    };
    this.httpRequest = new HttpRequest(axios, options);
  }
  protected resource: any = {};
  protected httpRequest: HttpRequest;
  protected pageSize = 20;
  protected pageSizes = [10, 20, 40, 60, 100, 200, 400, 10000];
  pageSizeChanged = (event) => {};

  componentWillMount() {
    // TODO : TB temporary fix form service null .
    /*
    if (!this.formService) {
      this.formService = new FormServiceImpl();
    }
    this.formService.getMyForm().subscribe(forms => {
      if (forms) {
        this.setState({ forms });
      } else {
        logger.warn('DefaultWrapper:  cannot load form from cache , re direct');
        this.props.history.push('/');
      }
    });
    */
    const forms = storage.privileges();
    this.setState({ forms });

    const username = storage.username();
    const storageRole = storage.getUserType();
    if (username || storageRole) {
      this.setState({ username, userType: storageRole });
    }
  }

  clearKeyworkOnClick = () => {
    this.setState({
      keyword: '',
    });
  }

  activeWithPath = (path, isParent, features?: any) => {
    if (isParent && features && isArray(features)) {
      const hasChildLink = features.some((item) => this.props.location.pathname.startsWith(item['link']));
      return path && this.props.location.pathname.startsWith(path) && hasChildLink ? 'active' : '';
    }
    return path && this.props.location.pathname.startsWith(path) ? 'active' : '';
  }

  toggleMenuItem = (event) => {
    event.preventDefault();
    let target = event.currentTarget;
    const currentTarget = event.currentTarget;
    const elI = currentTarget.querySelectorAll('.menu-item > i')[1];
    if (elI) {
      if (elI.classList.contains('down')) {
        elI.classList.remove('down');
        elI.classList.add('up');
      } else {
        if (elI.classList.contains('up')) {
          elI.classList.remove('up');
          elI.classList.add('down');
        }
      }
    }
    if (currentTarget.nextElementSibling) {
      currentTarget.nextElementSibling.classList.toggle('expanded');
    }
    if (target.nodeName === 'A') {
      target = target.parentElement;
    }
    if (target.nodeName === 'LI') {
      target.classList.toggle('open');
    }
  }

  searchOnClick = () => {};
  toggleSearch = () => {
    this.setState((prev) => ({ isToggleSearch: !prev.isToggleSearch }));
  }

  toggleMenu = (e: any) => {
    if (e && e.preventDetault) {
      e.preventDetault();
    }
    this.setState((prev) => ({ isToggleMenu: !prev.isToggleMenu }));
  }

  toggleSidebar = () => {
    this.setState((prev) => ({ isToggleSidebar: !prev.isToggleSidebar }));
  }

  toggleProfile = () => {
    this.setState((prevState) => {
      return { classProfile: prevState.classProfile === 'show' ? '' : 'show' };
    });
  }

  signout = (event) => {
    event.preventDefault();
    const httpRequest = new HttpRequest(axios, options);
    const url = config.authentication_url + '/authentication/signout/' + storage.username();
    httpRequest.get(url).catch(err => {});
    sessionStorage.setItem('authService', null);
    sessionStorage.clear();
    storage.setUser(null);
    navigate(this.props.history, '');
  }

  viewMyprofile = (e) => {
    e.preventDefault();
    navigate(this.props.history, '/my-profile');
  }

  viewMySetting = (e) => {
    e.preventDefault();
    navigate(this.props.history, '/my-profile/my-settings');
  }

  viewChangePassword = (e) => {
    e.preventDefault();
    navigate(this.props.history, '/auth/change-password');
  }

  pinModulesHandler(event, index, moduleSequence) {
    event.stopPropagation();
    const { forms, pinnedModules } = this.state;
    if (forms.find((module) => module.sequence === moduleSequence)) {
      const removedModule = forms.splice(index, 1);
      pinnedModules.push(removedModule[0]);
      forms.sort((moduleA, moduleB) => moduleA.sequence - moduleB.sequence);
      this.setState({ forms, pinnedModules });
    } else {
      const removedModule = pinnedModules.splice(index, 1);
      forms.push(removedModule[0]);
      forms.sort((moduleA, moduleB) => moduleA.sequence - moduleB.sequence);
      this.setState({ forms, pinnedModules });
    }
  }

  renderForms = (features: Privilege[], isPinnedModules: boolean = false) => {
    return features.map((feature, index) => {
      return this.renderForm(index, feature, isPinnedModules);
    });
  }
  renderForm = (key: any, module: Privilege, isPinnedModules: boolean = false) => {
    const name = !this.resource[module.resource] || this.resource[module.resource] === '' ? module.name : this.resource[module.resource];
    // if (module.status !== 'A') {
    //   return (null);
    // }
    if (module.children && Array.isArray(module.children)) {
      const className = !module.icon || module.icon === '' ? 'settings' : module.icon;
      const link = module.path;
      const features = module.children;
      return (
        <li key={key} className={'open ' + this.activeWithPath(link, true, features)} /* onBlur={this.menuItemOnBlur} */>
          <a
            className='menu-item'
            onClick={(e) => {
              this.toggleMenuItem(e);
            }}
          >
            <button type='button' className={`btn-pin ${isPinnedModules ? 'pinned' : ''}`} onClick={(event) => this.pinModulesHandler(event, key, module.sequence)} />
            <i className='material-icons'>{className}</i>
            <span>{name}</span>
            <i className='entity-icon down' />
          </a>
          <ul className='list-child'>{this.renderForms(features)}</ul>
        </li>
      );
    } else {
      const className = !module.icon || module.icon === '' ? 'settings' : module.icon;
      return (
        <li key={key} className={this.activeWithPath(module.path, false)}>
          <Link to={module.path}>
            <i className='material-icons'>{className}</i>
            <span>{name}</span>
          </Link>
        </li>
      );
    }
  }

  onMouseHover = (e) => {
    e.preventDefault();
    const sysBody = (window as any).sysBody;
    if (sysBody.classList.contains('top-menu') && window.innerWidth > 768) {
      const navbar = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>ul.expanded'));
      const icons = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>a>i.up'));
      if (navbar.length > 0) {
        for (let i = 0; i < navbar.length; i++) {
          navbar[i].classList.toggle('expanded');
          if (icons[i]) {
            icons[i].className = 'entity-icon down';
          }
        }
      }
    }
  }

  onShowAllMenu = (e) => {
    e.preventDefault();
    const sysBody = (window as any).sysBody;
    if (sysBody.classList.contains('top-menu2')) {
      const navbar = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>ul.list-child'));
      const icons = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>a>i.down'));
      if (navbar.length > 0) {
        let i = 0;
        for (i = 0; i < navbar.length; i++) {
          navbar[i].className = 'list-child expanded';
          if (icons[i]) {
            icons[i].className = 'entity-icon up';
          }
        }
      }
    }
  }

  onHideAllMenu = (e) => {
    e.preventDefault();
    const sysBody = (window as any).sysBody;
    if (sysBody.classList.contains('top-menu2')) {
      const navbar = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>ul.expanded'));
      const icons = Array.from(document.querySelectorAll('.sidebar>nav>ul>li>a>i.up'));
      if (navbar.length > 0) {
        let i = 0;
        for (i = 0; i < navbar.length; i++) {
          navbar[i].className = 'list-child';
          if (icons[i]) {
            icons[i].className = 'entity-icon down';
          }
        }
      }
    }
  }

  render() {
    const pageSize = this.pageSize;
    const pageSizes = this.pageSizes;
    const { children } = this.props;
    const { isToggleSidebar, isToggleMenu, isToggleSearch, userType, username } = this.state;
    const topClassList = ['sidebar-parent'];
    if (isToggleSidebar) {
      topClassList.push('sidebar-off');
    }
    if (isToggleMenu) {
      topClassList.push('menu-on');
    }
    if (isToggleSearch) {
      topClassList.push('search');
    }
    const topClass = topClassList.join(' ');
    const user = storage.user();
    return (
      <div className={topClass}>
        <div className='top-banner'>
          <div className='logo-banner-wrapper'>
            <img src={topBannerLogo} alt='Logo of The Company' />
            <img src={logoTitle} className='banner-logo-title' alt='Logo of The Company' />
          </div>
        </div>
        <div className='menu sidebar'>
          <nav>
            <ul>
              <li>
                <a className='toggle-menu' onClick={this.toggleMenu} />
                <p className='sidebar-off-menu'>
                  <i className='toggle' onClick={this.toggleSidebar} />
                  {!isToggleSidebar ? <i className='expand' onClick={this.onShowAllMenu} /> : null}
                  {!isToggleSidebar ? <i className='collapse' onClick={this.onHideAllMenu} /> : null}
                </p>
              </li>
              {this.renderForms(this.state.pinnedModules, true)}
              {this.renderForms(this.state.forms)}
            </ul>
          </nav>
        </div>
        <div className='page-container'>
          <div className='page-header'>
            <form>
              <div className='search-group'>
                <section>
                  <button type='button' className='toggle-menu' onClick={this.toggleMenu} />
                  <button type='button' className='toggle-search' onClick={this.toggleSearch} />
                  <button type='button' className='close-search' onClick={this.toggleSearch} />
                </section>
                <div className='logo-wrapper'>
                  <img className='logo' src={logo} alt='Logo of The Company' />
                </div>
                <label className='search-input'>
                  <PageSizeSelect pageSize={pageSize} pageSizes={pageSizes} onPageSizeChanged={this.pageSizeChanged} />
                  <input type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.updateState} maxLength={1000} placeholder={this.resource.keyword} />
                  <button type='button' hidden={!this.state.keyword} className='btn-remove-text' onClick={this.clearKeyworkOnClick} />
                  <button type='submit' className='btn-search' onClick={this.searchOnClick} />
                </label>
                <section>
                  {/*<button type='button'><i className='fa fa-bell-o'/></button>
                  <button type='button'><i className='fa fa-envelope-o'/></button>*/}
                  <div className='dropdown-menu-profile'>
                    {(!user || !user.imageURL) && (
                      <i className='material-icons' onClick={this.toggleProfile}>
                        person
                      </i>
                    )}
                    <ul id='dropdown-basic' className={this.state.classProfile + ' dropdown-content-profile'}>
                      {/*
                      <li><a className='dropdown-item-profile'
                             onClick={this.viewMyprofile}>{this.resource.my_profile}</a></li>
                      <li><a className='dropdown-item-profile'
                             onClick={this.viewMySetting}>{this.resource.my_settings}</a></li>
                      <li><a className='dropdown-item-profile'
                             onClick={this.viewChangePassword}>{this.resource.my_password}</a></li>*/}
                      <li>
                        <label>User Name: {username} </label>
                        <br />
                        <label>Role : {userType === 'M' ? 'Maker' : 'Checker'} </label>
                      </li>
                      <hr style={{ margin: 0 }} />
                      <li>
                        <a className='dropdown-item-profile' onClick={this.signout}>
                          {this.resource.button_signout}
                        </a>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </form>
          </div>
          <div className='page-body'>{children}</div>
        </div>
      </div>
    );
  }
}

export const WithDefaultProps = (Component: any) => (props: HistoryProps) => {
  return <Component props={props} history={props.history} />;
};
