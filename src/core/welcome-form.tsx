import * as React from 'react';
import { ModelHistoryProps } from 'react-onex';
import { Link } from 'react-router-dom';
import { Privilege, privileges, storage, StringMap } from 'uione';
import './welcome-form.css';

export class WelcomeForm extends React.Component<ModelHistoryProps, any> {
  constructor(props: ModelHistoryProps) {
    super(props);
    this.resource = storage.resource().resource();
    this.state = {
      forms: [],
    };
  }
  protected resource: StringMap = {};
  componentWillMount() {
    const forms = privileges();
    this.setState({ forms });
  }
  renderForms = (forms: Privilege[]) => {
    return forms.map((form, idx) => {
      return this.renderForm(form, idx);
    });
  }
  renderForm = (feature: Privilege, idx: number) => {
    const resourceKey = this.resource[feature.resource];
    const name = !resourceKey || resourceKey.length === 0 ? feature.name : this.resource[feature.resource];
    if (feature.children && Array.isArray(feature.children)) {
      const className = !feature.icon || feature.icon.length === 0 ? 'settings' : feature.icon;
      const features = feature.children;
      return (
        <label className='col s12 m12' key={idx}>
          <div>
            <i className='material-icons menu-type'>{className}</i>
            <span className='menu-type'>{name}</span>
          </div>
          <ul className='menu-ul'>{this.renderForms(features)}</ul>
          <hr />
        </label>
      );
    } else {
      const className = !feature.icon || feature.icon.length === 0 ? 'settings' : feature.icon;
      return (
        <label className='col s6 m6 l3 welcome-span' key={idx}>
          <Link to={feature.path}>
            <div>
              <i className='material-icons'>{className}</i>
              <span>{name}</span>
            </div>
          </Link>
        </label>
      );
    }
  }

  render() {
    const resource = this.resource;
    return (
      <div className='view-container menu'>
        <header>
          <h2 className='label'>{resource.welcome_title}</h2>
        </header>
        <br />
        <br />
        <React.Fragment>
          <section className='row welcome hr-height-1'>{this.renderForms(this.state.forms)}</section>
        </React.Fragment>
      </div>
    );
  }
}
