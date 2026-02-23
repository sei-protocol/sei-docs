'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button, Flex, Select } from '@radix-ui/themes';
import { toast } from 'sonner';
import { sendGTMEvent } from '@next/third-parties/google';
import { IconDroplet, IconShieldCheck, IconHourglass, IconCheck, IconLoader2, IconExternalLink } from '@tabler/icons-react';
import { isAddress } from 'viem/utils';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { VITE_FAUCET_API_URL } from './constants';
import usePollMessageStatus from './usePollMessageStatus';

const RequestFaucetCard = () => {
	const [sendingRequest, setSendingRequest] = useState(false);
	const [destAddress, setDestAddress] = useState('');
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const [nextUseTime, setNextUseTime] = useState<string | null>(null);
	const [selectedChain, setSelectedChain] = useState('atlantic-2');
	const [txHash, setTxHash] = useState<string | null>(null);

	const captchaRef = useRef<HCaptcha>(null);
	const { isPolling, pollingMessage, startPolling, stopPolling } = usePollMessageStatus();

	const isValidAddress = isAddress(destAddress);

	const resetForm = useCallback(() => {
		setNextUseTime(null);
		setTxHash(null);
		stopPolling();
	}, [stopPolling]);

	const resetCaptcha = useCallback(() => {
		captchaRef.current?.resetCaptcha();
		setCaptchaToken(null);
	}, []);

	const handleAddressChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setDestAddress(e.target.value);
			resetForm();
		},
		[resetForm]
	);

	const handleCaptchaVerification = useCallback(() => {
		captchaRef.current?.execute();
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!captchaToken) {
			toast.warning('Please complete the captcha verification.');
			return;
		}

		if (!isValidAddress) {
			toast.error('Invalid Sei EVM address');
			return;
		}

		setSendingRequest(true);
		try {
			const response = await fetch(`${VITE_FAUCET_API_URL}/${selectedChain}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: destAddress, captchaToken })
			});

			if (!response.ok) throw new Error('Failed to request tokens');

			const responseJson = await response.json();
			if (responseJson.status === 'success') {
				const messageId = responseJson.data.messageId;
				toast.success('Tokens requested successfully!');
				startPolling(messageId, setTxHash);
				sendGTMEvent({ event: 'faucet_used', address: destAddress });
			} else if (responseJson.data?.nextAllowedUseDate) {
				setNextUseTime(responseJson.data.nextAllowedUseDate);
				toast.error(`Rate limited. Try again after ${responseJson.data.nextAllowedUseDate}`);
			}
			resetCaptcha();
		} catch (error) {
			toast.error('Error requesting tokens. Please try again later.');
			console.error(error);
			resetCaptcha();
		} finally {
			setSendingRequest(false);
		}
	}, [captchaToken, isValidAddress, selectedChain, destAddress, startPolling, resetCaptcha]);

	const isSubmitDisabled = !!nextUseTime || !isValidAddress || !captchaToken || isPolling;

	return (
		<div className='w-full text-neutral-900 dark:text-neutral-100 flex flex-col items-center gap-6'>
			<div className='h-0 hidden'>
				<HCaptcha ref={captchaRef} size='invisible' sitekey={'39d88446-78f4-4f1e-8b88-9c7ce32cb10c'} onVerify={setCaptchaToken} />
			</div>

			<Flex align='center' className='w-full gap-4'>
				<div className='bg-neutral-200 dark:bg-neutral-700 p-2 rounded-full md:p-4'>
					<IconDroplet className='w-8 h-8 md:w-12 md:h-12 text-neutral-700 dark:text-neutral-200' />
				</div>
				<div>
					<h2 className='text-2xl md:text-3xl font-bold'>Sei Faucet</h2>
					<p className='text-sm md:text-xl opacity-80'>Request 5 SEI every 24 hours for testing.</p>
				</div>
			</Flex>

			<div className='w-full flex items-center border border-neutral-300 dark:border-neutral-600 rounded-sm p-2 focus-within:ring-2 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-500'>
				<input
					className='w-full text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 px-4 py-3 text-lg outline-none'
					placeholder='Sei EVM address...'
					value={destAddress}
					onChange={handleAddressChange}
				/>
				<Select.Root value={selectedChain} onValueChange={setSelectedChain}>
					<Select.Trigger className='bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-4 py-2 text-lg rounded-sm cursor-pointer focus:ring-2 focus:ring-neutral-400 dark:focus-within:ring-neutral-500'>
						{selectedChain === 'atlantic-2' ? 'Testnet' : 'Devnet'}
					</Select.Trigger>
					<Select.Content className='bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-lg rounded-sm shadow-lg'>
						<Select.Item value='atlantic-2'>Testnet (atlantic-2)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			{nextUseTime && (
				<div className='flex items-center gap-3 p-4 border-l-4 border-sei-maroon-100 bg-sei-grey-30 dark:bg-sei-maroon-100/20 text-sei-maroon-200 dark:text-sei-cream rounded w-full'>
					<IconHourglass className='w-6 h-6' />
					<p className='text-lg font-medium'>You can request SEI testnet tokens again after {nextUseTime}.</p>
				</div>
			)}

			<Flex direction='column' className='w-full gap-5'>
				<Button
					className={`w-full flex items-center gap-3 justify-center !p-6 !rounded-sm ${
						captchaToken
							? 'bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-300 dark:hover:bg-neutral-400 text-white dark:text-black'
							: 'bg-neutral-400 cursor-not-allowed'
					}`}
					onClick={handleCaptchaVerification}>
					<IconShieldCheck className='w-8 h-8' />
					{captchaToken ? 'Verified' : 'Verify Captcha'}
				</Button>

				<Button
					className={`w-full flex items-center gap-3 justify-center !p-6 !rounded-sm ${
						isSubmitDisabled
							? 'bg-neutral-500 cursor-not-allowed'
							: 'bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-300 dark:hover:bg-neutral-400 text-white dark:text-black'
					}`}
					disabled={isSubmitDisabled}
					loading={sendingRequest}
					onClick={handleSubmit}>
					{sendingRequest ? <IconLoader2 className='w-8 h-8 animate-spin' /> : <IconCheck className='w-8 h-8' />}
					{isPolling ? 'Processing...' : 'Request SEI'}
				</Button>

				{(isPolling || txHash) && (
					<div
						className={`flex items-center gap-3 p-4 border-l-4 rounded w-full ${
							isPolling
								? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
								: 'border-green-500 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
						}`}>
						{isPolling ? <IconLoader2 className='w-6 h-6 animate-spin' /> : <IconCheck className='w-6 h-6' />}
						<div className='flex-1'>
							{isPolling ? (
								<p className='text-lg font-medium'>{pollingMessage}</p>
							) : (
								<div className='flex flex-row gap-2 text-lg font-medium'>
									<p>Transaction confirmed!</p>
									<a href={`https://testnet.seiscan.io/tx/${txHash}`} target='_blank' rel='noopener noreferrer' className='flex items-center gap-2'>
										View on Explorer
										<IconExternalLink className='w-4 h-4' />
									</a>
								</div>
							)}
						</div>
					</div>
				)}
			</Flex>
		</div>
	);
};

export default RequestFaucetCard;
