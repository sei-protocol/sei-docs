import React from 'react';
import Image from 'next/image';

interface LearningPathCardProps {
  doc: {
    id: number;
    name: string;
    link: string;
    logo?: {
      url: string;
      alt: string;
    };
  };
  onComplete: (id: number) => void;
  isCompleted: boolean;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ doc, onComplete, isCompleted }) => {
  const { name, logo, link } = doc;

  return (
    <div className="relative flex items-center p-4 rounded-lg bg-dark shadow-lg transition-transform transform hover:-translate-y-1 border border-transparent">
      <a href={link} className="flex items-center">
        {logo && (
          <div className="mr-4">
            <Image src={logo.url} alt={logo.alt} width={32} height={32} className="rounded-md" />
          </div>
        )}
        <h4 className={`text-md font-semibold ${isCompleted ? 'line-through text-gray' : 'text-light'}`}>
          {name}
        </h4>
      </a>

      <button
        onClick={() => onComplete(doc.id)}
        className={`ml-auto w-5 h-5 ${isCompleted ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}
      >
        {isCompleted && '✓'}
      </button>
    </div>
  );
};

export default LearningPathCard;