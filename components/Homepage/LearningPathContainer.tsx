import React from 'react';
import LearningPathIntro from './LearningPathIntro';
import LearningPathColumn from './LearningPathColumn';

interface LearningPathData {
  id: number;
  name: string;
  link: string;
}

interface LearningPathContainerProps {
  data: {
    beginner: LearningPathData[];
    intermediate: LearningPathData[];
    advanced: LearningPathData[];
  };
}

const LearningPathContainer: React.FC<LearningPathContainerProps> = ({ data }) => {

  return (
    <section className="py-16 bg-dark">
      <LearningPathIntro />

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <LearningPathColumn title="Beginner Path" data={data.beginner} />
        <LearningPathColumn title="Intermediate Path" data={data.intermediate} />
        <LearningPathColumn title="Advanced Path" data={data.advanced} />
      </div>
    </section>
  );
};

export default LearningPathContainer;