import React from 'react';
interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}
const Card = ({
  title,
  children,
  className = ''
}: CardProps) => {
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>}
      <div className="p-4">{children}</div>
    </div>;
};
export default Card;