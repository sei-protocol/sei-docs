import React from 'react';
import { Title, Text, Button, useMantineTheme } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import SeiIcon from '../../public/assets/sei-icon.png';
import styles from '../../styles/SeiIntro.module.css';

const SeiIntro: React.FC = () => {
	const theme = useMantineTheme();

	return (
		<section className={styles.hero}>
			<div style={{ marginBottom: '1rem' }}>
				<Image src={SeiIcon} alt='Sei Icon' width={100} height={100} priority />
			</div>

			<Title className={styles.title}>Sei Network Documentation</Title>
			<Text className={styles.subtitle}>The first parallelized EVM blockchain delivering unmatched scalability.</Text>

			<div className={styles.ctaWrapper}>
				<Link href='/learn/user-quickstart' passHref>
					<Button<'a'>
						component='a'
						variant='gradient'
						gradient={{ from: '#9E1F19', to: '#780000', deg: 135 }}
						size='sm'
						classNames={{ root: styles.gradientButton }}>
						Quickstart <IconArrowRight size={16} />
					</Button>
				</Link>

				<Link href='/learn/general-overview' passHref>
					<Button<'a'> component='a' variant='outline' color='gray' size='sm' classNames={{ root: styles.outlineButton }}>
						About Sei
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default SeiIntro;
