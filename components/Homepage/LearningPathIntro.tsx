import React from 'react';

const LearningPathIntro: React.FC = () => {
  return (
    <div className="relative py-12 mb-16 bg-gradient-to-r from-maroon via-crimson to-dark rounded-xl shadow-lg overflow-hidden">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-5xl font-extrabold text-light mb-6">
          Developer Learning Paths
        </h2>
        <p className="text-xl text-gray mb-8 max-w-2xl mx-auto">
          Embark on a journey tailored for your expertise—beginner, intermediate, or advanced.
        </p>
      </div>
    </div>
  );
};

export default LearningPathIntro;