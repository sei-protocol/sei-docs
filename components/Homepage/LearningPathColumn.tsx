import React, { useState, useEffect } from 'react';
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
}

const LearningPathColumn: React.FC<LearningPathColumnProps> = ({ title, data }) => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProgress = JSON.parse(localStorage.getItem(title) || '[]');
      setCompletedTasks(storedProgress);
    }
  }, [title]);

  const handleCompleteTask = (id: number) => {
    let updatedTasks = [...completedTasks];
    if (completedTasks.includes(id)) {
      updatedTasks = updatedTasks.filter(taskId => taskId !== id);
    } else {
      updatedTasks.push(id);
    }
    setCompletedTasks(updatedTasks);
    localStorage.setItem(title, JSON.stringify(updatedTasks));
  };

  return (
    <div className="learning-path-column p-4 rounded-lg shadow-lg bg-dark">
      <h3 className="text-xl font-bold mb-6 text-light">
        {title}
      </h3>

      <div className="space-y-4 relative">
        {data.map((doc) => (
          <LearningPathCard
            key={doc.id}
            doc={doc}
            onComplete={handleCompleteTask}
            isCompleted={completedTasks.includes(doc.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default LearningPathColumn;