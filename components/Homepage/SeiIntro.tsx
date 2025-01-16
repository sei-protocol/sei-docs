import React from 'react';
import { Title, Text, Button } from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import SeiIcon from '../../public/assets/sei-icon.png';
import styles from '../../styles/SeiIntro.module.css';

const SeiIntro: React.FC = () => {
	return (
		<section className={styles.hero}>
			<div style={{ marginBottom: '2rem' }}>
				<Image src={SeiIcon} alt='Sei Icon' width={100} height={100} priority />
			</div>

			<Title className={styles.title}>Sei Network Documentation</Title>
			<Text className={styles.subtitle}>Sei is the first parallelized EVM blockchain delivering unmatched scalability.</Text>

			<div className={styles.ctaWrapper}>
				<Link href='/learn/user-quickstart' passHref>
					<Button<'a'> component='a' variant='outline' size='sm' classNames={{ root: styles.outlineButton }}>
						Quickstart
					</Button>
				</Link>

				<Link href='/learn/general-overview' passHref>
					<Button<'a'> component='a' variant='outline' size='sm' classNames={{ root: styles.outlineButton }}>
						About Sei
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default SeiIntro;
