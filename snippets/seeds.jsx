export const Seeds = ({ format = 'bash', network = 'mainnet' }) => {
  // Sei Labs operated seed nodes. Three per network, one per region, so losing
  // a region does not cost bootstrap capability.
  //
  // These are stable, published addresses: the NodeID is pinned by the
  // secret-connection handshake, so a mismatched pair is rejected rather than
  // silently degraded. Do not edit without updating the platform repo — the
  // source of truth is the SeiNode's externalAddress and NodeID in
  // clusters/<cell>/<chain>/seeds/seed-N/.
  const SEEDS = {
    mainnet: [
      '0cd5f57c249b5aca815710338e1fe7a14797585d@seed-0-p2p.pacific-1.prod.platform.sei.io:26656',
      'f0f057f1593d28bec11591cf146bd223e0be1866@seed-1-p2p.pacific-1.prod-euw1.platform.sei.io:26656',
      '8e28f62368a1ceae0102645db8584b218650930d@seed-2-p2p.pacific-1.prod-use2.platform.sei.io:26656'
    ],
    testnet: [
      '362f934ead3654fca9cafdac63b52b47b2f9a95e@seed-0-p2p.atlantic-2.prod.platform.sei.io:26656',
      '1f55cd51183d3a6cad8a3667b91d08d0338bd52e@seed-1-p2p.atlantic-2.prod-euw1.platform.sei.io:26656',
      '7152be2e4c1a057d2b2467723058c5f0ec790472@seed-2-p2p.atlantic-2.prod-use2.platform.sei.io:26656'
    ]
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

  const [copied, setCopied] = useState(false);

  const seeds = SEEDS[network] ?? [];

  if (seeds.length === 0) {
    return (
      <div className="not-prose w-full">
        <pre
          className="m-0 p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm opacity-70"
          style={{ fontFamily: 'var(--sei-font-mono)' }}>
          No seeds configured for network “{network}”.
        </pre>
      </div>
    );
  }

  const seedString = seeds.join(',');
  const displayText = format === 'toml' ? `bootstrap-peers = "${seedString}"` : `SEEDS="${seedString}"`;

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
          className="m-0 px-4 py-3 pr-24 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-[12.5px] leading-[1.55] whitespace-pre-wrap break-all border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
          style={{ fontFamily: 'var(--sei-font-mono)' }}>
          <code style={{ fontFamily: 'var(--sei-font-mono)' }}>{displayText}</code>
        </pre>
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy seeds"
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
