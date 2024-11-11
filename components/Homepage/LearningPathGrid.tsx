import React from 'react';
import LearningPathCard from './LearningPathCard';

interface LearningPathData {
  id: number;
  name: string;
  link: string;
  logo: {
    url: string;
    alt: string;
  };
}

interface LearningPathGridProps {
  title: string;
  data: LearningPathData[];
  color: string;
}

const LearningPathGrid: React.FC<LearningPathGridProps> = ({ title, data, color }) => {
  
  return (
    <div className="mb-16 relative">
      {/* Title with gradient */}
      <h3 className={`text-xl font-bold mb-6 text-light ${color}`}>
        {title}
      </h3>

      {/* Visual connectors between cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {data.map((doc, index) => (
          <>
            {index > 0 && (
              // Connector line between cards
              <div
                className={`absolute h-px w-full bg-gradient-to-r from-crimson to-transparent top-[50%] left-[50%] transform translate-x-[50%]`}
              />
            )}
            <LearningPathCard key={doc.id} doc={doc} />
          </>
        ))}
      </div>
    </div>
  );
};

export default LearningPathGrid;