// Faucet — atlantic-2 testnet faucet, inlined from sei-docs-widgets.
//
// The widget repo kept this as an iframe because it imported npm packages
// (`@hcaptcha/react-hcaptcha`, `viem`, `sonner`) that Mintlify snippets cannot
// bundle. None of those are required:
//   - hCaptcha is loaded from js.hcaptcha.com (already on Mintlify's default
//     CSP) and driven via window.hcaptcha.render / .execute
//   - address checks are a 0x + 40-hex shape test, plus an EIP-55 checksum
//     on mixed-case input. Keccak-256 is inlined below; Mintlify snippets
//     cannot import viem.
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

	const keccak256 = (bytes) => {
		const MASK = 0xffffffffffffffffn;
		const RATE = 136; // 1088-bit rate for 256-bit output
		// Keccak-f[1600] round constants.
		const RC = [
			0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
			0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
			0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
			0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
			0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
			0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
		];
		// Rho rotation offsets, indexed x + 5*y.
		const RHO = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];

		const rotl64 = (x, n) => {
			if (n === 0) return x;
			const s = BigInt(n);
			return ((x << s) | (x >> (64n - s))) & MASK;
		};

		const keccakF = (st) => {
			for (let round = 0; round < 24; round++) {
				const C = [0n, 0n, 0n, 0n, 0n];
				for (let x = 0; x < 5; x++) {
					C[x] = st[x] ^ st[x + 5] ^ st[x + 10] ^ st[x + 15] ^ st[x + 20];
				}
				for (let x = 0; x < 5; x++) {
					const D = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
					for (let y = 0; y < 5; y++) st[x + 5 * y] ^= D;
				}

				const B = new Array(25);
				for (let x = 0; x < 5; x++) {
					for (let y = 0; y < 5; y++) {
						B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl64(st[x + 5 * y], RHO[x + 5 * y]);
					}
				}

				for (let y = 0; y < 5; y++) {
					for (let x = 0; x < 5; x++) {
						const b0 = B[x + 5 * y];
						const b1 = B[((x + 1) % 5) + 5 * y];
						const b2 = B[((x + 2) % 5) + 5 * y];
						// BigInt ~ is infinite-width; XOR with the mask is a 64-bit NOT.
						st[x + 5 * y] = (b0 ^ ((b1 ^ MASK) & b2)) & MASK;
					}
				}

				st[0] = (st[0] ^ RC[round]) & MASK;
			}
		};

		const state = [];
		for (let i = 0; i < 25; i++) state.push(0n);

		const padded = new Uint8Array(bytes.length + (RATE - (bytes.length % RATE)));
		padded.set(bytes);
		padded[bytes.length] = 0x01; // Keccak domain (Ethereum); SHA3-256 uses 0x06
		padded[padded.length - 1] |= 0x80;

		for (let offset = 0; offset < padded.length; offset += RATE) {
			for (let i = 0; i < RATE; i++) {
				state[(i / 8) | 0] ^= BigInt(padded[offset + i]) << BigInt((i % 8) * 8);
			}
			keccakF(state);
		}

		const out = new Uint8Array(32);
		for (let i = 0; i < 32; i++) {
			out[i] = Number((state[(i / 8) | 0] >> BigInt((i % 8) * 8)) & 0xffn);
		}
		return out;
	};

	const addressChecksumOk = (address) => {
		const body = address.slice(2);
		if (body === body.toLowerCase() || body === body.toUpperCase()) return true;
		// EIP-55 hashes the ASCII lowercase hex, not the 20 address bytes.
		const hash = keccak256(new TextEncoder().encode(body.toLowerCase()));
		for (let i = 0; i < 40; i++) {
			const ch = body[i];
			if (ch >= '0' && ch <= '9') continue;
			const byte = hash[i >> 1];
			const nibble = i % 2 === 0 ? byte >> 4 : byte & 0xf;
			const wantUpper = nibble >= 8;
			const isUpper = ch >= 'A' && ch <= 'F';
			if (wantUpper !== isUpper) return false;
		}
		return true;
	};

	const trimmed = destAddress.trim();
	const hasAddressShape = /^0x[0-9a-fA-F]{40}$/.test(trimmed);
	const isValidAddress = hasAddressShape && addressChecksumOk(trimmed);
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

	// nextUseTime is held as a timestamp, never the raw ISO string: a date we
	// cannot read must not reach state at all, or the countdown never expires
	// and the request button stays disabled with no way back.
	const parseDeadline = (iso) => {
		const ms = new Date(iso).getTime();
		return isFinite(ms) ? ms : null;
	};

	const formatNextUseTime = (deadlineMs) => {
		const diffMs = deadlineMs - nowMs;
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
		const display = setInterval(() => setNowMs(Date.now()), 60000);
		// Separate from the display tick: hanging the re-enable off a 60s
		// interval would leave the button dead for up to a minute past the
		// deadline. This fires on the deadline itself.
		const expiry = setTimeout(() => setNextUseTime(null), Math.max(0, nextUseTime - Date.now()));
		return () => {
			clearInterval(display);
			clearTimeout(expiry);
		};
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
				// Clear the cache before the unmount check, not after. A reader
				// navigating away mid-failure would otherwise leave the rejected
				// promise on window for the life of the tab, and every later
				// mount would short-circuit to it instead of re-fetching.
				window.__seiHCaptchaPromise = null;
				const staleTag = document.querySelector('script[data-sei-hcaptcha]');
				if (staleTag) staleTag.remove();
				if (cancelled) return;
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
				// Only the run that still owns the poll may release the flag. A
				// superseded run clearing it would let the interval fire a second
				// request while the live run is still awaiting its own.
				if (pollGenRef.current === generation) pollInFlightRef.current = false;
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
				const deadline = parseDeadline(responseJson.data.nextAllowedUseDate);
				if (deadline) {
					// Same update as the deadline itself. nowMs was seeded at mount,
					// and a docs page is a long-lived tab — without this the first
					// minute of the countdown is off by the whole session so far.
					setNowMs(Date.now());
					setNextUseTime(deadline);
				} else {
					setErrorMsg('Rate limited by the faucet. Try again later.');
				}
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
	// Re-running a solved challenge just discards a good token, and running one
	// mid-request produces a token handleSubmit's resetCaptcha throws away.
	const isVerifyDisabled = !captchaReady || !!captchaToken || sendingRequest || isPolling || !!nextUseTime;

	// The request button is disabled until every precondition is met, so say
	// which one is missing rather than leaving a greyed-out button unexplained.
	const describeBlocker = () => {
		if (nextUseTime || isPolling || sendingRequest || txHash) return null;
		if (looksLikeSeiBech32 && !hasAddressShape) return 'Use the 0x EVM address, not the sei1… address.';
		if (trimmed && !hasAddressShape) return 'Enter a valid EVM address: 0x followed by 40 hex characters.';
		if (hasAddressShape && !isValidAddress) return 'This mixed-case address does not match its EIP-55 checksum. That usually means it was mistyped or truncated.';
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
		<div className='not-prose w-full flex flex-col my-4' style={{ position: 'relative' }}>
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
						// Editing mid-request would reset the banners while the POST
						// still resolves against the address captured at click time,
						// so the confirmation would name an address no longer shown.
						disabled={sendingRequest || isPolling}
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
						disabled={isVerifyDisabled}
						onMouseEnter={() => setVerifyHover(true)}
						onMouseLeave={() => setVerifyHover(false)}
						className={`flex-1 flex items-center justify-center gap-3 px-5 py-5 ${
							captchaToken ? 'text-green-700 dark:text-green-400' : 'text-neutral-600 dark:text-neutral-400'
						}`}
						style={{
							...buttonLabelStyle,
							borderRight: `1px solid ${HAIRLINE}`,
							backgroundColor: captchaToken ? 'rgba(16, 185, 129, 0.12)' : verifyHover && !isVerifyDisabled ? SURFACE : 'transparent',
							cursor: isVerifyDisabled ? 'not-allowed' : 'pointer',
							opacity: isVerifyDisabled && !captchaToken ? 0.6 : 1
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

			{/* The status blocks below mount and unmount as state changes, and a
			    live region announces nothing if it arrives at the same instant as
			    its own text — the region has to be there already. So the wrappers
			    stay mounted and empty. Spacing lives on the blocks themselves
			    (mt-4) rather than a gap on the parent, so an empty wrapper adds
			    no height. */}
			<div role='status'>
				{blockedReason ? <p className='mt-4 text-sm text-neutral-600 dark:text-neutral-400'>{blockedReason}</p> : null}
			</div>

			<div role='alert'>
				{errorMsg ? (
					<div className='mt-4 flex items-start gap-3 px-4 py-3 text-sm' style={{ borderLeft: '3px solid var(--sei-maroon-100)', backgroundColor: 'rgba(96, 0, 20, 0.08)' }}>
						<p className='text-neutral-700 dark:text-neutral-300'>{errorMsg}</p>
					</div>
				) : null}
			</div>

			<div role='status'>
				{nextUseTime ? (
					<div className='mt-4 flex items-center gap-3 px-4 py-3 text-sm' style={{ borderLeft: '3px solid var(--sei-maroon-100)', backgroundColor: 'rgba(96, 0, 20, 0.08)' }}>
						<HourglassIcon className='w-4 h-4 shrink-0' />
						<p className='text-neutral-700 dark:text-neutral-300'>
							You can request tokens again in{' '}
							<span style={{ color: 'var(--sei-maroon-50)' }}>{formatNextUseTime(nextUseTime)}</span>
						</p>
					</div>
				) : null}

				{isPolling || txHash ? (
					<div
						className='mt-4 flex items-center gap-3 px-4 py-3 text-sm'
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
		</div>
	);
};
