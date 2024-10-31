import React, { useState } from 'react';
import { Card, Text, Tooltip, TextInput, Accordion, Divider, Group, Button } from '@mantine/core';
import { IconInfoCircle, IconClipboardCheck } from '@tabler/icons-react';
import { TokenCardProps } from './types';
import ibcInfo from './data/ibc_info.json';

const cardStyle = {
  backgroundColor: '#2c2f33',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'box-shadow 0.3s ease-in-out',
};

const textColor = { color: '#f0f0f0' };
const subTextColor = { color: '#b0b0b0' };

export const TokenCard: React.FC<TokenCardProps> = ({ title, description, tooltip, details }) => {
  const [conversionInput, setConversionInput] = useState<number | ''>('');
  const [copied, setCopied] = useState<number | null>(null);

  const handleConversionInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConversionInput(value === '' ? '' : parseFloat(value));
  };

  const handleCopy = async (channelData: object, idx: number) => {
    const jsonData = JSON.stringify(channelData, null, 2);
    await navigator.clipboard.writeText(jsonData);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const EVM_CONVERSION_FACTOR = 1e18;
  const COSMOS_CONVERSION_FACTOR = { asei: 1e18, nsei: 1e9, usei: 1e6 };

  return (
    <Card 
      style={cardStyle} 
      shadow="sm" 
      padding="lg" 
      withBorder
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'}
    >
      <Group align="center" mb="xs">
        <Text size="lg" style={{ ...textColor, fontWeight: 'bold' }}>{title}</Text>
        {tooltip && (
          <Tooltip label={tooltip} position="right" withArrow>
            <IconInfoCircle size={18} color="#4a90e2" style={{ cursor: 'pointer' }} />
          </Tooltip>
        )}
      </Group>
      
      {description && (
        <Text size="sm" style={{ ...subTextColor, marginBottom: '16px' }}>{description}</Text>
      )}
      
      <Divider my="sm" variant="dashed" />

      {details.map((detail, index) => (
        <div key={index} style={{ marginBottom: '12px' }}>
          {detail.label.includes("Conversion") ? (
            <>
              <Text size="sm" style={textColor}>{detail.label}</Text>
              <TextInput
                placeholder="Enter amount in Sei"
                type="number"
                value={conversionInput}
                onChange={handleConversionInput}
                styles={{ input: { backgroundColor: '#4a4d52', color: '#ffffff', marginTop: '8px' } }}
              />
              {conversionInput !== '' && detail.label === "EVM Conversion" && (
                <Text size="sm" style={{ ...textColor, marginTop: '8px' }}>
                  {conversionInput} Sei = {conversionInput * EVM_CONVERSION_FACTOR} wei
                </Text>
              )}
              {conversionInput !== '' && detail.label === "Cosmos Conversion" && (
                <div style={{ marginTop: '8px' }}>
                  <Text size="sm" style={textColor}>
                    {conversionInput} Sei = {conversionInput * COSMOS_CONVERSION_FACTOR.asei} asei
                  </Text>
                  <Text size="sm" style={textColor}>
                    {conversionInput} Sei = {conversionInput * COSMOS_CONVERSION_FACTOR.nsei} nsei
                  </Text>
                  <Text size="sm" style={textColor}>
                    {conversionInput} Sei = {conversionInput * COSMOS_CONVERSION_FACTOR.usei} usei
                  </Text>
                </div>
              )}
            </>
          ) : (
            <Text size="sm" style={textColor}>
              <b>{detail.label}:</b> {detail.content}
            </Text>
          )}
        </div>
      ))}

      {title === "IBC Tokens" && (
        <Accordion variant="contained" mt="md" styles={{
          item: { backgroundColor: '#3b3e42', color: '#f0f0f0', borderRadius: '8px', marginBottom: '8px' },
          control: { color: '#f0f0f0', fontWeight: 500 },
          panel: { color: '#e0e0e0', padding: '12px 16px', fontSize: '14px' }
        }}>
          {Object.entries(ibcInfo).map(([network, channels]) => (
            <Accordion.Item key={network} value={network}>
              <Accordion.Control>{network.toUpperCase()}</Accordion.Control>
              <Accordion.Panel>
                {channels.map((channel, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <Group position="apart">
                      <Text size="sm" style={{ color: '#e0e0e0' }}>
                        <b>Counterparty Chain:</b> {channel.counterparty_chain_name}
                      </Text>
                      <Tooltip label={copied === idx ? "Copied!" : "Copy JSON"} withArrow>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() => handleCopy(channel, idx)}
                          style={{ color: '#4a90e2', cursor: 'pointer' }}
                        >
                          <IconClipboardCheck size={16} />
                        </Button>
                      </Tooltip>
                    </Group>
                    <Text size="sm" style={subTextColor}>
                      <b>Destination Channel:</b> {channel.dst_channel}
                    </Text>
                    <Text size="sm" style={subTextColor}>
                      <b>Source Channel:</b> {channel.src_channel}
                    </Text>
                    <Text size="sm" style={subTextColor}>
                      <b>Port ID:</b> {channel.port_id}
                    </Text>
                    <Text size="sm" style={subTextColor}>
                      <b>Client ID:</b> {channel.client_id}
                    </Text>
                    {idx < channels.length - 1 && <hr style={{ borderColor: '#4a4d52', margin: '8px 0' }} />}
                  </div>
                ))}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Card>
  );
};
