import { useState } from 'react';

const BusinessLogo = ({ 
  logo, 
  businessName, 
  size = 'md', 
  className = '',
  showBorder = true 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{ 
        backgroundColor: 'rgba(144, 224, 247, 0.1)',
        border: showBorder ? '2px solid rgba(255, 255, 255, 0.2)' : 'none'
      }}
    >
      {logo && !imageError ? (
        <img 
          src={logo} 
          alt={`${businessName} logo`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ 
            backgroundColor: 'rgba(144, 224, 247, 0.2)'
          }}
        >
          {businessName ? businessName.charAt(0).toUpperCase() : 'B'}
        </div>
      )}
    </div>
  );
};

export default BusinessLogo;
