import * as React from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropImage(props: {image: any, setCropImage: any}) {
  const [upImg, setUpImg] = React.useState<any>();
  const imgRef = React.useRef(null);
  const previewCanvasRef = React.useRef(null);
  const [crop, setCrop] = React.useState({ unit: '%', width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = React.useState(null);

  React.useEffect(() => {
    onSelectFile(props.image);
  }, []);

  const onSelectFile = (file: Blob) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(file);
  };

  const onLoad = React.useCallback((img) => {
    imgRef.current = img;
  }, []);

  React.useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    const imagee = new Image();
    imagee.src = canvas.toDataURL();
    props.setCropImage(imagee.src);
  }, [completedCrop]);

  return (
    <div className='Crop-Image'>
      <ReactCrop
        src={upImg}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
      />
      <div style={{display: 'none'}}>
        <canvas
          ref={previewCanvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0)
          }}
        />
      </div>
    </div>
  );
}
