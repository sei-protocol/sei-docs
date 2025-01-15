import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';
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
		<div className='group relative h-full'>
			{/* 
        In dark mode => background stays #8B1F1F
        In light mode => background is #f9d2d2 (example) 
        and text is black 
      */}
			<Link
				href={link}
				className='
          block h-full overflow-hidden rounded-xl
          transition-all duration-300
          dark:bg-[#8B1F1F] bg-[#f9d2d2]
          dark:hover:bg-[#9B2F2F] hover:bg-[#e5a8a8]
          dark:text-white text-black
        '>
				<div className='relative h-full p-5'>
					<div className='flex items-start justify-between'>
						{/* If you want icon to be black in light mode & white in dark mode: */}
						{icon && <div className='dark:text-white/90 text-black/90'>{icon}</div>}

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
                  dark:bg-white/5 bg-black/5
                  px-2.5 py-1 text-xs
                  dark:text-white/60 text-black/60
                  dark:hover:bg-white/10 hover:bg-black/10
                  dark:hover:text-white/90 hover:text-black/90
                  transition-all
                '
								aria-label='Toggle overview'>
								Overview
								<IconChevronDown size={14} className={`transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} />
							</button>
						)}
					</div>

					<div className='mt-4'>
						{/* Title: black in light mode, white in dark mode */}
						<h3 className='text-xl font-semibold dark:text-white text-black'>{title}</h3>

						{description && <p className='mt-2 text-[15px] leading-relaxed dark:text-white/80 text-black/80'>{description}</p>}
					</div>
				</div>
			</Link>

			{preview && showPreview && (
				<div
					className='
            absolute inset-0
            rounded-xl
            dark:bg-[#1A1A1A] bg-[#f1f1f1]
            shadow-xl
          '
					onClick={(e) => e.stopPropagation()}>
					<div className='h-full flex flex-col'>
						<div className='flex items-center justify-end p-4'>
							<button
								onClick={() => setShowPreview(false)}
								className='
                  flex items-center gap-1.5
                  rounded-full
                  dark:bg-white/5 bg-black/5
                  px-2.5 py-1
                  text-xs
                  dark:text-white/60 text-black/60
                  dark:hover:bg-white/10 hover:bg-black/10
                  dark:hover:text-white/90 hover:text-black/90
                  transition-all
                '>
								<IconChevronDown className='rotate-180' size={14} />
								Close
							</button>
						</div>

						<div className='flex-1 overflow-y-auto custom-scrollbar'>
							<div className='px-5 pb-5'>
								<p className='text-[15px] leading-relaxed dark:text-white/80 text-black/80'>{preview.content}</p>
								{preview.highlights && (
									<ul className='mt-4 space-y-2.5'>
										{preview.highlights.map((highlight, idx) => (
											<li
												key={idx}
												className='
                          flex items-start gap-3
                          text-[14px]
                          leading-relaxed
                          dark:text-white/70 text-black/70
                        '>
												<span className='mt-2 h-1 w-1 rounded-full dark:bg-[#8B1F1F] bg-[#f9d2d2]' />
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
