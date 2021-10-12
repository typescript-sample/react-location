import * as React from 'react';
import { FileUploads } from '../model';

const RenderItem = (props: {item: FileUploads}) => {
  if (props.item.source === 'youtube' && props.item.type === 'video') {
    return (
      <div className='col xl11 l11 m11 s11'>
        <div className='data-item'>
        <iframe
          width='338'
          height='190'
          src={props.item.url}
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;'
        />
      </div>
      </div>
    );
  } else if (props.item.source === 'google-storage' && props.item.type === 'video') {
    return (
      <div className='col xl11 l11 m11 s11'>
        <div className='data-item'>
          <video controls={true} width='338' height='190' className='video-uploaded' src={props.item.url} />
        </div>
      </div>
    );
  } else {
    return (
      <div className='col xl11 l11 m11 s11'>
        <div className='data-item'>
          <img className='image-uploaded' src={props.item.url} alt='image-uploads'/>
        </div>
      </div>
    );
  }
};
export default RenderItem;
