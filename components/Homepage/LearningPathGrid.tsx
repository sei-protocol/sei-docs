import React from 'react';
import LearningPathCard from './LearningPathCard';

interface LearningPathGridProps {
  title: string;
  data: Array<{
    id: number;
    name: string;
    link: string;
    logo: {
      url: string;
      alt: string;
    };
  }>;
}

const LearningPathGrid: React.FC<LearningPathGridProps> = ({ title, data }) => {
  return (
    <div className="path-grid bg-dark p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-200 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((doc) => (
          <LearningPathCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
};

export default LearningPathGrid;
