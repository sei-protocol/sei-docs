export const RandomPeers = ({ format = 'bash', network = 'mainnet', count = 5 }) => {
  const PEERS = {
    mainnet: [
      'd53ab7681ed0df3d3249fc0132df7c3a131c9c1a@45.250.253.40:51656',
      '4ee8aea5bb58e9038d72e74322e3bba755287398@202.8.8.183:11956',
      '81409623ae4da3ec7b400cf640dea0b0999a964b@57.128.230.96:51556',
      '61a5be64b5215786fe5da712584678d0626636b5@87.249.137.71:51556',
      'f83c536f43df9a5d900cd3c2f702c04d7dddc7b5@136.243.67.45:11956',
      'b8d600a2f568576b5a2df5ee649cf9b809389064@162.19.62.176:26756',
      '57860b18ed3e1bbe8901ba73f2e63c7e6fe8b3d3@57.129.54.81:26656',
      '04fc6bba6c5c33034811612dca31c7adda24b299@91.134.60.37:16856',
      'de64b779c7f4091e6f1765f5ca4c46f9d3011732@65.108.70.106:46656',
      '3be6b24cf86a5938cce7d48f44fb6598465a9924@p2p.state-sync.pacific-1.seinetwork.io:26656',
      '70e0c91b83b5ed1beaca798267f2debdf97dac10@18.156.6.83:26656',
      'dd6b1ae002a15c1c8a38e05660f49a93c75d4159@148.251.181.225:26656'
    ],
    testnet: [
      '71beea83970431f55816eee5f066a611a1dc80f7@p2p.state-sync.atlantic-2.seinetwork.io:26656',
      '65c257f9275beb1b99ca169ef89743c034b15db0@3.76.192.224:26656',
      '33588592e477c5238ff2a5d8dc765f85790ef853@23.109.47.225:26656',
      'babc3f3f7804933265ec9c40ad94f4da8e9e0017@testnet-seed.rhinostake.com:11956',
      '8542cd7e6bf9d260fef543bc49e59be5a3fa9074@seed.publicnode.com:56656'
    ]
  };

  const pickRandom = (arr, n) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(n, arr.length));
  };

  const CopyIcon = ({ className }) => (
    <svg
      role="img"
      aria-label="Copy"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
    </svg>
  );

  const CheckIcon = ({ className }) => (
    <svg
      role="img"
      aria-label="Copied"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );

  const ShuffleIcon = ({ className }) => (
    <svg
      role="img"
      aria-label="Shuffle"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <path d="M16 3h5v5" />
      <path d="M4 20l16.2 -16.2" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );

  const [peers, setPeers] = useState([]);
  const [copied, setCopied] = useState(false);

  const shuffle = () => {
    const pool = PEERS[network] ?? [];
    setPeers(pickRandom(pool, count));
  };

  useEffect(() => {
    shuffle();
  }, [network, count]);

  if (peers.length === 0) {
    return (
      <div className="not-prose w-full">
        <pre
          className="m-0 p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm opacity-70"
          style={{ fontFamily: 'var(--sei-font-mono)' }}>
          Loading peers…
        </pre>
      </div>
    );
  }

  const peerString = peers.join(',');
  const displayText = format === 'toml' ? `persistent_peers = "${peerString}"` : `PEERS="${peerString}"`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  };

  return (
    <div className="not-prose w-full">
      <div className="relative">
        <pre
          className="m-0 px-4 py-3 pr-28 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-[12.5px] leading-[1.55] whitespace-pre-wrap break-all border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          style={{ fontFamily: 'var(--sei-font-mono)' }}>
          <code style={{ fontFamily: 'var(--sei-font-mono)' }}>{displayText}</code>
        </pre>
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={shuffle}
            aria-label="Shuffle peers"
            title="Shuffle"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-neutral-300 dark:border-neutral-600 bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 transition-colors">
            <ShuffleIcon />
            Shuffle
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy peers"
            title="Copy to clipboard"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-neutral-300 dark:border-neutral-600 bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 transition-colors">
            {copied ? (
              <>
                <CheckIcon className="text-green-600" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
