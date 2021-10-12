import * as React from 'react';
import Carousel from 'src/components/carousel/Carousel';
import CarouselImageItem from 'src/components/carousel/CarouselImageItem';
import CarouselVideoItem from 'src/components/carousel/CarouselVideoItem';
import imgDefault from './img/video-youtube.png';
import { FileUploads } from './model';
import { fetchImageUploaded, fetchThumbnailVideo } from './service';
import './style.css';

export default function UserCarousel({user, edit}) {
    const [files, setFiles] = React.useState<FileUploads[]>();
    React.useEffect(() => {
        handleFetch();
    }, [user]);
    const handleFetch = async() => {
        const res = await fetchImageUploaded(user.userId);
        if (res && res.length > 0) {
            for (const item of res) {
                if (item.type === 'youtube') {
                    const thumbnails = await fetchThumbnailVideo(item.url);
                    item.thumbnail = thumbnails.thumbnail;
                    item.standardThumbnail = thumbnails.standardThumbnail;
                    item.mediumThumbnail = thumbnails.mediumThumbnail;
                    item.maxresThumbnail = thumbnails.maxresThumbnail;
                    item.hightThumbnail = thumbnails.hightThumbnail;
                }
            }
            setFiles(res);
        } else {
            const info: FileUploads[] = [{
                source: '',
                type: 'image',
                url: user.imageURL,
            }];
            setFiles(info);
        }
    };
    return (
        <div className='user-carousel-container'>
            {files && files.length > 0 ? (
                <Carousel infiniteLoop={true}>
                    {files.map((itemData, index) => {
                        switch (itemData.type) {
                            case 'video' :
                                return (
                                    <CarouselVideoItem key={index} type={itemData.type} srcVideo={itemData.url} srcPoster={imgDefault} namePorster={imgDefault}/>
                                );
                            case 'image' :
                                return (
                                    // <img className='image-carousel' src={itemData.url} key={index} alt={itemData.url} draggable={false}/>
                                    <CarouselImageItem key={index} url={itemData.url} />
                                );
                            case 'youtube':
                                const thumbnail = itemData.standardThumbnail || itemData.mediumThumbnail || itemData.thumbnail || itemData.maxresThumbnail || itemData.hightThumbnail;
                                return (
                                    <CarouselVideoItem key={index} type={itemData.type} srcVideo={itemData.url} srcPoster={thumbnail} namePorster={thumbnail}/>
                                );
                            default :
                                break;
                        }})
                    }
                </Carousel>
            ) : ''}
            <div className='user-carousel-content'>
                <h3 onClick={e => edit(e, user.userId)}  className={user.status === 'I' ? 'inactive' : ''}>{user.displayName}</h3>
                <p>{user.email}</p>
            </div>
        </div>
    );
}
