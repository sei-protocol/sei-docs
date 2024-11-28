import React from 'react';
import { Card, Text, List, ThemeIcon, Group, Badge, Box } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconUsersGroup } from '@tabler/icons-react';

interface VMCardProps {
  title: string;
  benefits: string[];
  considerations: string[];
  useCases: string[];
  description?: string;
  documentation?: string;
  ecosystemSize?: 'Large' | 'Medium' | 'Growing';
}

const VMCard: React.FC<VMCardProps> = ({ 
  title, 
  benefits, 
  considerations, 
  useCases,
  description,
  documentation,
  ecosystemSize 
}) => {
  return (
    <Card 
      shadow="sm" 
      p="lg" 
      radius="md" 
      withBorder 
      style={{ 
        backgroundColor: '#001B2A',
        border: '1px solid #9E1F19',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="apart" mb="xs">
          <Group>
            <Text fw={700} size="xl" color="#ECEDEE">{title}</Text>
            {ecosystemSize && (
              <Badge 
                color={ecosystemSize === 'Large' ? 'green' : ecosystemSize === 'Medium' ? 'yellow' : 'blue'} 
                variant="light"
              >
                {ecosystemSize} Ecosystem
              </Badge>
            )}
          </Group>
          <Badge color="#9E1F19" variant="filled">Virtual Machine</Badge>
        </Group>
        {description && (
          <Text size="sm" color="#8CABA9" mt="xs">
            {description}
          </Text>
        )}
      </Card.Section>

      <Box my="md">
        <Text fw={700} mb="xs" color="#ECEDEE">Key Benefits</Text>
        <List 
          spacing="sm"
          size="sm" 
          icon={
            <ThemeIcon color="#8CABA9" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          }
        >
          {benefits.map((benefit, index) => (
            <List.Item key={index} color="#ECEDEE">{benefit}</List.Item>
          ))}
        </List>
      </Box>

      <Box my="md">
        <Text fw={700} mb="xs" color="#ECEDEE">Important Considerations</Text>
        <List 
          spacing="sm"
          size="sm" 
          icon={
            <ThemeIcon color="#9E1F19" size={24} radius="xl">
              <IconAlertTriangle size={16} />
            </ThemeIcon>
          }
        >
          {considerations.map((consideration, index) => (
            <List.Item key={index} color="#ECEDEE">{consideration}</List.Item>
          ))}
        </List>
      </Box>

      <Box my="md">
        <Text fw={700} mb="xs" color="#ECEDEE">Ideal Use Cases</Text>
        <List 
          spacing="sm"
          size="sm" 
          icon={
            <ThemeIcon color="#8CABA9" size={24} radius="xl">
              <IconUsersGroup size={16} />
            </ThemeIcon>
          }
        >
          {useCases.map((useCase, index) => (
            <List.Item key={index} color="#ECEDEE">{useCase}</List.Item>
          ))}
        </List>
      </Box>

      {documentation && (
        <Card.Section withBorder inheritPadding py="xs" mt="md">
          <Text 
            component="a" 
            href={documentation}
            target="_blank"
            rel="noopener noreferrer"
            color="#8CABA9"
            size="sm"
            style={{ textDecoration: 'none' }}
          >
            View Documentation →
          </Text>
        </Card.Section>
      )}
    </Card>
  );
};

export default VMCard;
