import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { IconChevronDown } from '@tabler/icons-react';

interface LinkCardProps {
  title: string;
  link: string;
  description?: string;
  icon?: ReactNode;
  preview?: {
    content: string;
    highlights?: string[];
  };
}

const LinkCard = ({ title, description, link, icon, preview }: LinkCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="group relative h-full">
      <Link 
        href={link}
        className="block h-full overflow-hidden rounded-xl bg-[#8B1F1F] transition-all duration-300 hover:bg-[#9B2F2F]"
      >
        <div className="relative h-full p-5">
          <div className="flex items-start justify-between">
            {icon && (
              <div className="text-white/90">
                {icon}
              </div>
            )}
            {preview && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview(!showPreview);
                }}
                className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/90 transition-all"
                aria-label="Toggle overview"
              >
                Overview
                <IconChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p className="mt-2 text-[15px] leading-relaxed text-white/80">
                {description}
              </p>
            )}
          </div>
        </div>
      </Link>

      {preview && showPreview && (
        <div 
          className="absolute inset-0 rounded-xl bg-[#1A1A1A] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-end p-4">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/90 transition-all"
              >
                <IconChevronDown className="rotate-180" size={14} />
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-5 pb-5">
                <p className="text-[15px] leading-relaxed text-white/80">
                  {preview.content}
                </p>
                {preview.highlights && (
                  <ul className="mt-4 space-y-2.5">
                    {preview.highlights.map((highlight, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start gap-3 text-[14px] leading-relaxed text-white/70"
                      >
                        <span className="mt-2 h-1 w-1 rounded-full bg-[#8B1F1F]"/>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 1px;
        }
      `}</style>
    </div>
  );
};

export default LinkCard;