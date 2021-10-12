import * as React from 'react';
import CropImage from './CropImage';
import Loading from './Loading';
import { dataURLtoFile } from './UploadHook';


const UploadsModal = (props: { file: File, setFile: any, upload: any, state: any }) => {
  const [cropImage, setCropImage] = React.useState<string>(null);
  const [select, setSelect] = React.useState<boolean>(false);
  const [isCrop, setIsCrop] = React.useState<boolean>(false);
  const handleSelectFile = (event) => {
    const fileUpload = event.target.files[0];
    if (fileUpload) {
      props.setFile(fileUpload);
    }
  };
  const handleDelete = () => {
    props.setFile(null);
    if (cropImage) {
      setCropImage(null);
      setSelect(null);
      setIsCrop(false);
    }
  };

  const handleSelectCropImage = () => {
    if (cropImage) {
      props.setFile(dataURLtoFile(cropImage, props.file.name));
      setIsCrop(true);
      setSelect(true);
    }
  };

  return (
    <div className='upload-modal'>
      <div className='frame'>
        <div className='center'>
          {props.file !== null ? (
            <>
              <p className='file-name'>{props.file.name}</p>
              <div className='preview-image'>
                {(props.file.type === 'image/jpeg' || props.file.type === 'image/png') &&
                  <div>
                    {
                      select ? (
                        <img className='image-cut' src={URL.createObjectURL(props.file)} alt='file' />
                      ) : (
                        <>
                          <CropImage image={props.file} setCropImage={setCropImage}/>
                          <button onClick={handleSelectCropImage}>Select</button>
                        </>
                      )
                    }
                  </div>
                }
                </div>
              <div className='row btn-area'>
                {props.state.loading ? (
                  <div className='loading col xl5 md5 s5' style={{ position: 'relative' }}>
                    <Loading />
                  </div>
                ) : (
                  <button disabled={props.file.type === 'image' && !isCrop} className='btn col xl5 md5 s5' type='button' onClick={() => props.upload()}>
                    Upload
                  </button>
                )}
                <button disabled={props.state.loading} className='btn remove col xl5 md5 s5' type='button' onClick={handleDelete}>
                  Remove
                </button>
              </div>
            </>
          ) : (
            <>
              <div className='title'>
                <h1>Drop file to upload</h1>
              </div>
              <div className='dropzone'>
                <label className='area' htmlFor='upload'>
                  <div>
                    <img alt='upload' src='http://100dayscss.com/codepen/upload.svg' className='upload-icon' />
                    <p>Or Click Here!</p>
                    <input id='upload' type='file' accept={`*`} className='upload-input' onChange={handleSelectFile} />
                  </div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default UploadsModal;
