'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import styles from '../../styles/LinkCard.module.css';

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
		<div className={styles.cardContainer}>
			<Link
				href={link}
				className={styles.cardLink}
				onClick={() => {
					if (showPreview) {
						setShowPreview(false);
					}
				}}>
				<div className={styles.cardContent}>
					<div className='flex items-start justify-between'>
						{icon && <div className={styles.icon}>{icon}</div>}
						{preview && (
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setShowPreview(!showPreview);
								}}
								className={styles.overviewButton}>
								Overview
								<IconChevronDown size={14} className={`transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} />
							</button>
						)}
					</div>
					<div className='mt-4'>
						<h3 className={styles.title}>{title}</h3>
						{description && <p className={styles.description}>{description}</p>}
					</div>
				</div>
			</Link>
			{preview && showPreview && (
				<div className={styles.previewOverlay} onClick={(e) => e.stopPropagation()}>
					<div className='h-full flex flex-col'>
						<div className={styles.closeButtonContainer}>
							<button onClick={() => setShowPreview(false)} className={styles.closeButton}>
								<IconChevronDown className='rotate-180' size={14} />
								Close
							</button>
						</div>
						<div className={`flex-1 ${styles.previewContent} custom-scrollbar`}>
							<p className={styles.overlayText}>{preview.content}</p>
							{preview.highlights && (
								<ul className='mt-4 space-y-2.5'>
									{preview.highlights.map((highlight, idx) => (
										<li key={idx} className={styles.highlightItem}>
											<span className={styles.highlightBullet} />
											{highlight}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LinkCard;
