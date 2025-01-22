import React from 'react';
import { Title, Text, Button, Box, Image } from '@mantine/core';
import Link from 'next/link';
import NextImage from 'next/image';
import Header from '../../public/assets/header.png';
import SeiIcon from '../../public/assets/sei-icon.png';
import styles from '../../styles/SeiIntro.module.css';

const SeiIntro: React.FC = () => {
	return (
		<section className={styles.hero}>
			<Box mb='xl' w={600} pos='relative'>
				<Image component={NextImage} src={Header} alt='Docs header' width={1728} height={875} priority />
			</Box>

			<Title className={styles.title}>Sei Documentation</Title>
			<Text className={styles.subtitle}>Sei is the first parallelized EVM blockchain delivering unmatched scalability.</Text>

			<div className={styles.ctaWrapper}>
				<Button component={Link} href='/learn/user-quickstart' variant='outline' size='sm' classNames={{ root: styles.outlineButton }}>
					Quickstart
				</Button>

				<Button component={Link} href='/learn/general-overview' variant='outline' size='sm' classNames={{ root: styles.outlineButton }}>
					About Sei
				</Button>
			</div>
		</section>
	);
};

export default SeiIntro;
