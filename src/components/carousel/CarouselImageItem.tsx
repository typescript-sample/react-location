import * as React from 'react';

export default function CarouselImageItem({url}) {
    return (
        <img className='image-carousel' src={url} alt={url} draggable={false}/>
    );
}
