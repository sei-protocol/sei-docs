// TokenCard.tsx
import React, { useState } from 'react';
import { Text, Tooltip, TextInput } from '@mantine/core';
import { IconInfoCircle, IconChevronDown } from '@tabler/icons-react';
import classes from '../../styles/TokenCard.module.css';

export function TokenCard({ title, tooltip, details }: TokenCardProps) {
  const [conversionInput, setConversionInput] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className={classes.card}>
      <div className={classes.mainSection}>
        <div className={classes.sectionHeader}>
          <Text component="h3" className={classes.title}>
            {title}
            {tooltip && (
              <Tooltip label={tooltip}>
                <IconInfoCircle size={14} className={classes.infoIcon} />
              </Tooltip>
            )}
          </Text>
        </div>
      </div>

      {details.map((detail, index) => (
        <div key={index} className={classes.section}>
          {detail.label ? (
            <>
              <Text className={classes.label}>{detail.label}</Text>
              {detail.label.includes('Conversion') ? (
                <div className={classes.conversionWrapper}>
                  <TextInput
                    placeholder="Enter amount in Sei"
                    value={conversionInput}
                    onChange={(e) => setConversionInput(e.target.value)}
                    type="number"
                    className={classes.input}
                  />
                  {conversionInput && (
                    <div className={classes.conversionResult}>
                      {detail.label.includes('EVM') ? (
                        <Text>{Number(conversionInput) * 1e18} wei</Text>
                      ) : (
                        <>
                          <Text>{Number(conversionInput) * 1e18} asei</Text>
                          <Text>{Number(conversionInput) * 1e9} nsei</Text>
                          <Text>{Number(conversionInput) * 1e6} usei</Text>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Text className={classes.content}>{detail.content}</Text>
              )}
            </>
          ) : detail.title && (
            <div className={classes.subsection}>
              <button 
                className={classes.expandButton}
                onClick={() => toggleSection(detail.title)}
              >
                <IconChevronDown 
                  size={12}
                  className={`${classes.chevron} ${expandedSection === detail.title ? classes.chevronExpanded : ''}`}
                />
                <Text>{detail.title}</Text>
              </button>
              {expandedSection === detail.title && detail.sections && (
                <div className={classes.expandedContent}>
                  {detail.sections.map((section, idx) => (
                    <div key={idx} className={classes.guideSection}>
                      <Text className={classes.guideText}>{section.content}</Text>
                      {section.command && (
                        <pre className={classes.codeBlock}>
                          <code>{section.command}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
