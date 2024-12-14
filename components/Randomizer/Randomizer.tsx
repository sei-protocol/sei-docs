// These values can be used in markdown, and even inside codeblocks

import React, { useState, useEffect } from 'react'; // Explicit React import for JSX
import { randomValueSets } from './RandomConfigs';

interface RandomizerProps {
  values?: string[]; // directly pass a list of values, example: <Randomizer values={['customValue1', 'customValue2', 'customValue3']} />
  setKey?: keyof typeof randomValueSets; // predefined set of values by key, defined in ./RandomConfigs.ts
  interval?: number; // re-roll interval in ms (default: 1h)
}

const Randomizer: React.FC<RandomizerProps> = ({ values, setKey, interval = 3600000 }) => {
  const [randomValue, setRandomValue] = useState<string>(() => {
    // initial value
    const selectedValues = values || (setKey ? randomValueSets[setKey] : []);
    return selectedValues.length > 0 ? selectedValues[0] : '';
  });

  useEffect(() => {
    const selectedValues = values || (setKey ? randomValueSets[setKey] : []);
    if (selectedValues.length === 0) return;

    // pick a random value
    const pickRandomValue = () =>
      selectedValues[Math.floor(Math.random() * selectedValues.length)];

    // set initial value
    setRandomValue(pickRandomValue());

    // set re-roll interval
    const intervalId = setInterval(() => {
      setRandomValue(pickRandomValue());
    }, interval);

    // cleanup interval
    return () => clearInterval(intervalId);
  }, [values, setKey, interval]);

  // render value as plaintext
  return <div>{randomValue}</div>;
};

export default Randomizer;
