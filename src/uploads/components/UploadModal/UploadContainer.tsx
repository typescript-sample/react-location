import * as React from 'react';
import { useUpload } from './UploadHook';
import UploadsModal from './UploadModal';
import './Uploads.scss';

const Uploads = (props?: {handleFetch?: any}) => {
  const {file, setFile, state, setState, upload} = useUpload();

  const handleUpload = async () => {
    await upload();
    props.handleFetch();
  };

  return (
    <div className='upload' style={{ height: 'auto' }}>
      <UploadsModal file={file} setFile={setFile} state={state} upload={handleUpload} />
    </div>
  );
};
export default Uploads;
