import React from 'react';
import Image from 'next/image';

interface LearningPathCardProps {
  doc: {
    name: string;
    link: string;
    logo?: {
      url: string;
      alt: string;
    };
  };
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ doc }) => {
  const { name, logo, link } = doc;

  return (
    <a
      href={link}
      className="flex items-center p-4 rounded-lg bg-dark shadow-lg transition-transform transform hover:-translate-y-1 border border-transparent"
    >
      {logo && (
        <div className="mr-4">
          <Image src={logo.url} alt={logo.alt} width={32} height={32} className="rounded-md" />
        </div>
      )}
      <h4 className="text-md font-semibold text-light">{name}</h4>
    </a>
  );
};

export default LearningPathCard;