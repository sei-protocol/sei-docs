// Faucet — atlantic-2 testnet faucet, inlined from sei-docs-widgets.
//
// The widget repo kept this as an iframe because it imported npm packages
// (`@hcaptcha/react-hcaptcha`, `viem`, `sonner`) that Mintlify snippets cannot
// bundle. None of those are required:
//   - hCaptcha is loaded from js.hcaptcha.com (already on Mintlify's default
//     CSP) and driven via window.hcaptcha.render / .execute
//   - address checks are a 0x + 40-hex shape test. viem's isAddress also
//     verifies the EIP-55 checksum, which needs keccak256 and so cannot run
//     here — the faucet stays the authority on whether an address is real.
//   - toasts are inline status banners
//
// The faucet backend stays at faucet-v3.seinetwork.io; this snippet only
// replaces the iframe UI.
//
// Usage in MDX:
//   import { Faucet } from '/snippets/faucet.jsx';
//   <Faucet />
export const Faucet = () => {
	const FAUCET_API_URL = 'https://faucet-v3.seinetwork.io';
	const HCAPTCHA_SITEKEY = '39d88446-78f4-4f1e-8b88-9c7ce32cb10c';
	const EXPLORER_TX = 'https://testnet.seiscan.io/tx';
	const HAIRLINE = 'rgba(128, 128, 128, 0.25)';
	const SURFACE = 'rgba(128, 128, 128, 0.08)';

	const captchaNode = useRef(null);
	const widgetId = useRef(null);
	const pollRef = useRef(null);
	const timeoutRef = useRef(null);
	// Every stop bumps the generation, so a fetch still in flight can tell its
	// result is stale and skip writing to state.
	const pollGenRef = useRef(0);
	const pollInFlightRef = useRef(false);

	const [destAddress, setDestAddress] = useState('');
	const [captchaToken, setCaptchaToken] = useState(null);
	const [captchaReady, setCaptchaReady] = useState(false);
	const [sendingRequest, setSendingRequest] = useState(false);
	const [nextUseTime, setNextUseTime] = useState(null);
	const [txHash, setTxHash] = useState(null);
	const [isPolling, setIsPolling] = useState(false);
	const [pollingMessage, setPollingMessage] = useState('');
	const [errorMsg, setErrorMsg] = useState(null);
	const [verifyHover, setVerifyHover] = useState(false);
	const [requestHover, setRequestHover] = useState(false);
	// The rate-limit notice counts down, and nothing else re-renders while the
	// reader sits on the page, so it needs a clock of its own.
	const [nowMs, setNowMs] = useState(() => Date.now());

	const trimmed = destAddress.trim();
	const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(trimmed);
	const looksLikeSeiBech32 = /^sei1[a-z0-9]{10,}$/i.test(trimmed);

	const mono = { fontFamily: 'var(--sei-font-mono)' };
	const labelStyle = {
		fontFamily: 'var(--sei-font-mono)',
		fontSize: '12px',
		textTransform: 'uppercase',
		letterSpacing: '0.05em'
	};
	const buttonLabelStyle = {
		fontFamily: 'var(--sei-font-mono)',
		fontSize: '13px',
		textTransform: 'uppercase',
		letterSpacing: '0.05em'
	};

	const formatNextUseTime = (iso) => {
		const diffMs = new Date(iso).getTime() - nowMs;
		// An unparseable date must not read as "now" while the button stays
		// disabled — the two would contradict each other on screen.
		if (!isFinite(diffMs)) return 'a little while';
		if (diffMs <= 0) return 'now';
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
		if (hours > 0) return `${hours}h`;
		if (mins > 0) return `${mins}m`;
		return 'less than a minute';
	};

	const stopPolling = () => {
		pollGenRef.current += 1;
		pollInFlightRef.current = false;
		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsPolling(false);
		setPollingMessage('');
	};

	const resetCaptcha = () => {
		setCaptchaToken(null);
		const id = widgetId.current;
		if (id != null && window.hcaptcha && typeof window.hcaptcha.reset === 'function') {
			try {
				window.hcaptcha.reset(id);
			} catch (e) {
				/* widget already torn down */
			}
		}
	};

	useEffect(() => {
		return () => {
			if (pollRef.current) clearInterval(pollRef.current);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		if (!nextUseTime) return;
		const deadline = new Date(nextUseTime).getTime();
		const id = setInterval(() => {
			const now = Date.now();
			setNowMs(now);
			// Clear the notice once the window has passed so the button comes
			// back, instead of stranding the reader on an expired countdown.
			if (isFinite(deadline) && now >= deadline) setNextUseTime(null);
		}, 60000);
		return () => clearInterval(id);
	}, [nextUseTime]);

	useEffect(() => {
		let cancelled = false;

		const loadHCaptcha = () => {
			if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
			if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
				return Promise.resolve(window.hcaptcha);
			}
			if (window.__seiHCaptchaPromise) return window.__seiHCaptchaPromise;
			window.__seiHCaptchaPromise = new Promise((resolve, reject) => {
				const waitForApi = () => {
					const started = Date.now();
					const tick = () => {
						if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
							resolve(window.hcaptcha);
							return;
						}
						if (Date.now() - started > 15000) {
							reject(new Error('hCaptcha failed to load'));
							return;
						}
						setTimeout(tick, 50);
					};
					tick();
				};
				if (document.querySelector('script[data-sei-hcaptcha]')) {
					waitForApi();
					return;
				}
				const script = document.createElement('script');
				script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
				script.async = true;
				script.defer = true;
				script.setAttribute('data-sei-hcaptcha', '1');
				script.onload = waitForApi;
				script.onerror = () => reject(new Error('hCaptcha script blocked'));
				document.head.appendChild(script);
			});
			return window.__seiHCaptchaPromise;
		};

		loadHCaptcha()
			.then((hcaptcha) => {
				if (cancelled || !captchaNode.current) return;
				const id = hcaptcha.render(captchaNode.current, {
					sitekey: HCAPTCHA_SITEKEY,
					size: 'invisible',
					callback: (token) => {
						setCaptchaToken(token);
						setErrorMsg(null);
					},
					'expired-callback': () => setCaptchaToken(null),
					'error-callback': () => {
						setCaptchaToken(null);
						setErrorMsg('Captcha error. Click Verify Captcha and try again.');
					}
				});
				widgetId.current = id;
				setCaptchaReady(true);
			})
			.catch(() => {
				if (cancelled) return;
				window.__seiHCaptchaPromise = null;
				// Drop the failed tag as well. Left in place, the next attempt
				// takes the "already requested" branch and waits out the full
				// timeout instead of re-fetching the script.
				const staleTag = document.querySelector('script[data-sei-hcaptcha]');
				if (staleTag) staleTag.remove();
				setErrorMsg('Captcha failed to load. Refresh the page and try again.');
			});

		return () => {
			cancelled = true;
			setCaptchaReady(false);
			const id = widgetId.current;
			widgetId.current = null;
			if (id != null && window.hcaptcha) {
				try {
					if (typeof window.hcaptcha.remove === 'function') window.hcaptcha.remove(id);
					else window.hcaptcha.reset(id);
				} catch (e) {
					/* already gone */
				}
			}
		};
	}, []);

	const startPolling = (messageId) => {
		stopPolling();
		const generation = pollGenRef.current;
		setIsPolling(true);
		setPollingMessage('Transaction submitted, checking status...');

		const pollOnce = async () => {
			// A /message/:id slower than the 3s interval must not stack up.
			if (pollInFlightRef.current) return;
			pollInFlightRef.current = true;
			try {
				const response = await fetch(`${FAUCET_API_URL}/message/${messageId}`);
				if (!response.ok) throw new Error('Failed to fetch message status');
				const responseJson = await response.json();
				// Polling stopped while this was in flight — the address
				// changed, or the timeout fired. Its result is stale.
				if (pollGenRef.current !== generation) return;
				if (responseJson && responseJson.status === 'success') {
					const data = responseJson.data || {};
					if (data.status === 'success' && data.txHash) {
						setTxHash(data.txHash);
						stopPolling();
						return;
					}
					if (data.status === 'error') {
						stopPolling();
						setErrorMsg('Transaction failed. Please try again.');
						return;
					}
					if (data.status === 'processing' || data.status === 'pending') {
						setPollingMessage('Transaction is being processed...');
						return;
					}
				}
				setPollingMessage('Checking transaction status...');
			} catch (e) {
				if (pollGenRef.current !== generation) return;
				setPollingMessage('Checking transaction status...');
			} finally {
				pollInFlightRef.current = false;
			}
		};

		pollOnce();
		pollRef.current = setInterval(pollOnce, 3000);
		timeoutRef.current = setTimeout(() => {
			stopPolling();
			setErrorMsg('Timed out waiting for the faucet transaction. Check the explorer or try again.');
		}, 300000);
	};

	const handleAddressChange = (e) => {
		setDestAddress(e.target.value);
		setNextUseTime(null);
		setTxHash(null);
		setErrorMsg(null);
		stopPolling();
	};

	const handleCaptchaVerification = () => {
		setErrorMsg(null);
		const id = widgetId.current;
		if (!captchaReady || id == null || !window.hcaptcha) {
			setErrorMsg('Captcha is still loading. Try again in a moment.');
			return;
		}
		try {
			window.hcaptcha.execute(id);
		} catch (e) {
			setErrorMsg('Could not open captcha. Try again.');
		}
	};

	// The faucet reports actionable refusals (rejected captcha, rejected
	// address) in a message field. Only fall back when it says nothing useful,
	// otherwise the reader is sent to Discord to ask what we were already told.
	const faucetError = (payload) => {
		const data = (payload && payload.data) || {};
		const candidates = [payload && payload.message, payload && payload.error, data.message, data.error, data.reason];
		for (const candidate of candidates) {
			if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
		}
		return 'Error requesting tokens. Please try again later.';
	};

	const handleSubmit = async () => {
		setSendingRequest(true);
		setErrorMsg(null);
		setTxHash(null);
		try {
			const response = await fetch(`${FAUCET_API_URL}/atlantic-2`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: trimmed, captchaToken })
			});
			let responseJson = null;
			try {
				responseJson = await response.json();
			} catch (e) {
				responseJson = null;
			}

			if (responseJson && responseJson.status === 'success' && responseJson.data && responseJson.data.messageId) {
				startPolling(responseJson.data.messageId);
			} else if (responseJson && responseJson.data && responseJson.data.nextAllowedUseDate) {
				setNextUseTime(responseJson.data.nextAllowedUseDate);
			} else {
				setErrorMsg(faucetError(responseJson));
			}
			resetCaptcha();
		} catch (e) {
			setErrorMsg('Error requesting tokens. Please try again later.');
			resetCaptcha();
		} finally {
			setSendingRequest(false);
		}
	};

	const isSubmitDisabled = !!nextUseTime || !isValidAddress || !captchaToken || isPolling || sendingRequest;

	// The request button is disabled until every precondition is met, so say
	// which one is missing rather than leaving a greyed-out button unexplained.
	const describeBlocker = () => {
		if (nextUseTime || isPolling || sendingRequest || txHash) return null;
		if (looksLikeSeiBech32 && !isValidAddress) return 'Use the 0x EVM address, not the sei1… address.';
		if (trimmed && !isValidAddress) return 'Enter a valid EVM address: 0x followed by 40 hex characters.';
		if (isValidAddress && !captchaToken) return 'Complete the captcha verification to enable the request.';
		return null;
	};
	const blockedReason = describeBlocker();

	const handleAddressKeyDown = (e) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		if (!isValidAddress) return;
		if (!captchaToken) handleCaptchaVerification();
		else if (!isSubmitDisabled) handleSubmit();
	};

	const DropletIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546' />
		</svg>
	);
	const ShieldCheckIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06' />
			<path d='M15 19l2 2l4 -4' />
		</svg>
	);
	const SendIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M10 14l11 -11' />
			<path d='M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5' />
		</svg>
	);
	const SpinnerIcon = ({ className }) => (
		<svg className={className} aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
			<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
			<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z' />
		</svg>
	);
	const HourglassIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M6.5 7h11' />
			<path d='M6.5 17h11' />
			<path d='M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1' />
			<path d='M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1' />
		</svg>
	);
	const CheckIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M5 12l5 5l10 -10' />
		</svg>
	);
	const ExternalLinkIcon = ({ className }) => (
		<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className} aria-hidden='true'>
			<path d='M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6' />
			<path d='M11 13l9 -9' />
			<path d='M15 4h5v5' />
		</svg>
	);

	const requestEnabledStyle = {
		backgroundColor: requestHover ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)',
		color: '#ffffff',
		cursor: 'pointer'
	};
	const requestDisabledStyle = {
		backgroundColor: SURFACE,
		color: 'rgba(128, 128, 128, 0.7)',
		cursor: 'not-allowed'
	};

	return (
		<div className='not-prose w-full flex flex-col gap-4 my-4' style={{ position: 'relative' }}>
			{/* hCaptcha mounts the challenge here. Keep it out of the layout but
			    inside the accessibility tree — under aria-hidden a screen-reader
			    user cannot reach the image or audio challenge. */}
			<div ref={captchaNode} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />

			<div className='overflow-hidden' style={{ border: `1px solid ${HAIRLINE}` }}>
				<div className='flex items-stretch' style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
					<div className='flex items-center px-5' style={{ borderRight: `1px solid ${HAIRLINE}` }}>
						<DropletIcon className='w-5 h-5 text-neutral-400 dark:text-neutral-500' />
					</div>
					<input
						className='flex-1 min-w-0 px-5 py-5 outline-none bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500'
						placeholder='Enter your EVM (0x...) address'
						value={destAddress}
						onChange={handleAddressChange}
						onKeyDown={handleAddressKeyDown}
						autoComplete='off'
						autoCapitalize='off'
						autoCorrect='off'
						spellCheck={false}
						aria-label='Sei EVM address'
						style={{ ...mono, fontSize: '14px' }}
					/>
					<div className='px-4 flex items-center' style={{ borderLeft: `1px solid ${HAIRLINE}` }}>
						<span className='text-neutral-600 dark:text-neutral-300 px-3 py-2' style={labelStyle}>
							Testnet
						</span>
					</div>
				</div>

				<div className='flex items-stretch'>
					<button
						type='button'
						onClick={handleCaptchaVerification}
						onMouseEnter={() => setVerifyHover(true)}
						onMouseLeave={() => setVerifyHover(false)}
						className={`flex-1 flex items-center justify-center gap-3 px-5 py-5 ${
							captchaToken ? 'text-green-700 dark:text-green-400' : 'text-neutral-600 dark:text-neutral-400'
						}`}
						style={{
							...buttonLabelStyle,
							borderRight: `1px solid ${HAIRLINE}`,
							backgroundColor: captchaToken ? 'rgba(16, 185, 129, 0.12)' : verifyHover ? SURFACE : 'transparent',
							cursor: 'pointer'
						}}>
						<ShieldCheckIcon className='w-4 h-4' />
						{captchaToken ? 'Verified' : 'Verify Captcha'}
					</button>

					<button
						type='button'
						onClick={handleSubmit}
						disabled={isSubmitDisabled}
						onMouseEnter={() => setRequestHover(true)}
						onMouseLeave={() => setRequestHover(false)}
						className='flex-1 flex items-center justify-center gap-3 px-5 py-5'
						style={{
							...buttonLabelStyle,
							...(isSubmitDisabled ? requestDisabledStyle : requestEnabledStyle)
						}}>
						{sendingRequest || isPolling ? <SpinnerIcon className='animate-spin w-4 h-4' /> : <SendIcon className='w-4 h-4' />}
						{isPolling ? 'Processing...' : 'Request SEI'}
					</button>
				</div>
			</div>

			{blockedReason ? <p className='text-sm text-neutral-600 dark:text-neutral-400'>{blockedReason}</p> : null}

			{errorMsg ? (
				<div className='flex items-start gap-3 px-4 py-3 text-sm' style={{ borderLeft: '3px solid var(--sei-maroon-100)', backgroundColor: 'rgba(96, 0, 20, 0.08)' }}>
					<p className='text-neutral-700 dark:text-neutral-300'>{errorMsg}</p>
				</div>
			) : null}

			{nextUseTime ? (
				<div className='flex items-center gap-3 px-4 py-3 text-sm' style={{ borderLeft: '3px solid var(--sei-maroon-100)', backgroundColor: 'rgba(96, 0, 20, 0.08)' }}>
					<HourglassIcon className='w-4 h-4 shrink-0' />
					<p className='text-neutral-700 dark:text-neutral-300'>
						You can request tokens again in{' '}
						<span style={{ color: 'var(--sei-maroon-50)' }}>{formatNextUseTime(nextUseTime)}</span>
					</p>
				</div>
			) : null}

			{isPolling || txHash ? (
				<div
					className='flex items-center gap-3 px-4 py-3 text-sm'
					style={{
						borderLeft: `3px solid ${isPolling ? 'var(--sei-gold-100)' : 'var(--sei-live)'}`,
						backgroundColor: isPolling ? 'rgba(150, 111, 34, 0.08)' : 'rgba(56, 223, 0, 0.08)'
					}}>
					{isPolling ? <SpinnerIcon className='animate-spin w-4 h-4 shrink-0' /> : <CheckIcon className='w-4 h-4 shrink-0' />}
					<div className='flex-1'>
						{isPolling ? (
							<p className='text-neutral-700 dark:text-neutral-300'>{pollingMessage}</p>
						) : (
							<div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
								<p className='text-neutral-700 dark:text-neutral-300'>Transaction confirmed</p>
								<a
									href={`${EXPLORER_TX}/${txHash}`}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-1.5 no-underline'
									style={{ ...labelStyle, fontSize: '11px', color: 'var(--sei-maroon-50)' }}>
									View on Explorer
									<ExternalLinkIcon className='w-3 h-3' />
								</a>
							</div>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
};
