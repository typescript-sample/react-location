import * as React from 'react';
import './carousel.css';

export default function Carousel(props) {
  const { children, infiniteLoop} = props;
  const widthItem = React.useRef<number>(0);
  const counter = React.useRef<number>(null);
  const slidersLength = React.useRef<number>(0);
  const touchPosition = React.useRef<number>(null);
  const slider = React.useRef<HTMLDivElement>(null);
  const sliderContainer = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<any>(null);
  const widthFullScreen = React.useRef<number>(null);
  const slideContentWrap = React.useRef<HTMLDivElement>(null);
  const widthSlideContentWrap = React.useRef<number>(0);

  React.useEffect(() => {
    widthFullScreen.current = screen.width;
    widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
  }, []);

  React.useLayoutEffect(() => {
    infiniteLoop ? counter.current = 1 : counter.current = 0;
    window.addEventListener('resize', handleResize);
    window.addEventListener('mouseup', handleResize);
    window.addEventListener('touchend', handleResize);
    handleWidth();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleResize);
      window.removeEventListener('touchend', handleResize);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [children]);

  const handleResize = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (widthFullScreen.current === window.innerWidth && document.fullscreenElement) {
      return;
    }
    if (widthFullScreen.current !== screen.width) {
      widthFullScreen.current = screen.width;
      typingTimeoutRef.current = setTimeout(() => {
        handleWidth();
      }, 200);
      widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
      return;
    }
    if (slideContentWrap.current && widthSlideContentWrap.current !== slideContentWrap.current.offsetWidth) {
      typingTimeoutRef.current = setTimeout(() => {
        handleWidth();
      }, 200);
      widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
      return;
    }
    typingTimeoutRef.current = setTimeout(() => {
      handleWidth();
    }, 200);
  };

  const handleWidth = () => {
    const slideItems = sliderContainer.current.children;
    console.log( slideContentWrap.current.offsetWidth);
    slidersLength.current = slideItems.length;
    widthItem.current = slideContentWrap.current.offsetWidth;
    Array.from(slideItems).forEach((item: HTMLElement) => {
      item.style.width = slideContentWrap.current.offsetWidth + 'px';
    });
    sliderContainer.current.style.width = widthItem.current * slidersLength.current + 'px';
    sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
    sliderContainer.current.style.transform =
      'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
  };

  const handleTransitionEnd = () => {
    if ( sliderContainer.current.children[counter.current].id === 'lastClone' ) {
      sliderContainer.current.style.transition = 'none';
      counter.current = slidersLength.current - 2;
      sliderContainer.current.style.transform =
        'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    }
    if ( sliderContainer.current.children[counter.current].id === 'firstClone' ) {
      sliderContainer.current.style.transition = 'none';
      counter.current = slidersLength.current - counter.current;
      sliderContainer.current.style.transform =
        'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    }
  };

  const prev = () => {
    if (counter.current <= 0) {return ; }
    sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
    counter.current--;
    sliderContainer.current.style.transform =
      'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    clearVideo();
  };

  const next = () => {
    if (counter.current >= slidersLength.current - 1) {return ; }
    sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
    counter.current++;
    sliderContainer.current.style.transform =
      'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    clearVideo();
  };

  const handleDots = (index) => {
    if (infiniteLoop) {
      index++;
    }
    if (counter.current !== index) {
      counter.current = index;
      sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
      sliderContainer.current.style.transform =
        'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    }
    clearVideo();
  };

  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    touchPosition.current = touchDown;
  };

  const handleTouchMove = (e) => {
    const touchDown = touchPosition.current;
    if (touchDown === null) {
      return;
    }
    const currentTouch = e.touches[0].clientX;
    const diff = touchDown - currentTouch;
    if (diff > 5) {
      next();
    }
    if (diff < -5) {
      prev();
    }
    touchPosition.current = null;
  };

  const clearVideo = () => {
    const tagVideo = sliderContainer.current.querySelector(
      '.slider-items > video'
    ) || sliderContainer.current.querySelector(
      '.slider-items > iframe'
    );
    const tagBtnVideo = tagVideo && tagVideo.parentElement.querySelector('.btn-play');
    const tagThumbnail = tagVideo && tagVideo.parentElement.querySelector('.thumbnail-container');
    if (tagVideo) {
      tagVideo.remove();
      tagBtnVideo.classList.remove('displayNone');
      tagThumbnail.classList.remove('opacity-0');
    }
  };

  return (
    <div className='slider' ref={slider}>
        {
          children.length > 1 && (
            <>
              <span id='btn-prev' onClick={prev}>
                &lt;
              </span>
              <span id='btn-next' onClick={next}>
                &gt;
              </span>
            </>
          )
        }
      <div
        className='slider-content-wrapper'
        ref={slideContentWrap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          className='slider-container'
          ref={sliderContainer}
          onTransitionEnd={() => handleTransitionEnd()}
        >
          {infiniteLoop &&
              <div
                className='slider-items'
                id='lastClone'
              >
                {children[children.length - 1]}
              </div>
          }
          {children.map((item, index) => (
              <div className='slider-items' key={`slider-items-${index}`}>
                {item}
              </div>
            )
          )}
          {infiniteLoop &&
              <div
                className='slider-items'
                id='firstClone'
              >
                {children[0]}
              </div>
          }
        </div>
      </div>
     {/* <div className='slider-dots'>
        {
           children.map((item, index) => (
              <button key={index} onClick={() => handleDots(index)}>
                {index}
              </button>
            ))}
      </div> */}
    </div>
  );
}
