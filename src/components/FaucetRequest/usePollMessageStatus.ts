import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { VITE_FAUCET_API_URL } from './constants';

const usePollMessageStatus = () => {
	const [isPolling, setIsPolling] = useState(false);
	const [pollingMessage, setPollingMessage] = useState('');
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		setIsPolling(false);
		setPollingMessage('');
	}, []);

	const startPolling = useCallback(
		(messageId: string, onSuccess: (txHash: string) => void) => {
			setIsPolling(true);
			setPollingMessage('Transaction submitted, checking status...');

			const pollMessageStatus = async () => {
				try {
					const response = await fetch(`${VITE_FAUCET_API_URL}/message/${messageId}`);
					if (!response.ok) throw new Error('Failed to fetch message status');

					const responseJson = await response.json();

					if (responseJson.status === 'success') {
						const { data } = responseJson;
						if (data.status === 'success') {
							onSuccess(data.txHash);
							stopPolling();
							toast.success('Transaction confirmed!');
							return true;
						} else if (data.status === 'error') {
							stopPolling();
							toast.error('Transaction failed. Please try again.');
							return true;
						} else if (data.status === 'processing' || data.status === 'pending') {
							setPollingMessage('Transaction is being processed...');
							return false;
						}
					}

					setPollingMessage('Checking transaction status...');
					return false;
				} catch (error) {
					console.error('Error polling message status:', error);
					setPollingMessage('Checking transaction status...');
					return false;
				}
			};

			// Poll immediately first
			pollMessageStatus();

			// Then poll every 3 seconds
			pollingIntervalRef.current = setInterval(async () => {
				const shouldStop = await pollMessageStatus();
				if (shouldStop) stopPolling();
			}, 3000);

			// Stop polling after 5 minutes
			setTimeout(stopPolling, 300000);
		},
		[stopPolling]
	);

	// Cleanup on unmount
	useEffect(() => {
		return stopPolling;
	}, [stopPolling]);

	return { isPolling, pollingMessage, startPolling, stopPolling };
};

export default usePollMessageStatus;
