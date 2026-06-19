export const AddSeiButton = ({ network = 'mainnet', label = 'Add Sei to MetaMask' }) => {
  const SEI_MAINNET_CHAIN_PARAMS = {
    chainId: '0x531',
    chainName: 'Sei Network',
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
    blockExplorerUrls: ['https://seiscan.io']
  };

  const SEI_TESTNET_CHAIN_PARAMS = {
    chainId: '0x530',
    chainName: 'Sei Testnet',
    rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
    nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
    blockExplorerUrls: ['https://testnet.seiscan.io']
  };

  const chainParams = network === 'testnet' ? SEI_TESTNET_CHAIN_PARAMS : SEI_MAINNET_CHAIN_PARAMS;

  const [status, setStatus] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const addOrSwitchSeiNetwork = async (params) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const ethereum = window.ethereum;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }]
      });
    } catch (switchError) {
      if (switchError && switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [params]
        });
      } else {
        throw switchError;
      }
    }
  };

  const onClick = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setStatus(null);
    try {
      await addOrSwitchSeiNetwork(chainParams);
      setStatus({ type: 'success', message: `${chainParams.chainName} added or switched.` });
    } catch (err) {
      const message = err && err.message ? err.message : 'Failed to add or switch network.';
      setStatus({ type: 'error', message });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isBusy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-white transition-colors min-w-[160px]"
        style={{
          backgroundColor: isHovered ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)',
          color: '#ffffff',
          fontFamily: 'var(--sei-font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '10px',
          opacity: isBusy ? 0.7 : 1,
          cursor: isBusy ? 'default' : 'pointer'
        }}>
        {isBusy ? 'Adding…' : label}
      </button>
      {status && (
        <span
          className={status.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
          style={{ fontSize: '11px' }}>
          {status.message}
        </span>
      )}
    </span>
  );
};
