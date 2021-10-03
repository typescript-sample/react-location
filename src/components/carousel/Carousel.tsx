import * as React from 'react';
import '../../assets/css/carousel.css';

export default function Carousel(props) {
  const { children, infiniteLoop} = props;
  const widthItem = React.useRef<number>(0);
  const counter = React.useRef<number>(null);
  const slidersLength = React.useRef<number>(0);
  const touchPosition = React.useRef<number>(null);
  const slider = React.useRef<HTMLDivElement>(null);
  const sliderContainer = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    infiniteLoop ? counter.current = 1 : counter.current = 0;
    window.addEventListener('resize', handleWidth);
    handleWidth();
    return () => {
      window.removeEventListener('resize', handleWidth);
    };
  }, []);

  const handleWidth = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      const slideItems = sliderContainer.current.children;
      slidersLength.current = slideItems.length;
      widthItem.current = slider.current.offsetWidth;
      Array.from(slideItems).forEach((item: HTMLElement) => {
        item.style.width = slider.current.offsetWidth + 'px';
      });
      sliderContainer.current.style.width =
        widthItem.current * slidersLength.current + 'px';
      sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
      sliderContainer.current.style.transform =
        'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
    }, 200);
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
    console.log(counter.current);
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
    );
    if (tagVideo) {
      sliderContainer.current.querySelector('.slider-items > video').remove();
    }
  };

  return (
    <div className='slider' ref={slider}>
        <span id='btn-prev' onClick={prev}>
          &lt;
        </span>
        <span id='btn-next' onClick={next}>
          &gt;
        </span>
      <div
        className='slider-content-wrapper'
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
          ))}
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
