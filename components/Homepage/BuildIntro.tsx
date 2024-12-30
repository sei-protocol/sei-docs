import React, { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Button,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react';
import v2BannerImg from '../../public/assets/sei-temp-gradient.png';
import styles from '../../styles/BuildIntro.module.css';

interface BuildIntroProps {
  onScrollToDocs?: () => void;
  title: string;
  subtitle: string;
  descriptions?: string[];
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  scrollText?: string;
}

const BuildIntro: React.FC<BuildIntroProps> = ({
  onScrollToDocs,
  title,
  subtitle,
  descriptions = [],
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  scrollText = "Scroll down",
}) => {
  const theme = useMantineTheme();
  const [activeDescription, setActiveDescription] = useState(0);

  useEffect(() => {
    if (descriptions.length > 1) {
      const interval = setInterval(() => {
        setActiveDescription((prev) => (prev + 1) % descriptions.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [descriptions]);

  return (
    <section
      className={styles.container}
      style={{ backgroundImage: `url(${v2BannerImg.src})` }}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Title order={1} className={styles.title}>
          {title}
        </Title>
        <Text className={styles.subtitle}>{subtitle}</Text>
        {descriptions.length > 0 && (
          <Text className={styles.description}>
            {descriptions[activeDescription]}
          </Text>
        )}
        {(primaryButtonText || secondaryButtonText) && (
          <div className={styles.buttonContainer}>
            {primaryButtonText && primaryButtonLink && (
              <Button
                variant="filled"
                color="red"
                size="md"
                component="a"
                href={primaryButtonLink}
              >
                <IconArrowRight size={18} style={{ marginRight: 8 }} />
                {primaryButtonText}
              </Button>
            )}
            {secondaryButtonText && secondaryButtonLink && (
              <Button
                variant="outline"
                color="gray"
                size="md"
                component="a"
                href={secondaryButtonLink}
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>
        )}
        {onScrollToDocs && (
          <div className={styles.scroll} onClick={onScrollToDocs}>
            <Text className={styles.scrollText}>{scrollText}</Text>
            <IconChevronDown size={28} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BuildIntro;
