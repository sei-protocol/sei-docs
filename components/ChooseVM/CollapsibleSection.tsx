import React, { useState } from 'react';
import { Collapse, Button, Box, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Box mb="md">
      <Button 
        fullWidth
        variant="light"
        color="#001B2A"
        onClick={() => setOpened(!opened)}
        rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        styles={{
          root: {
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            backgroundColor: '#001B2A',
            color: '#ECEDEE',
            '&:hover': {
              backgroundColor: '#9E1F19',
            },
          },
          inner: {
            justifyContent: 'space-between',
          },
        }}
      >
        <Text fw={500}>{title}</Text>
      </Button>

      <Collapse in={opened}>
        <Box mt="sm" p="md" style={{ borderRadius: '0 0 8px 8px', backgroundColor: '#001B2A', borderColor: '#9E1F19', borderWidth: '1px', borderStyle: 'solid' }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CollapsibleSection;
