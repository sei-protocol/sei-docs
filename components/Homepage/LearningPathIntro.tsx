import React from 'react';
import { motion } from 'framer-motion';

const LearningPathIntro: React.FC = () => {
  return (
    <motion.div
      className="relative py-10 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 mb-4">
          Developer Learning Paths
        </h2>
        <p className="text-lg text-gray-400 mb-4">
          Embark on a journey tailored for your expertise—beginner, intermediate, or advanced.
        </p>
      </div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent to-red-600"></div>
    </motion.div>
  );
};

export default LearningPathIntro;
