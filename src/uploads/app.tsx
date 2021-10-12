import * as React from 'react';
import { async } from 'rxjs/internal/scheduler/async';
import Uploads from 'src/uploads/components/UploadModal/UploadContainer';
import './app.scss';
import DragDrop from './components/DragDrop';
import { FileUploads } from './model';
import { deleteFile, deleteFileYoutube, fetchImageUploaded, getUser, uploadVideoYoutube } from './service';

const UploadFile = () => {
  const [filesUploaded, setFilesUploaded] = React.useState<FileUploads[]>();
  const [videoIdInput, setVideoIdInput] = React.useState<string>('');
  React.useEffect(() => {
    handleFetch();
  }, []);

  const handleFetch = async() => {
    const res = await fetchImageUploaded();
    const user = await getUser();
    setFilesUploaded(res);
  };

  const handleDeleteFile = async(url: string, source: string) => {
    if (source === 'youtube') {
      await deleteFileYoutube(url);
      await handleFetch();
    } else {
      await deleteFile(url);
      await handleFetch();
    }
  };

  const handleInput = (e: { target: { value: string }; }) => {
    setVideoIdInput(e.target.value);
  };

  const handleAddVideoYoutube = async() => {
    if (videoIdInput !== '') {
      uploadVideoYoutube(videoIdInput).then((r) => {
        setVideoIdInput('');
      });
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col xl4 l5 m12 s12'>
          <div style={{textAlign: 'center'}}>
            <Uploads handleFetch={handleFetch}/>
            <div className='youtube-add'>
              <input onChange={handleInput} value={videoIdInput} className='input-video-id' type='type' placeholder='Input youtube video id' />
              <button className='btn-add-youtube' onClick={handleAddVideoYoutube}>
                <i className='material-icons icon-delete'>library_add</i>
              </button>
            </div>
          </div>
        </div>
        <div className='col xl8 l7 m12 s12'>
          <div className='file-area'>
            <div className='label'>
              <i className='menu-type' />
              <div style={{display: 'flex', alignItems: 'center'}}>
                <i className='material-icons menu-type'>description</i>
                <span className='menu-type'>File</span>
              </div>
            </div>
            {filesUploaded && filesUploaded.length > 0 && <DragDrop setList={setFilesUploaded} handleDeleteFile={handleDeleteFile} list={filesUploaded}/>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UploadFile;
