import React from 'react';
import LearningPathIntro from './LearningPathIntro';
import LearningPathGrid from './LearningPathGrid';

interface LearningPathContainerProps {
  data: {
    beginner: Array<{
      id: number;
      name: string;
      link: string;
      logo: {
        url: string;
        alt: string;
      };
    }>;
    intermediate: Array<{
      id: number;
      name: string;
      link: string;
      logo: {
        url: string;
        alt: string;
      };
    }>;
    advanced: Array<{
      id: number;
      name: string;
      link: string;
      logo: {
        url: string;
        alt: string;
      };
    }>;
  };
}

const LearningPathContainer: React.FC<LearningPathContainerProps> = ({ data }) => {
  return (
    <section className="py-12 bg-gray-900">
      <LearningPathIntro />
      <div className="flex flex-col space-y-12">
        <LearningPathGrid title="Beginner Path" data={data.beginner} />
        <LearningPathGrid title="Intermediate Path" data={data.intermediate} />
        <LearningPathGrid title="Advanced Path" data={data.advanced} />
      </div>
    </section>
  );
};

export default LearningPathContainer;
