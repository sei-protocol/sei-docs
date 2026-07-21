export const SstoreGasLive = ({ network = 'mainnet' }) => {
  // Reads the live SSTORE gas cost from SstoreGasProbe — a tiny, Sourcify-verified
  // contract whose functions measure a throwaway SSTORE with the GAS opcode. Called via
  // eth_call (read-only, state discarded, no gas spent), so the number always reflects the
  // current governance parameter (KeySeiSstoreSetGasEIP2200) and can never go stale.
  const COLD = '0x50025cb2'; // coldWriteCost()  -> SSTORE_SET + EIP-2929 cold access
  const PARAM = '0x095f88b9'; // setParamGas()    -> SSTORE_SET parameter alone (pre-warmed)

  const RPC = {
    mainnet: {
      url: 'https://evm-rpc.sei-apis.com',
      chain: 'pacific-1',
      id: 1329,
      probe: '0xeeB428bcf499D0A1c401f123F64BFf754a5de57A',
      explorer: 'https://seiscan.io/address/0xeeB428bcf499D0A1c401f123F64BFf754a5de57A'
    },
    testnet: {
      url: 'https://evm-rpc-testnet.sei-apis.com',
      chain: 'atlantic-2',
      id: 1328,
      probe: '0xE5A35b2457E1C3cfF2F6527fAA32DE0B2a8e28E0',
      explorer: 'https://testnet.seiscan.io/address/0xE5A35b2457E1C3cfF2F6527fAA32DE0B2a8e28E0'
    }
  };

  const [net, setNet] = useState(network === 'testnet' ? 'testnet' : 'mainnet');
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const ethCall = async (url, to, data) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] })
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'eth_call failed');
    return parseInt(json.result, 16);
  };

  const load = async (which) => {
    setLoading(true);
    setErr(null);
    try {
      const { url, probe } = RPC[which];
      const [param, cold] = await Promise.all([ethCall(url, probe, PARAM), ethCall(url, probe, COLD)]);
      setData({ param, cold });
    } catch (e) {
      setErr(e && e.message ? e.message : 'Failed to query RPC');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(net);
  }, [net]);

  const fmt = (n) => (n == null ? '—' : n.toLocaleString('en-US'));

  const TabButton = ({ value, children }) => {
    const active = net === value;
    return (
      <button
        type="button"
        onClick={() => setNet(value)}
        className="px-3 py-1 transition-colors"
        style={{
          fontFamily: 'var(--sei-font-mono)',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: active ? '#ffffff' : 'var(--sei-maroon-100)',
          backgroundColor: active ? 'var(--sei-maroon-100)' : 'transparent',
          border: '1px solid var(--sei-maroon-100)',
          cursor: active ? 'default' : 'pointer'
        }}>
        {children}
      </button>
    );
  };

  const Stat = ({ label, value, sub }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400" style={{ fontFamily: 'var(--sei-font-mono)' }}>
        {label}
      </span>
      <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tabular-nums" style={{ fontFamily: 'var(--sei-font-mono)' }}>
        {loading ? '…' : value}
        <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400"> gas</span>
      </span>
      {sub && <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{sub}</span>}
    </div>
  );

  return (
    <div
      className="not-prose w-full rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
      style={{ backgroundColor: 'rgba(127,127,127,0.04)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-200" style={{ fontFamily: 'var(--sei-font-mono)' }}>
          Live SSTORE gas — measured on-chain
        </span>
        <div className="inline-flex">
          <TabButton value="mainnet">Mainnet</TabButton>
          <TabButton value="testnet">Testnet</TabButton>
        </div>
      </div>

      {err ? (
        <div className="text-[12px] text-red-600 dark:text-red-400" style={{ fontFamily: 'var(--sei-font-mono)' }}>
          Could not reach {RPC[net].chain} RPC: {err}{' '}
          <button type="button" onClick={() => load(net)} className="underline">
            retry
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <Stat label="SSTORE_SET parameter" value={fmt((data && data.param)-8)} sub="governance value (≈ 72,000)" />
          <Stat label="Cold first write" value={fmt((data && data.cold)-7)} sub="SSTORE_SET + EIP-2929 cold access (2,100)" />
        </div>
      )}

      <div className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
        {RPC[net].chain} ({RPC[net].id}) · read via <code>eth_call</code> from the verified{' '}
        <a href={RPC[net].explorer} target="_blank" rel="noopener noreferrer" className="underline">
          SstoreGasProbe
        </a>{' '}
        contract. Governance-adjustable — set by{' '}
        <a href="https://seistream.app/proposals/109" target="_blank" rel="noopener noreferrer" className="underline">
          Proposal #109
        </a>
        .
      </div>
    </div>
  );
};
