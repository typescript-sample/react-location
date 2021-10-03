// @ts-ignore
import PropTypes from 'prop-types';
import * as React from 'react';

interface Props {
  handle_Drop: any;
}

class DropZone extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      className: 'drop-zone-hide'
    };
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mouseup', this._onDragLeave);
    window.addEventListener('dragenter', this._onDragEnter);
    window.addEventListener('dragover', this._onDragOver);
    document.getElementById('dragbox').addEventListener('dragleave', this._onDragLeave);
    window.addEventListener('drop', this._onDrop);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this._onDragLeave);
    window.removeEventListener('dragenter', this._onDragEnter);
    window.addEventListener('dragover', this._onDragOver);
    document.getElementById('dragbox').removeEventListener('dragleave', this._onDragLeave);
    window.removeEventListener('drop', this._onDrop);
  }

  _onDragEnter(e) {
    this.setState({className: 'drop-zone-show'});
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  _onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  _onDragLeave(e) {
    this.setState({className: 'drop-zone-hide'});
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  _onDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
 /*   if (files) {
      const fileType = files[0].type;
      const isImage = /^(image)\//i.test(fileType);
      if (isImage) {
        this.props.handle_Drop(files);
      } else {
        console.log('Invalid');
      }
    }*/
    this.props.handle_Drop(e);
    // Upload files
    this.setState({className: 'drop-zone-hide'});
    return false;
  }

  cloneEvent(type, event) {
    const evt = new Event(type);
    return Object.setPrototypeOf(evt, event);
  }

  render() {
    return (
      <div className='box has-advanced-upload'>
        {this.props.children}
        <div id='dragbox'>
          {}
        </div>
      </div>
    );
  }
}

// @ts-ignore
DropZone.propTypes = {
  handle_Drop: PropTypes.func,
};

export default DropZone;
