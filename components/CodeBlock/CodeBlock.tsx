import { useState } from 'react';
import { IconCopy, IconCheck, IconChevronDown } from '@tabler/icons-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  flags?: Record<string, string>;
}

const CodeBlock = ({ code, language, title, flags }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [showFlags, setShowFlags] = useState(true);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg bg-[#1A1A1A] ring-1 ring-white/10">
      {title && (
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium text-white/60">{title}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/90 transition-all"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      
      <div className="relative">
        <pre className="overflow-x-auto p-4 text-sm">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(code, Prism.languages[language], language)
            }}
          />
        </pre>
      </div>

      {flags && (
        <>
          <div className="border-t border-white/10 px-4 py-2">
            <button
              onClick={() => setShowFlags(!showFlags)}
              className="flex w-full items-center justify-between text-xs font-medium text-white/40"
            >
              FLAGS
              <IconChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${showFlags ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          {showFlags && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(flags).map(([flag, description]) => (
                  <div key={flag} className="flex items-start gap-2">
                    <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-white/70">
                      {flag}
                    </code>
                    <span className="text-xs text-white/60">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CodeBlock;