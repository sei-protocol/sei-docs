import Link from 'next/link';
import { useState, type ReactNode } from 'react';
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

export default function LinkCard({ title, description, link, icon, preview }: LinkCardProps) {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<div className='relative h-full'>
			<Link
				href={link}
				className='
          block h-full 
          overflow-hidden 
          rounded-[0.75rem] 
          bg-[#f9d2d2] 
          text-black 
          transition-all 
          duration-300
          hover:bg-[#e5a8a8]
          dark:bg-[#8b1f1f]
          dark:text-white
          dark:hover:bg-[#9b2f2f]
        '
				onClick={() => {
					if (showPreview) setShowPreview(false);
				}}>
				<div className='relative h-full p-5'>
					<div className='flex items-start justify-between'>
						{icon && <div className='text-[rgba(0,0,0,0.9)] dark:text-[rgba(255,255,255,0.9)]'>{icon}</div>}
						{preview && (
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setShowPreview(!showPreview);
								}}
								className='
                  flex items-center gap-1 
                  rounded-full 
                  bg-black/5 
                  px-2.5 
                  py-1 
                  text-[0.75rem] 
                  text-black/60 
                  transition-colors 
                  duration-200
                  hover:bg-black/10 
                  hover:text-black/90
                  dark:bg-white/5 
                  dark:text-white/60
                  dark:hover:bg-white/10
                  dark:hover:text-white/90
                '>
								Overview
								<IconChevronDown
									size={14}
									className={`
                    transition-transform 
                    duration-200 
                    ${showPreview ? 'rotate-180' : ''}
                  `}
								/>
							</button>
						)}
					</div>
					<div className='mt-4'>
						<h3
							className='
                mb-0 
                text-[1.25rem] 
                font-semibold 
                text-black 
                dark:text-white
              '>
							{title}
						</h3>
						{description && (
							<p
								className='
                  mt-2 
                  text-[0.9375rem] 
                  leading-[1.5] 
                  text-[rgba(0,0,0,0.8)] 
                  dark:text-[rgba(255,255,255,0.8)]
                '>
								{description}
							</p>
						)}
					</div>
				</div>
			</Link>

			{preview && showPreview && (
				<div
					onClick={(e) => e.stopPropagation()}
					className='
            absolute 
            inset-0 
            flex 
            flex-col 
            rounded-[0.75rem] 
            bg-[#f1f1f1] 
            shadow-[0_4px_6px_rgba(0,0,0,0.3)]
            dark:bg-[#1a1a1a]
          '>
					<div className='flex items-center justify-end p-4'>
						<button
							onClick={() => setShowPreview(false)}
							className='
                flex items-center gap-1 
                rounded-full 
                bg-black/5 
                px-2.5 
                py-1 
                text-[0.75rem] 
                text-black/60 
                transition-colors 
                duration-200
                hover:bg-black/10 
                hover:text-black/90
                dark:bg-white/5 
                dark:text-white/60 
                dark:hover:bg-white/10 
                dark:hover:text-white/90
              '>
							<IconChevronDown className='rotate-180' size={14} />
							Close
						</button>
					</div>
					<div
						className='
              custom-scrollbar 
              flex-1 
              overflow-y-auto 
              px-5 
              pb-5
            '>
						<p
							className='
                text-[0.9375rem] 
                leading-[1.5] 
                text-[rgba(0,0,0,0.8)] 
                dark:text-[rgba(255,255,255,0.8)]
              '>
							{preview.content}
						</p>
						{preview.highlights && (
							<ul className='mt-4 space-y-[0.625rem]'>
								{preview.highlights.map((highlight, idx) => (
									<li
										key={idx}
										className='
                      flex 
                      items-start 
                      gap-3 
                      text-[0.875rem] 
                      leading-[1.5] 
                      text-[rgba(0,0,0,0.7)] 
                      dark:text-[rgba(255,255,255,0.7)]
                    '>
										<span
											className='
                        mt-1 
                        h-1 
                        w-1 
                        rounded-full 
                        bg-[#f9d2d2] 
                        dark:bg-[#8b1f1f]
                      '
										/>
										{highlight}
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
