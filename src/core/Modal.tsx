// @ts-ignore
import PropTypes from 'prop-types';
import * as React from 'react';
import '../myProfile/modal.scss';

interface Props {
  onClose: any;
  show: any;
  children: any;
}

class Modal extends React.Component<Props, any> {
  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className='modal-backdrop fade show'>
        <div className='modal-dialog modal-dialog-centered modal-dialog-log'>
          <div className='modal-content'>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

// @ts-ignore
Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export default Modal;
