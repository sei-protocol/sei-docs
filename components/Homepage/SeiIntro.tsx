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
import v2BannerImg from '../../public/assets/sei-temp-gradient.png';

interface SeiIntroProps {
  onScrollToDocs: () => void;
}

const SeiIntro: React.FC<SeiIntroProps> = ({ onScrollToDocs }) => {
  const theme = useMantineTheme();
  const [mounted, setMounted] = useState(false);
  const [activeDescription, setActiveDescription] = useState(0);
  const descriptions = [
    'The first parallelized EVM blockchain delivering unmatched scalability.',
    'Built for developers, offering robust tools and support.',
    'Experience unparalleled transaction speed and security.',
  ];

  useEffect(() => {
    setMounted(true);
    const descriptionInterval = setInterval(() => {
      setActiveDescription((prev) => (prev + 1) % descriptions.length);
    }, 4000);
    return () => clearInterval(descriptionInterval);
  }, []);

  const heroStyles = {
    position: 'relative' as const,
    height: '70vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.white,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    padding: '0 20px',
  };

  const overlayStyles = {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))',
    animation: 'gradientShift 10s ease-in-out infinite',
  };

  const contentStyles = {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '800px',
    textAlign: 'center' as const,
    fontFamily: 'Satoshi, sans-serif',
  };

  const titleStyles = {
    fontSize: '3.5rem',
    fontWeight: 500,
    lineHeight: 1.1,
    color: '#ECEDEE',
    position: 'relative' as const,
    display: 'inline-block',
    marginBottom: theme.spacing.sm,
    paddingBottom: '10px',
  };

  const underlineStyles = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #9E1F19, #780000)',
    borderRadius: '1.5px',
    opacity: 0.8,
  };

  const subtitleStyles = {
    fontSize: '1.1rem',
    marginBottom: theme.spacing.md,
    lineHeight: 1.4,
    color: '#ECEDEE',
    fontWeight: 500,
    padding: '0 10px',
  };

  const buttonsStyles = {
    marginTop: theme.spacing.md,
    justifyContent: 'center',
    display: 'flex',
    gap: '15px',
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
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const buttonHoverStyles = {
    transform: 'translateY(-2px)',
    boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.15)',
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
    color: '#ECEDEE',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
    opacity: 0.8,
    '&:hover': { opacity: 1 },
  };

  const animations = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  const animationsStyle = <style>{animations}</style>;

  return (
    <section style={heroStyles}>
      <img
        src={v2BannerImg.src}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      {animationsStyle}
      <div style={overlayStyles} />
      <Transition
        mounted={mounted}
        transition="fade"
        duration={800}
        timingFunction="ease"
      >
        {(styles) => (
          <div style={{ ...contentStyles, ...styles }}>
            <Title style={titleStyles}>
              Welcome to Sei Network
              <div style={underlineStyles}></div>
            </Title>
            <Text style={subtitleStyles}>{descriptions[activeDescription]}</Text>
            <Group style={buttonsStyles}>
              <Button
                variant="gradient"
                gradient={{ from: '#9E1F19', to: '#780000', deg: 135 }}
                size="md"
                style={{ ...buttonStyles }}
                component="a"
                href="/users/user-quickstart"
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = 'translateY(-2px)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = 'translateY(0)')
                }
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
