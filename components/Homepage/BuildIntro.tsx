import React, { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Button,
  Group,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react';
import v2BannerImg from '../../public/assets/sei-temp-gradient.png';

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

  const containerStyles = {
    position: 'relative' as const,
    padding: '60px 20px',
    background: `url(${v2BannerImg.src}) center/cover no-repeat`,
    color: theme.white,
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  };

  const overlayStyles = {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  };

  const contentStyles = {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '800px',
    fontFamily: 'Satoshi, sans-serif',
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 600,
    marginBottom: '10px',
  };

  const subtitleStyles = {
    fontSize: '1.25rem',
    marginBottom: '20px',
    lineHeight: 1.5,
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  };

  const scrollStyles = {
    marginTop: '30px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    color: theme.white,
  };

  return (
    <section style={containerStyles}>
      <div style={overlayStyles} />
      <div style={contentStyles}>
        <Title order={1} style={titleStyles}>
          {title}
        </Title>
        <Text style={subtitleStyles}>{subtitle}</Text>
        {descriptions.length > 0 && (
          <Text>{descriptions[activeDescription]}</Text>
        )}
        {(primaryButtonText || secondaryButtonText) && (
          <div style={buttonContainerStyles}>
            {primaryButtonText && primaryButtonLink && (
              <Button
                variant="filled"
                color="red"
                size="md"
                component="a"
                href={primaryButtonLink}
                leftIcon={<IconArrowRight size={18} />}
              >
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
          <div style={scrollStyles} onClick={onScrollToDocs}>
            <Text size="sm">{scrollText}</Text>
            <IconChevronDown size={28} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BuildIntro;
