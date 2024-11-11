import React from 'react';
import { motion } from 'framer-motion';

const LearningPathIntro: React.FC = () => {
  return (
    <motion.div
      className="relative py-12 mb-16 bg-gradient-to-r from-maroon via-crimson to-dark rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto text-center px-4">
        <h2 className="text-5xl font-extrabold text-light mb-6">
          Developer Learning Paths
        </h2>
        <p className="text-xl text-gray mb-8 max-w-2xl mx-auto">
          Embark on a journey tailored for your expertise—beginner, intermediate, or advanced.
        </p>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-maroon via-crimson to-transparent opacity-30"
          animate={{
            scale: [1, 1.05],
            rotate: [0, 5],
            opacity: [0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
    </motion.div>
  );
};

export default LearningPathIntro;