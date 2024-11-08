import React, { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Button,
  Group,
  useMantineTheme,
  Transition,
} from '@mantine/core';
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react';
import v2BannerImg from '../../public/assets/sei-v2-banner.jpg';

interface SeiIntroProps {
  onScrollToDocs: () => void;
}

const SeiIntro: React.FC<SeiIntroProps> = ({ onScrollToDocs }) => {
  const theme = useMantineTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroStyles = {
    position: 'relative' as const,
    height: '80vh',
    backgroundImage: `url(${v2BannerImg.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.white,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    overflow: 'hidden',
  };

  const overlayStyles = {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  const contentStyles = {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: `${theme.spacing.md}px ${theme.spacing.sm}px`,
    textAlign: 'center' as const,
    fontFamily: 'Satoshi, sans-serif',
  };

  const titleStyles = {
    fontSize: '3.5rem',
    fontWeight: 500,
    marginBottom: theme.spacing.sm,
    lineHeight: 1.1,
    color: '#ECEDEE',
  };

  const subtitleStyles = {
    fontSize: '1.1rem',
    marginBottom: theme.spacing.sm,
    lineHeight: 1.4,
    color: '#ECEDEE',
    fontWeight: 500,
  };

  const buttonsStyles = {
    marginTop: theme.spacing.sm,
    justifyContent: 'center',
  };

  const buttonStyles = {
    height: '2.5rem',
    padding: '0 1.5rem',
    fontSize: '0.9rem',
    fontFamily: 'Satoshi, sans-serif',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const scrollIndicatorContainerStyles = {
    position: 'absolute' as const,
    bottom: theme.spacing.md,
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const scrollTextStyles = {
    color: '#ECEDEE',
    fontFamily: 'Satoshi, sans-serif',
    fontSize: '0.9rem',
    marginBottom: theme.spacing.xs,
  };

  const scrollIconStyles = {
    animation: 'bounce 2s infinite',
    color: '#ECEDEE',
    cursor: 'pointer',
  };

  const bounceAnimation = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  `;

  const keyframesStyle = <style>{bounceAnimation}</style>;

  return (
    <section style={heroStyles}>
      {keyframesStyle}
      <div style={overlayStyles} />
      <Transition
        mounted={mounted}
        transition="fade"
        duration={800}
        timingFunction="ease"
      >
        {(styles) => (
          <div style={{ ...contentStyles, ...styles }}>
            <Title style={titleStyles}>Welcome to Sei Network</Title>
            <Text style={subtitleStyles}>
              The first parallelized EVM blockchain delivering unmatched
              scalability with a developer-focused approach.
            </Text>
            <Group style={buttonsStyles}>
              <Button
                variant="gradient"
                gradient={{ from: '#9E1F19', to: '#780000', deg: 135 }}
                size="md"
                style={buttonStyles}
                component="a"
                href="/users/user-quickstart"
              >
                Get Started <IconArrowRight size={18} />
              </Button>
              <Button
                variant="outline"
                color="light"
                size="md"
                style={{
                  ...buttonStyles,
                  borderColor: '#ECEDEE',
                  color: '#ECEDEE',
                }}
                component="a"
                href="/learn/general-overview"
              >
                Learn More
              </Button>
            </Group>
          </div>
        )}
      </Transition>
      <div style={scrollIndicatorContainerStyles}>
        <Text style={scrollTextStyles}>Find your starting point</Text>
        <IconChevronDown
          size={28}
          style={scrollIconStyles}
          aria-hidden="true"
          onClick={onScrollToDocs}
        />
      </div>
    </section>
  );
};

export default SeiIntro;
