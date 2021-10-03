import * as React from 'react';

export const Loading = (props) => {
  const loadingStyle = {
    top: '30%',
    backgroundColor: 'white',
    border: 'none',
    'WebkitBoxShadow': 'none',
    'boxShadow': 'none'
  };
  if (props.error) {
    return React.createElement('div', {}, 'Error Load Module!');
  } else {
    return (
      <div className='loader-wrapper'>
        <div className='loader-sign' style={loadingStyle}>
          <div className='loader' />
        </div>
      </div>
    );
  }
};
