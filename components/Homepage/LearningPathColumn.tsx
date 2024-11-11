import React from 'react';
import LearningPathCard from './LearningPathCard';

interface LearningPathData {
  id: number;
  name: string;
  link: string;
  logo?: {
    url: string;
    alt: string;
  };
}

interface LearningPathColumnProps {
  title: string;
  data: LearningPathData[];
  colorClass?: string;
}

const LearningPathColumn: React.FC<LearningPathColumnProps> = ({ title, data, colorClass }) => {
  return (
    <div className={`learning-path-column p-4 rounded-lg shadow-lg bg-dark`}>
      <h3 className={`text-xl font-bold mb-6 text-light ${colorClass}`}>
        {title}
      </h3>
      <div className="space-y-4 relative">
        {data.map((doc, index) => (
          <div key={doc.id} className="relative">
            <LearningPathCard doc={doc} />
            {index !== data.length - 1 && (
              <div className="absolute left-[50%] transform -translate-x-[50%] h-full w-px bg-gradient-to-b from-light to-transparent top-full" />
            )}
          </div>
        ))}
      </div>
      <div className={`progress-line mt-4 h-px w-full bg-gradient-to-b from-light to-transparent`} />
    </div>
  );
};

export default LearningPathColumn;