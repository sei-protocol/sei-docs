import React from 'react';
import { Title, Text, Button, useMantineTheme } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import SeiIcon from '../../public/assets/sei-icon.png';

const SeiIntro: React.FC = () => {
	const theme = useMantineTheme();

	const heroStyles: React.CSSProperties = {
		minHeight: '25vh',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		padding: '2rem 1rem 3rem',
		color: theme.white,
		borderBottom: '1px solid rgba(255,255,255,0.1)',
		marginBottom: '2rem'
	};

	const titleStyles: React.CSSProperties = {
		marginBottom: '0.5rem',
		fontWeight: 600,
		fontSize: 'clamp(1.7rem, 3vw, 2.5rem)',
		lineHeight: 1.2
	};

	const subtitleStyles: React.CSSProperties = {
		marginBottom: '1.5rem',
		fontSize: '1rem',
		color: 'rgba(236, 237, 238, 0.9)'
	};

	const ctaWrapper: React.CSSProperties = {
		display: 'flex',
		gap: '2rem',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: '1rem'
	};

	const buttonBaseStyles = {
		fontFamily: 'Satoshi, sans-serif',
		fontWeight: 500,
		display: 'flex',
		alignItems: 'center',
		gap: '0.4rem'
	};

	const gradientButtonRoot = {
		...buttonBaseStyles,
		'&:hover': {
			background: 'linear-gradient(90deg, #780000, #9E1F19)'
		}
	};

	const outlineButtonRoot = {
		...buttonBaseStyles,
		borderColor: '#ECEDEE',
		color: '#ECEDEE',
		'&:hover': {
			backgroundColor: 'rgba(236, 237, 238, 0.12)'
		}
	};

	return (
		<section style={heroStyles}>
			<div style={{ marginBottom: '1rem' }}>
				<Image src={SeiIcon} alt='Sei Icon' width={100} height={100} priority />
			</div>
			<Title style={titleStyles}>Sei Network Documentation</Title>
			<Text style={subtitleStyles}>The first parallelized EVM blockchain delivering unmatched scalability.</Text>

			<div style={ctaWrapper}>
				<Link href='/onboard/user-quickstart' passHref>
					<Button<'a'> component='a' variant='gradient' gradient={{ from: '#9E1F19', to: '#780000', deg: 135 }} size='sm' styles={{ root: gradientButtonRoot }}>
						Quickstart <IconArrowRight size={16} />
					</Button>
				</Link>
				<Link href='/learn/general-overview' passHref>
					<Button<'a'> component='a' variant='outline' color='gray' size='sm' styles={{ root: outlineButtonRoot }}>
						About Sei
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default SeiIntro;
