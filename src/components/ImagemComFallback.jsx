import React from 'react';

const ImagemComFallback = ({ src, alt, className }) => {
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = 'http://localhost:5053/images/sem-foto.jpg';
  };

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={className}
    />
  );
};

export default ImagemComFallback;