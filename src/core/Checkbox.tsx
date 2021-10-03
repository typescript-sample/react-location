// @ts-ignore
import PropTypes from 'prop-types';
import * as React from 'react';

interface Props {
  label?: any;
  className?: string;
  classNameLabel?: string;
  isShowLabel: boolean;
  handleCheckboxChange: any;
}

interface StateInternal {
  isChecked: any;
}

class Checkbox extends React.Component<Props, StateInternal> {
  state = {
    isChecked: false,
  };

  toggleCheckboxChange = () => {
    const {handleCheckboxChange, label} = this.props;

    this.setState(({isChecked}) => (
      {
        isChecked: !isChecked,
      }
    ));

    handleCheckboxChange(label);
  }

  render() {
    const {label, isShowLabel} = this.props;
    const {isChecked} = this.state;

    return (
      <div>
        <label className={this.props.classNameLabel}>
          <input className={this.props.className}
                 type='checkbox'
                 value={label}
                 checked={isChecked}
                 onChange={this.toggleCheckboxChange}
          />
          {isShowLabel && label}
          {this.props.children}
        </label>
      </div>
    );
  }
}

// @ts-ignore
Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
  isShowLabel: PropTypes.bool,
  className: PropTypes.string,
  classNameLabel: PropTypes.string,
  handleCheckboxChange: PropTypes.func.isRequired,
};

export default Checkbox;
