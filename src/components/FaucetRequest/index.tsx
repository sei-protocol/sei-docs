'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button, Flex } from '@radix-ui/themes';
import { toast } from 'sonner';
import { sendGTMEvent } from '@next/third-parties/google';
import { IconDroplet, IconShieldCheck, IconHourglass, IconCheck, IconLoader2, IconExternalLink, IconSend } from '@tabler/icons-react';
import { isAddress } from 'viem/utils';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { VITE_FAUCET_API_URL } from './constants';
import usePollMessageStatus from './usePollMessageStatus';

const RequestFaucetCard = () => {
	const [sendingRequest, setSendingRequest] = useState(false);
	const [destAddress, setDestAddress] = useState('');
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const [nextUseTime, setNextUseTime] = useState<string | null>(null);
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
			const response = await fetch(`${VITE_FAUCET_API_URL}/atlantic-2`, {
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
	}, [captchaToken, isValidAddress, destAddress, startPolling, resetCaptcha]);

	const isSubmitDisabled = !!nextUseTime || !isValidAddress || !captchaToken || isPolling;

	return (
		<div className='w-full flex flex-col gap-6'>
			<div className='h-0 hidden'>
				<HCaptcha ref={captchaRef} size='invisible' sitekey={'39d88446-78f4-4f1e-8b88-9c7ce32cb10c'} onVerify={setCaptchaToken} />
			</div>

			<div className='border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 overflow-hidden'>
				{/* Address input row */}
				<div className='flex items-center border-b border-neutral-200 dark:border-neutral-800'>
					<div className='flex items-center gap-3 px-5 border-r border-neutral-200 dark:border-neutral-800 self-stretch'>
						<IconDroplet className='w-5 h-5 text-neutral-400 dark:text-neutral-500' />
					</div>
					<input
						className='flex-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-5 py-5 outline-none bg-transparent font-mono'
						placeholder='Enter your EVM (0x...) address'
						value={destAddress}
						onChange={handleAddressChange}
						style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0' }}
					/>
					<div className='px-4 border-l border-neutral-200 dark:border-neutral-800 self-stretch flex items-center'>
						<span
							className='text-neutral-600 dark:text-neutral-300 px-3 py-2'
							style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Testnet
						</span>
					</div>
				</div>

				{/* Action row */}
				<div className='flex items-stretch'>
					<button
						onClick={handleCaptchaVerification}
						className={`flex-1 flex items-center justify-center gap-3 px-5 py-5 text-sm font-medium transition-colors border-r border-neutral-200 dark:border-neutral-800 ${
							captchaToken
								? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
								: 'bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer'
						}`}
						style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						<IconShieldCheck className='w-4 h-4' />
						{captchaToken ? 'Verified' : 'Verify Captcha'}
					</button>

					<button
						onClick={handleSubmit}
						disabled={isSubmitDisabled}
						className={`flex-1 flex items-center justify-center gap-3 px-5 py-5 text-sm font-medium transition-all ${
							isSubmitDisabled
								? 'bg-neutral-100 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
								: 'bg-sei-maroon-100 hover:bg-sei-maroon-200 text-white cursor-pointer'
						}`}
						style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						{sendingRequest ? <IconLoader2 className='w-4 h-4 animate-spin' /> : <IconSend className='w-4 h-4' />}
						{isPolling ? 'Processing...' : 'Request SEI'}
					</button>
				</div>
			</div>

			{/* Rate limit warning */}
			{nextUseTime && (
				<div className='flex items-center gap-3 px-4 py-3 border-l-3 border-sei-maroon-100 bg-sei-maroon-100/5 dark:bg-sei-maroon-100/10 text-sm'>
					<IconHourglass className='w-4 h-4 text-sei-maroon-100 dark:text-sei-maroon-25 shrink-0' />
					<p className='text-neutral-700 dark:text-neutral-300'>
						You can request tokens again after <span className='font-medium text-sei-maroon-100 dark:text-sei-maroon-25'>{nextUseTime}</span>
					</p>
				</div>
			)}

			{/* Status messages */}
			{(isPolling || txHash) && (
				<div
					className={`flex items-center gap-3 px-4 py-3 border-l-3 text-sm ${
						isPolling ? 'border-sei-gold-100 bg-sei-gold-100/5 dark:bg-sei-gold-100/10' : 'border-sei-live bg-sei-live/5 dark:bg-sei-live/10'
					}`}>
					{isPolling ? <IconLoader2 className='w-4 h-4 animate-spin text-sei-gold-100 shrink-0' /> : <IconCheck className='w-4 h-4 text-sei-live shrink-0' />}
					<div className='flex-1'>
						{isPolling ? (
							<p className='text-neutral-700 dark:text-neutral-300'>{pollingMessage}</p>
						) : (
							<div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
								<p className='text-neutral-700 dark:text-neutral-300 font-medium'>Transaction confirmed</p>
								<a
									href={`https://testnet.seiscan.io/tx/${txHash}`}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-1.5 text-sei-maroon-100 dark:text-sei-maroon-25 hover:underline'
									style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
									View on Explorer
									<IconExternalLink className='w-3 h-3' />
								</a>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default RequestFaucetCard;
