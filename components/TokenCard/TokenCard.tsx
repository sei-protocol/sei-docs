import React, { useState } from 'react';
import {
  Card,
  Text,
  Tooltip,
  TextInput,
  Accordion,
  Divider,
  Button,
} from '@mantine/core';
import { IconInfoCircle, IconClipboardCheck } from '@tabler/icons-react';
import {
  TokenCardProps,
  DetailItem,
  ReferenceGuide,
  ReferenceGuideSection,
} from './types';
import ibcInfo from './data/ibc_info.json';

// Styles
const cardStyle = {
  backgroundColor: '#1B1F24',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  transition: 'box-shadow 0.3s ease-in-out',
  border: '1px solid #2A2F36',
};

const textColor = { color: '#ECEDEE' };
const subTextColor = { color: '#B0B4BA' };
const headerStyle = {
  color: '#ECEDEE',
  borderBottom: '1px solid #780000',
  paddingBottom: '4px',
  marginBottom: '8px',
  fontWeight: 'bold',
};

const inputStyle = {
  backgroundColor: '#2A2F36',
  color: '#ECEDEE',
  border: '1px solid #8CABA9',
  borderRadius: '8px',
  padding: '0.5rem',
};

export const TokenCard: React.FC<TokenCardProps> = ({
  title,
  description,
  tooltip,
  details,
  referenceGuides,
}) => {
  const [conversionInput, setConversionInput] = useState<number | ''>('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleConversionInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConversionInput(value === '' ? '' : parseFloat(value));
  };

  const handleCopy = async (content: string, idx: string) => {
    await navigator.clipboard.writeText(content);
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
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          '0 4px 16px rgba(0, 0, 0, 0.3)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow =
          '0 2px 8px rgba(0, 0, 0, 0.2)')
      }
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Text size="lg" style={headerStyle}>
          {title}
        </Text>
        {tooltip && (
          <Tooltip label={tooltip} position="right" withArrow>
            <IconInfoCircle
              size={18}
              color="#ECEDEE"
              style={{ cursor: 'pointer', marginLeft: '8px' }}
            />
          </Tooltip>
        )}
      </div>

      {/* Description */}
      {description && (
        <Text
          size="sm"
          style={{ ...subTextColor, marginBottom: '16px' }}
        >
          {description}
        </Text>
      )}

      <Divider my="sm" color="#2A2F36" />

      {/* Details */}
      {details.map((item, index) => {
        if ('label' in item) {
          // Render detail item
          const detail = item as DetailItem;
          return (
            <div key={index} style={{ marginBottom: '12px' }}>
              {detail.label.includes('Conversion') ? (
                <>
                  <Text size="sm" style={textColor}>
                    {detail.label}
                  </Text>
                  <TextInput
                    placeholder="Enter amount in Sei"
                    type="number"
                    value={conversionInput}
                    onChange={handleConversionInput}
                    styles={{ input: inputStyle }}
                  />
                  {conversionInput !== '' &&
                    detail.label === 'EVM Conversion' && (
                      <Text
                        size="sm"
                        style={{ ...textColor, marginTop: '8px' }}
                      >
                        {conversionInput} Sei ={' '}
                        {conversionInput * EVM_CONVERSION_FACTOR} wei
                      </Text>
                    )}
                  {conversionInput !== '' &&
                    detail.label === 'Cosmos Conversion' && (
                      <div style={{ marginTop: '8px' }}>
                        <Text size="sm" style={textColor}>
                          {conversionInput} Sei ={' '}
                          {conversionInput *
                            COSMOS_CONVERSION_FACTOR.asei}{' '}
                          asei
                        </Text>
                        <Text size="sm" style={textColor}>
                          {conversionInput} Sei ={' '}
                          {conversionInput *
                            COSMOS_CONVERSION_FACTOR.nsei}{' '}
                          nsei
                        </Text>
                        <Text size="sm" style={textColor}>
                          {conversionInput} Sei ={' '}
                          {conversionInput *
                            COSMOS_CONVERSION_FACTOR.usei}{' '}
                          usei
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
          );
        } else if ('title' in item && 'sections' in item) {
          // Render reference guide nested within details
          const guide = item as ReferenceGuide;
          return (
            <Accordion
              key={index}
              variant="contained"
              mt="md"
              styles={{
                item: {
                  backgroundColor: '#1B1F24',
                  color: '#ECEDEE',
                  borderRadius: '8px',
                  marginBottom: '8px',
                },
                control: { color: '#ECEDEE', fontWeight: 500 },
                panel: {
                  color: '#ECEDEE',
                  padding: '12px 16px',
                  fontSize: '14px',
                },
              }}
            >
              <Accordion.Item value={guide.title}>
                <Accordion.Control>{guide.title}</Accordion.Control>
                <Accordion.Panel>
                  {guide.sections.map(
                    (section: ReferenceGuideSection, sidx) => (
                      <div
                        key={sidx}
                        style={{ marginBottom: '12px' }}
                      >
                        <Text size="sm" style={subTextColor}>
                          {section.content}
                        </Text>
                        {section.command && (
                          <div
                            style={{
                              position: 'relative',
                              backgroundColor: '#2A2F36',
                              padding: '10px',
                              borderRadius: '5px',
                              marginTop: '8px',
                            }}
                          >
                            <Text
                              size="xs"
                              style={{
                                color: '#ECEDEE',
                                fontFamily: 'monospace',
                              }}
                            >
                              {section.command}
                            </Text>
                            <Tooltip
                              label={
                                copied === `${index}-${sidx}`
                                  ? 'Copied!'
                                  : 'Copy Command'
                              }
                              withArrow
                            >
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() =>
                                  handleCopy(
                                    section.command!,
                                    `${index}-${sidx}`
                                  )
                                }
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  color: '#ECEDEE',
                                  cursor: 'pointer',
                                }}
                              >
                                <IconClipboardCheck size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          );
        }
        return null;
      })}

      {/* IBC Tokens */}
      {title === 'IBC Tokens' && (
        <Accordion
          variant="contained"
          mt="md"
          styles={{
            item: {
              backgroundColor: '#1B1F24',
              color: '#ECEDEE',
              borderRadius: '8px',
              marginBottom: '8px',
            },
            control: { color: '#ECEDEE', fontWeight: 500 },
            panel: {
              color: '#ECEDEE',
              padding: '12px 16px',
              fontSize: '14px',
            },
          }}
        >
          {Object.entries(ibcInfo).map(
            ([network, channels]: [string, any[]]) => (
              <Accordion.Item key={network} value={network}>
                <Accordion.Control>
                  {network.toUpperCase()}
                </Accordion.Control>
                <Accordion.Panel>
                  {channels.map((channel, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text size="sm" style={{ color: '#ECEDEE' }}>
                          <b>Counterparty Chain:</b>{' '}
                          {channel.counterparty_chain_name}
                        </Text>
                        <Tooltip
                          label={
                            copied === `${network}-${idx}`
                              ? 'Copied!'
                              : 'Copy JSON'
                          }
                          withArrow
                        >
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(channel, null, 2),
                                `${network}-${idx}`
                              )
                            }
                            style={{
                              color: '#ECEDEE',
                              cursor: 'pointer',
                            }}
                          >
                            <IconClipboardCheck size={16} />
                          </Button>
                        </Tooltip>
                      </div>
                      <Text size="sm" style={subTextColor}>
                        <b>Destination Channel:</b>{' '}
                        {channel.dst_channel}
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
                      {idx < channels.length - 1 && (
                        <hr
                          style={{
                            borderColor: '#2A2F36',
                            margin: '8px 0',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            )
          )}
        </Accordion>
      )}

      {/* Reference Guides */}
      {referenceGuides && referenceGuides.length > 0 && (
        <Accordion
          variant="contained"
          mt="md"
          styles={{
            item: {
              backgroundColor: '#1B1F24',
              color: '#ECEDEE',
              borderRadius: '8px',
              marginBottom: '8px',
            },
            control: { color: '#ECEDEE', fontWeight: 500 },
            panel: {
              color: '#ECEDEE',
              padding: '12px 16px',
              fontSize: '14px',
            },
          }}
        >
          {referenceGuides.map((guide, idx) => (
            <Accordion.Item key={idx} value={guide.title}>
              <Accordion.Control>{guide.title}</Accordion.Control>
              <Accordion.Panel>
                {guide.sections.map(
                  (section: ReferenceGuideSection, sidx) => (
                    <div
                      key={sidx}
                      style={{ marginBottom: '12px' }}
                    >
                      <Text size="sm" style={subTextColor}>
                        {section.content}
                      </Text>
                      {section.command && (
                        <div
                          style={{
                            position: 'relative',
                            backgroundColor: '#2A2F36',
                            padding: '10px',
                            borderRadius: '5px',
                            marginTop: '8px',
                          }}
                        >
                          <Text
                            size="xs"
                            style={{
                              color: '#ECEDEE',
                              fontFamily: 'monospace',
                            }}
                          >
                            {section.command}
                          </Text>
                          <Tooltip
                            label={
                              copied === `${idx}-${sidx}`
                                ? 'Copied!'
                                : 'Copy Command'
                            }
                            withArrow
                          >
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() =>
                                handleCopy(
                                  section.command!,
                                  `${idx}-${sidx}`
                                )
                              }
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                color: '#ECEDEE',
                                cursor: 'pointer',
                              }}
                            >
                              <IconClipboardCheck size={16} />
                            </Button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  )
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Card>
  );
};
