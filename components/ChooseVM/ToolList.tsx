import React from 'react';
import { Card, Text, Group, Badge, List, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface VMCardProps {
  title: string;
  description: string;
  features: string[];
  ecosystemSize?: string;
  difficulty?: string;
}

const VMCard: React.FC<VMCardProps> = ({
  title,
  description,
  features,
  ecosystemSize,
  difficulty,
}) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: '#1A1B1E',
        borderColor: '#2C2E33',
      }}
    >
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="apart" mb="xs">
          <Group>
            <Text fw={700} size="xl" color="#ECEDEE">{title}</Text>
            {ecosystemSize && (
              <Badge color="blue" variant="light">
                {ecosystemSize}
              </Badge>
            )}
          </Group>
          {difficulty && (
            <Badge color="green" variant="light">
              {difficulty}
            </Badge>
          )}
        </Group>
        <Text size="sm" color="#8CABA9">
          {description}
        </Text>
      </Card.Section>

      <List
        spacing="sm"
        size="sm"
        mt="md"
        icon={
          <ThemeIcon color="#9E1F19" size={20} radius="xl">
            <IconCheck size={12} />
          </ThemeIcon>
        }
      >
        {features.map((feature, index) => (
          <List.Item key={index}>
            <Text color="#8CABA9">{feature}</Text>
          </List.Item>
        ))}
      </List>
    </Card>
  );
};

export default VMCard;
