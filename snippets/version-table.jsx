export const VersionTable = () => {
  const networks = [
    {
      label: 'Mainnet',
      chainId: 'pacific-1',
      rpcEndpoint: 'https://rpc.sei-apis.com',
      evmChainId: '1329'
    },
    {
      label: 'Testnet',
      chainId: 'atlantic-2',
      rpcEndpoint: 'https://rpc-testnet.sei-apis.com',
      evmChainId: '1328'
    }
  ];

  const [versions, setVersions] = useState({});

  useEffect(() => {
    const oneHour = 3600000;

    const setVersionFor = (chainId, version) => {
      setVersions((prev) => ({ ...prev, [chainId]: version }));
    };

    const fetchVersion = async (chainId, rpcEndpoint) => {
      try {
        const response = await fetch(`${rpcEndpoint}/abci_info`);
        const data = await response.json();
        // Sei's RPC returns { response: { version } }; standard Tendermint wraps
        // it as { result: { response: { version } } }. Accept either shape.
        const info = (data && data.result && data.result.response) || (data && data.response) || {};
        const version = info.version;
        // Only cache real values — localStorage.setItem coerces undefined to the
        // literal string "undefined", which would then display for an hour.
        if (typeof version === 'string' && version) {
          setVersionFor(chainId, version);
          localStorage.setItem(`${chainId}-version`, version);
          localStorage.setItem(`${chainId}-version-timestamp`, Date.now().toString());
          return;
        }
        throw new Error('abci_info response had no version field');
      } catch (error) {
        console.error('Error fetching version:', error);
        // Keep any cached value (set above) so it stays visible. With no cache,
        // surface "Unavailable" instead of leaving the column on "Fetching..."
        // indefinitely.
        if (!localStorage.getItem(`${chainId}-version`)) {
          setVersionFor(chainId, 'Unavailable');
        }
      }
    };

    networks.forEach(({ chainId, rpcEndpoint }) => {
      const storedVersion = localStorage.getItem(`${chainId}-version`);
      const storedTimestamp = localStorage.getItem(`${chainId}-version-timestamp`);
      const isFresh = storedVersion && storedTimestamp && Date.now() - parseInt(storedTimestamp, 10) < oneHour;

      // Show any cached value immediately (even when stale) so the column never
      // sits on "Fetching..." while we revalidate; only fetch when missing/stale.
      if (storedVersion) {
        setVersionFor(chainId, storedVersion);
      }
      if (!isFresh) {
        fetchVersion(chainId, rpcEndpoint);
      }
    });
  }, []);

  return (
    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
      <thead className="bg-neutral-50 dark:bg-neutral-900/50">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">Network</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">Version</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">Chain ID</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100">EVM Chain ID</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
        {networks.map(({ label, chainId, evmChainId }) => (
          <tr key={chainId}>
            <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</td>
            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
              <code style={{ fontFamily: 'var(--sei-font-mono)' }}>{versions[chainId] || 'Fetching...'}</code>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{chainId}</td>
            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{evmChainId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
