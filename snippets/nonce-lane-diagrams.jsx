export const SequentialNonceQueue = () => {
  const ink = 'currentColor';
  const ok = 'var(--sei-diagram-ok, #1a7a00)';
  const bad = 'var(--sei-diagram-error, #c20a00)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const nonces = [
    { n: 5, s: 'landed', c: ok },
    { n: 6, s: 'dropped, never landed', c: bad },
    { n: 7, s: 'stranded', c: warn },
    { n: 8, s: 'stranded', c: warn }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 310" role="img" aria-label="A missing EVM nonce strands every later nonce; the usual workaround is more hot wallets" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="queue-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>

          <text x={40} y={28} fontSize="13" fontWeight="600" fill={ink}>One account, one queue</text>
          {nonces.map((it, i) => {
            const x = 40 + i * 190;
            return (
              <g key={'n' + it.n}>
                <rect x={x} y={46} width={160} height={54} rx={7} fill={it.c} fillOpacity="0.12" stroke={it.c} strokeWidth="1.2" />
                <text x={x + 80} y={68} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>nonce {it.n}</text>
                <text x={x + 80} y={86} fontSize="10" textAnchor="middle" fill={it.c}>{it.s}</text>
                {i < nonces.length - 1 ? <line x1={x + 162} y1={73} x2={x + 186} y2={73} stroke={ink} strokeOpacity="0.45" strokeWidth="1.2" markerEnd="url(#queue-arrow)" /> : null}
              </g>
            );
          })}
          <text x={40} y={124} fontSize="10.5" fill={ink} fillOpacity="0.7">nonces 7 and 8 are signed and valid, but nothing at or above 7 can execute until 6 is filled or replaced</text>
          <text x={40} y={142} fontSize="10.5" fill={ink} fillOpacity="0.7">on Sei under Giga the producer mempool rejects 7 and 8 with a bad nonce error rather than queueing them: the same stall</text>

          <line x1={40} y1={162} x2={840} y2={162} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />

          <text x={40} y={190} fontSize="13" fontWeight="600" fill={ink}>The usual workaround: more hot wallets</text>
          {['A', 'B', 'C', 'N'].map((w, i) => {
            const x = 40 + i * 190;
            return (
              <g key={'w' + w}>
                <rect x={x} y={206} width={160} height={68} rx={7} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.35" strokeWidth="1" />
                <text x={x + 80} y={226} fontSize="11.5" fontWeight="600" textAnchor="middle" fill={ink}>hot wallet {w}</text>
                <text x={x + 80} y={243} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">own balance, own approvals</text>
                <text x={x + 80} y={258} fontSize="9.5" textAnchor="middle" fill={bad} fillOpacity="0.9">own key that can move funds</text>
              </g>
            );
          })}
          <text x={440} y={298} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.6">throughput scales with wallets, and so do fragmented balances, duplicated approvals, and keys that hold funds</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">A transaction that lands and reverts consumes its nonce and blocks nothing. A transaction that never lands leaves a gap, and every later nonce waits behind it. On Sei a pending-nonce read comes from the mempool rather than aliasing latest, and it is too unreliable to rebuild an in-flight queue from. Splitting funds across hot wallets buys width at the cost of custody surface.</div>
    </div>
  );
};

export const NonceLanes = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const ok = 'var(--sei-diagram-ok, #1a7a00)';
  const bad = 'var(--sei-diagram-error, #c20a00)';
  const chip = (x, y, label, state, key) => {
    const c = state === 'ok' ? ok : state === 'bad' ? bad : ink;
    return (
      <g key={key}>
        <rect x={x} y={y} width={44} height={26} rx={5} fill={c} fillOpacity={state === 'next' ? 0 : 0.14} stroke={c} strokeOpacity={state === 'next' ? 0.5 : 0.9} strokeWidth="1.1" strokeDasharray={state === 'next' ? '3 3' : undefined} />
        <text x={x + 22} y={y + 17} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity={state === 'next' ? 0.6 : 1}>{label}</text>
      </g>
    );
  };
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 342" role="img" aria-label="ERC-4337 two-dimensional nonce: a 192-bit lane key and a 64-bit sequence, with one sequence counter per lane" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="lanes-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>

          <text x={40} y={24} fontSize="13" fontWeight="600" fill={ink}>One uint256 nonce, two dimensions</text>
          <text x={40} y={44} fontSize="9.5" fill={ink} fillOpacity="0.55">bit 255</text>
          <text x={640} y={44} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.55">bit 64</text>
          <text x={840} y={44} fontSize="9.5" textAnchor="end" fill={ink} fillOpacity="0.55">bit 0</text>
          <rect x={40} y={50} width={600} height={44} rx={6} fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="1.2" />
          <text x={340} y={68} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>uint192 key: the lane</text>
          <text x={340} y={84} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">any value from 1 to 2^192 - 1, chosen by the caller</text>
          <rect x={640} y={50} width={200} height={44} rx={6} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.4" strokeWidth="1.2" />
          <text x={740} y={68} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>uint64 sequence</text>
          <text x={740} y={84} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">kept by the EntryPoint per lane</text>
          <text x={440} y={118} fontSize="11" textAnchor="middle" fill={ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">nonce = (lane &lt;&lt; 64) | sequence</text>

          <line x1={40} y1={134} x2={840} y2={134} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />
          <text x={40} y={158} fontSize="13" fontWeight="600" fill={ink}>The EntryPoint keeps one sequence counter per lane</text>

          <text x={40} y={191} fontSize="11" fill={bad} fontWeight="600">lane 0</text>
          <line x1={38} y1={187} x2={78} y2={187} stroke={bad} strokeWidth="1.2" />
          <text x={120} y={191} fontSize="10" fill={bad}>rejected by LaneAccount: SDKs default to key 0, and work on key 0 is one queue again</text>

          <text x={40} y={226} fontSize="11" fill={ink} fontWeight="600">lane 1</text>
          {chip(120, 210, 'seq 0', 'ok', 'l1s0')}
          {chip(172, 210, 'seq 1', 'ok', 'l1s1')}
          {chip(224, 210, 'seq 2', 'ok', 'l1s2')}
          {chip(276, 210, 'next 3', 'next', 'l1n')}
          <text x={340} y={226} fontSize="10" fill={ink} fillOpacity="0.65">three operations landed in order</text>

          <text x={40} y={262} fontSize="11" fill={ink} fontWeight="600">lane 2</text>
          {chip(120, 246, 'seq 0', 'ok', 'l2s0')}
          {chip(172, 246, 'seq 1', 'bad', 'l2s1')}
          {chip(224, 246, 'next 2', 'next', 'l2n')}
          <text x={340} y={262} fontSize="10" fill={ink} fillOpacity="0.65">seq 1 executed and reverted: it still consumed its sequence</text>

          <text x={40} y={298} fontSize="11" fill={ink} fontWeight="600">lane 3</text>
          {chip(120, 282, 'next 0', 'next', 'l3n')}
          <text x={340} y={298} fontSize="10" fill={ink} fillOpacity="0.65">a fresh lane starts at 0 and is valid immediately</text>

          <line x1={700} y1={206} x2={700} y2={302} stroke={accent} strokeWidth="1.2" strokeDasharray="4 3" markerStart="url(#lanes-arrow)" markerEnd="url(#lanes-arrow)" />
          <text x={712} y={250} fontSize="10" fill={accent} fontWeight="600">no ordering between lanes</text>
          <text x={712} y={264} fontSize="9.5" fill={ink} fillOpacity="0.6">whatever happens on one lane,</text>
          <text x={712} y={277} fontSize="9.5" fill={ink} fillOpacity="0.6">the others stay valid</text>

          <line x1={120} y1={324} x2={200} y2={324} stroke={accent} strokeWidth="1.2" markerEnd="url(#lanes-arrow)" />
          <text x={210} y={328} fontSize="9.5" fill={accent} fontWeight="600">strictly ordered within a lane, left to right</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">EntryPoint v0.8 stores a UserOperation nonce as a 192-bit key plus a 64-bit sequence and tracks one sequence per key. Operations on different keys never queue behind each other; operations on the same key stay sequential. The repository calls a key a lane and forbids lane 0.</div>
    </div>
  );
};

export const NonceLaneDelegation = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-diagram-gold, var(--sei-gold-100))';
  const box = { fill: ink, fillOpacity: 0.05, stroke: ink, strokeOpacity: 0.35, strokeWidth: 1 };
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 350" role="img" aria-label="EIP-7702 installs a delegation designator in the funded EOA's code slot so the EntryPoint can execute LaneAccount logic at the same address" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="delegation-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="delegation-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>

          <rect x={40} y={40} width={330} height={216} rx={9} {...box} stroke={accent} strokeOpacity="0.9" strokeWidth="1.3" />
          <text x={205} y={64} fontSize="13" fontWeight="600" textAnchor="middle" fill={ink}>Funded EOA, same address</text>
          <text x={60} y={92} fontSize="10.5" fill={ink} fillOpacity="0.8">same native SEI balance</text>
          <text x={60} y={110} fontSize="10.5" fill={ink} fillOpacity="0.8">same token balances and venue approvals</text>
          <text x={60} y={128} fontSize="10.5" fill={ink} fillOpacity="0.8">same private key signs every UserOperation</text>
          <text x={60} y={146} fontSize="10.5" fill={ink} fillOpacity="0.8">EVM nonce: a self-sponsored delegation spends two,</text>
          <text x={60} y={161} fontSize="10.5" fill={ink} fillOpacity="0.8">then it is frozen on the submission path</text>
          <rect x={56} y={180} width={298} height={58} rx={6} fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1" />
          <text x={68} y={198} fontSize="9.5" fill={accent} fontWeight="600">code slot (delegation designator)</text>
          <text x={68} y={220} fontSize="11" fill={ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">0xef0100 || LaneAccount address</text>

          <rect x={530} y={40} width={310} height={78} rx={9} {...box} />
          <text x={685} y={62} fontSize="12.5" fontWeight="600" textAnchor="middle" fill={ink}>EntryPoint v0.8 singleton</text>
          <text x={685} y={80} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.7" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108</text>
          <text x={685} y={100} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">checks signature, lane sequence, and prefund</text>
          <line x1={528} y1={79} x2={374} y2={79} stroke={ink} strokeOpacity="0.55" strokeWidth="1.3" markerEnd="url(#delegation-arrow)" />
          <text x={451} y={70} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">handleOps calls</text>
          <text x={451} y={92} fontSize="8.5" textAnchor="middle" fill={ink} fillOpacity="0.75" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">execute(target, value, data)</text>

          <rect x={530} y={168} width={310} height={88} rx={9} fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="1.2" />
          <text x={685} y={191} fontSize="12.5" fontWeight="600" textAnchor="middle" fill={ink}>LaneAccount implementation</text>
          <text x={685} y={210} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.75">inherits the reference Simple7702Account</text>
          <text x={685} y={226} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.75">adds one rule: lane 0 is rejected</text>
          <text x={685} y={242} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.75">ADMIN_LANE = max uint192 for ordered admin calls</text>
          <line x1={356} y1={209} x2={526} y2={209} stroke={accent} strokeWidth="1.3" markerEnd="url(#delegation-accent)" />
          <text x={441} y={202} fontSize="9.5" textAnchor="middle" fill={accent} fontWeight="600">runs this code</text>

          <line x1={205} y1={258} x2={205} y2={296} stroke={ink} strokeOpacity="0.55" strokeWidth="1.3" markerEnd="url(#delegation-arrow)" />
          <rect x={90} y={298} width={230} height={40} rx={7} fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="1.1" />
          <text x={205} y={323} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>venue contract</text>
          <text x={340} y={312} fontSize="10" fill={ink} fillOpacity="0.8">msg.sender = the funded EOA, not a proxy</text>
          <text x={340} y={328} fontSize="10" fill={ink} fillOpacity="0.8">tx.origin = the gas-paying relayer</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">One type-4 transaction writes the designator into the EOA's code slot. The address, balances, and approvals do not move. When the EntryPoint calls the account, the EVM runs LaneAccount's code in the EOA's context, so the venue sees the funded address as msg.sender.</div>
    </div>
  );
};

export const NonceLanePipeline = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-diagram-gold, var(--sei-gold-100))';
  const box = { fill: ink, fillOpacity: 0.05, stroke: ink, strokeOpacity: 0.35, strokeWidth: 1 };
  const relayers = ['relayer 0', 'relayer 1', 'relayer 2', 'relayer N'];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 340" role="img" aria-label="Submission pipeline: the funded account signs UserOperations into an in-process bundling queue, gas-only relayers wrap bundles in handleOps transactions, and the EntryPoint executes them through LaneAccount at the venue" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="pipeline-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>

          <line x1={450} y1={18} x2={450} y2={322} stroke={accent} strokeWidth="1.3" strokeDasharray="6 4" />
          <text x={440} y={14} fontSize="10" textAnchor="end" fill={accent} fontWeight="600">holds the funds, signs intents</text>
          <text x={460} y={14} fontSize="10" fill={accent} fontWeight="600">holds gas only, cannot forge an operation</text>

          <rect x={30} y={110} width={180} height={124} rx={9} fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.3" />
          <text x={120} y={134} fontSize="12.5" fontWeight="600" textAnchor="middle" fill={ink}>Funded EOA</text>
          <text x={120} y={154} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">delegated to LaneAccount</text>
          <text x={120} y={170} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">signs one UserOperation per lane</text>
          <text x={120} y={186} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">EIP-712 digest, no nonce RPCs</text>
          <text x={120} y={210} fontSize="10" textAnchor="middle" fill={accent} fontWeight="600">EVM nonce does not move</text>
          <line x1={212} y1={172} x2={246} y2={172} stroke={ink} strokeOpacity="0.5" strokeWidth="1.3" markerEnd="url(#pipeline-arrow)" />

          <rect x={250} y={110} width={170} height={124} rx={9} {...box} />
          <text x={335} y={134} fontSize="12.5" fontWeight="600" textAnchor="middle" fill={ink}>Bundling queue</text>
          <text x={335} y={154} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">in-process FIFO of signed ops</text>
          <text x={335} y={170} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">one op per lane per bundle</text>
          <text x={335} y={186} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">no ERC-7562 4-op sender cap</text>
          <text x={335} y={210} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">bundles ≤ MAX_OPS_PER_BUNDLE</text>

          {relayers.map((r, i) => {
            const y = 40 + i * 72;
            return (
              <g key={r}>
                <path d={`M 422 172 C 460 172, 470 ${y + 24}, 486 ${y + 24}`} fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#pipeline-arrow)" />
                <rect x={490} y={y} width={150} height={48} rx={7} {...box} />
                <text x={565} y={y + 19} fontSize="11.5" fontWeight="600" textAnchor="middle" fill={ink}>{r}</text>
                <text x={565} y={y + 35} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">own sequential nonce, 1 tx in flight</text>
                <path d={`M 642 ${y + 24} C 660 ${y + 24}, 664 172, 686 172`} fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#pipeline-arrow)" />
              </g>
            );
          })}
          <text x={565} y={334} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">the sequential constraint moved here, away from the funds</text>

          <rect x={690} y={126} width={190} height={92} rx={9} {...box} stroke={accent} strokeOpacity="0.9" strokeWidth="1.3" />
          <text x={785} y={149} fontSize="12.5" fontWeight="600" textAnchor="middle" fill={ink}>EntryPoint v0.8</text>
          <text x={785} y={168} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">handleOps(ops[], relayer)</text>
          <text x={785} y={185} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">validates every op, then executes</text>
          <text x={785} y={201} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.8">each one, refunds gas to the relayer</text>
          <line x1={785} y1={220} x2={785} y2={254} stroke={ink} strokeOpacity="0.55" strokeWidth="1.3" markerEnd="url(#pipeline-arrow)" />

          <rect x={690} y={258} width={190} height={56} rx={9} fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="1.1" />
          <text x={785} y={281} fontSize="11.5" fontWeight="600" textAnchor="middle" fill={ink}>LaneAccount.execute → venue</text>
          <text x={785} y={299} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">msg.sender is the funded EOA</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">UserOperations are not transactions. Gas-only relayers wrap each bundle in an EntryPoint.handleOps transaction and pay for it. Each relayer still has one sequential EVM nonce, but a relayer key can only lose its own gas: it cannot create a valid operation without the funded account's signature.</div>
    </div>
  );
};

export const NonceLaneBundleLifecycle = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const ok = 'var(--sei-diagram-ok, #1a7a00)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const bad = 'var(--sei-diagram-error, #c20a00)';
  const steps = [
    { t: 'take bundle', s: 'from the queue' },
    { t: 'simulate', s: 'eth_estimateGas' },
    { t: 'sign at nonce n', s: 'EIP-1559 outer tx' },
    { t: 'journal', s: 'bytes hit disk first' },
    { t: 'broadcast', s: 'sendRawTransaction' },
    { t: 'wait for receipt', s: 'poll until the timeout' },
    { t: 'settle lanes', s: 'then nonce n + 1' }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 920 300" role="img" aria-label="Lifecycle of one bundle inside a relayer worker, including the same-nonce replacement loop and the simulation guard" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="bundle-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="bundle-warn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={warn} />
            </marker>
            <marker id="bundle-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={bad} />
            </marker>
          </defs>

          <text x={30} y={28} fontSize="13" fontWeight="600" fill={ink}>One relayer worker, one bundle at a time</text>
          {steps.map((st, i) => {
            const x = 30 + i * 124;
            const last = i === steps.length - 1;
            return (
              <g key={st.t}>
                <rect x={x} y={52} width={112} height={54} rx={7} fill={last ? ok : ink} fillOpacity={last ? 0.14 : 0.05} stroke={last ? ok : ink} strokeOpacity={last ? 0.9 : 0.35} strokeWidth="1.1" />
                <text x={x + 56} y={74} fontSize="11" fontWeight="600" textAnchor="middle" fill={ink}>{st.t}</text>
                <text x={x + 56} y={92} fontSize="8.5" textAnchor="middle" fill={ink} fillOpacity="0.6">{st.s}</text>
                {i < steps.length - 1 ? <line x1={x + 114} y1={79} x2={x + 122} y2={79} stroke={ink} strokeOpacity="0.5" strokeWidth="1.2" markerEnd="url(#bundle-arrow)" /> : null}
              </g>
            );
          })}

          <line x1={210} y1={108} x2={210} y2={160} stroke={bad} strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bundle-bad)" />
          <rect x={60} y={164} width={300} height={62} rx={7} fill={bad} fillOpacity="0.08" stroke={bad} strokeOpacity="0.8" strokeWidth="1.1" />
          <text x={210} y={184} fontSize="10.5" fontWeight="600" textAnchor="middle" fill={bad}>simulation fails (AA24, AA25, prefund, AA95)</text>
          <text x={210} y={201} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">nothing is broadcast, no lane sequence is consumed,</text>
          <text x={210} y={216} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">and the relayer nonce is not spent</text>

          <line x1={706} y1={108} x2={706} y2={160} stroke={warn} strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bundle-warn)" />
          <rect x={430} y={164} width={440} height={62} rx={7} fill={warn} fillOpacity="0.1" stroke={warn} strokeOpacity="0.9" strokeWidth="1.1" />
          <text x={650} y={184} fontSize="10.5" fontWeight="600" textAnchor="middle" fill={warn}>no receipt before the timeout</text>
          <text x={650} y={201} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">check every earlier attempt for a receipt, bump fees by REPLACEMENT_FEE_BUMP_PERCENT,</text>
          <text x={650} y={216} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">sign a replacement at the same nonce n, journal it, rebroadcast (up to BUNDLE_MAX_ATTEMPTS)</text>
          <line x1={582} y1={162} x2={582} y2={110} stroke={warn} strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bundle-warn)" />

          <text x={450} y={262} fontSize="10.5" textAnchor="middle" fill={accent} fontWeight="600">the worker never sends nonce n + 1 while a transaction at n might still land</text>
          <text x={450} y={282} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">on restart, the last exact raw transaction is rebroadcast first, then reconciled against lane sequences and the relayer's confirmed nonce</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Write-ahead ordering is deliberate: the signed outer transaction is journaled before it reaches the network, so a crash between signing and broadcast cannot lose or duplicate work. Replacement always reuses the relayer nonce, which is why a stuck bundle cannot create a nonce gap.</div>
    </div>
  );
};

export const NonceLaneFailureIsolation = () => {
  const ink = 'currentColor';
  const ok = 'var(--sei-diagram-ok, #1a7a00)';
  const bad = 'var(--sei-diagram-error, #c20a00)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const lane = (x, y, label, sub, c, dashed, key) => (
    <g key={key}>
      <rect x={x} y={y} width={86} height={62} rx={7} fill={c} fillOpacity={dashed ? 0.04 : 0.14} stroke={c} strokeOpacity={dashed ? 0.6 : 0.95} strokeWidth="1.2" strokeDasharray={dashed ? '4 3' : undefined} />
      <text x={x + 43} y={y + 24} fontSize="11" fontWeight="600" textAnchor="middle" fill={ink}>{label}</text>
      <text x={x + 43} y={y + 42} fontSize="9.5" textAnchor="middle" fill={c}>{sub}</text>
    </g>
  );
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 320" role="img" aria-label="Execution reverts are isolated to one lane inside a bundle; validation failures revert the whole bundle without consuming anything; never-submitted operations consume nothing" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <text x={30} y={28} fontSize="13" fontWeight="600" fill={ink}>Execution revert: isolated to its lane</text>
          <rect x={30} y={44} width={400} height={118} rx={9} fill="none" stroke={ink} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="5 4" />
          <text x={230} y={60} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">one handleOps transaction, one block</text>
          {lane(46, 70, 'lane 29', 'filled', ok, false, 'a29')}
          {lane(142, 70, 'lane 30', 'reverted', bad, false, 'a30')}
          {lane(238, 70, 'lane 31', 'filled', ok, false, 'a31')}
          {lane(334, 70, 'lane 32', 'filled', ok, false, 'a32')}
          <text x={230} y={152} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">all four sequences advance; lane 30 emits a failed UserOperationEvent and pays gas</text>
          <text x={30} y={186} fontSize="10" fill={ink} fillOpacity="0.75">the EntryPoint treats an account call failure as a per-operation result</text>
          <text x={30} y={202} fontSize="10" fill={ink} fillOpacity="0.75">and continues with the next operation in the bundle</text>

          <line x1={450} y1={20} x2={450} y2={210} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />

          <text x={470} y={28} fontSize="13" fontWeight="600" fill={ink}>Validation failure: the whole bundle</text>
          <rect x={470} y={44} width={400} height={118} rx={9} fill="none" stroke={bad} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="5 4" />
          <text x={670} y={60} fontSize="9.5" textAnchor="middle" fill={bad} fillOpacity="0.9">handleOps reverts, nothing in it is consumed</text>
          {lane(486, 70, 'lane 29', 'not consumed', ink, true, 'b29')}
          {lane(582, 70, 'lane 30', 'AA25 stale seq', bad, false, 'b30')}
          {lane(678, 70, 'lane 31', 'not consumed', ink, true, 'b31')}
          {lane(774, 70, 'lane 32', 'not consumed', ink, true, 'b32')}
          <text x={670} y={152} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">bad signature, stale sequence, or insufficient prefund fails before any execution</text>
          <text x={470} y={186} fontSize="10" fill={ink} fillOpacity="0.75">every bundle is simulated before broadcast, so this is normally caught</text>
          <text x={470} y={202} fontSize="10" fill={ink} fillOpacity="0.75">for free; MAX_OPS_PER_BUNDLE sets the size of this failure domain</text>

          <line x1={30} y1={222} x2={870} y2={222} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />
          <rect x={30} y={236} width={840} height={72} rx={9} fill={warn} fillOpacity="0.08" stroke={warn} strokeOpacity="0.8" strokeWidth="1" />
          <text x={48} y={258} fontSize="11.5" fontWeight="600" fill={ink}>Never submitted: nothing consumed</text>
          <text x={48} y={277} fontSize="10" fill={ink} fillOpacity="0.8">a signed operation whose outer transaction was dropped, evicted, or never broadcast</text>
          <text x={48} y={293} fontSize="10" fill={ink} fillOpacity="0.8">leaves its lane sequence untouched; neighboring lanes stay valid and the journal requeues it</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">The three failures have different blast radii. An execution revert costs one lane sequence and nothing else. A validation failure costs the outer transaction attempt but no sequences. A dropped bundle costs nothing on chain, which is exactly the case that strands a sequential account.</div>
    </div>
  );
};

// Benchmark charts. Every figure below is from one measurement session on Sei
// testnet against the same MockPerpVenue.place call; the page's Benchmarks
// section states the conditions. Chain-side rates divide landed operations by
// the block-timestamp span (whole seconds on Sei); client-side rates divide by
// wall time from first broadcast to last receipt. Block gas limit 12,500,000,
// about 331,000 gas per operation, so the ceiling is roughly 73 per second.
// Keep each series in sync with the benchmark table and Tuning prose in
// evm/nonce-lanes.mdx.

export const NonceLaneThroughputComparison = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const rows = [
    { label: '1 EOA, serial: send, wait, send (30 tx)', chain: 1.0, client: 1.0, lanes: false },
    { label: '1 EOA, pipelined, 1 request in flight (200 tx)', chain: 6.9, client: 6.7, lanes: false },
    { label: 'tutorial lanes, 4 relayers × 4 per bundle (24 ops)', chain: 8.0, client: 5.7, lanes: true },
    { label: 'fleet of 4 hot wallets × 100 tx', chain: 26.7, client: 24.8, lanes: false },
    { label: 'fleet of 8 hot wallets × 64 tx', chain: 51.2, client: 49.7, lanes: false },
    { label: '1 EOA, 1,024 tx in one JSON-RPC batch', chain: 51.2, client: 47.3, lanes: false },
    { label: 'lanes, 32 relayers × 8 per bundle (1,024 ops)', chain: 60.2, client: 55.3, lanes: true },
    { label: 'lanes, 16 relayers × 16 per bundle (1,024 ops)', chain: 64.0, client: 54.6, lanes: true },
    { label: 'lanes, 16 relayers × 36 per bundle (1,024 ops)', chain: 64.0, client: 55.1, lanes: true }
  ];
  const ceiling = 73;
  const x0 = 316;
  const scale = 6.5; // px per landed op/s, 0..80 across 520 px
  const rowTop = (i) => 62 + i * 40;
  const plotBottom = rowTop(rows.length) - 6;
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 468" role="img" aria-label="Landed operations per second for one EOA with sequential nonces, fleets of hot wallets, and nonce lanes, all calling the same venue on Sei Testnet; the block-gas ceiling is about 73 per second" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <text x={20} y={24} fontSize="13" fontWeight="600" fill={ink}>Landed operations per second, same venue call, Sei Testnet</text>
          <rect x={x0} y={37} width={10} height={10} rx={2} fill={accent} />
          <text x={x0 + 15} y={45} fontSize="9.5" fill={ink} fillOpacity="0.8">chain-side: landed ÷ block-timestamp span</text>
          <rect x={x0 + 240} y={37} width={10} height={10} rx={2} fill={ink} fillOpacity="0.3" />
          <text x={x0 + 255} y={45} fontSize="9.5" fill={ink} fillOpacity="0.8">client-side: landed ÷ wall time, first broadcast to last receipt</text>

          {[0, 20, 40, 60, 80].map((v) => (
            <g key={'g' + v}>
              <line x1={x0 + v * scale} y1={58} x2={x0 + v * scale} y2={plotBottom} stroke={ink} strokeOpacity="0.12" strokeWidth="1" />
              <text x={x0 + v * scale} y={plotBottom + 14} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">{v}</text>
            </g>
          ))}
          <text x={x0 + 40 * scale} y={plotBottom + 30} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.7">landed operations per second</text>

          <line x1={x0 + ceiling * scale} y1={58} x2={x0 + ceiling * scale} y2={plotBottom} stroke={warn} strokeWidth="1.2" strokeDasharray="4 3" />
          <text x={x0 + ceiling * scale + 5} y={rowTop(0) + 12} fontSize="9.5" fill={ink} fontWeight="600">block-gas ceiling</text>
          <text x={x0 + ceiling * scale + 5} y={rowTop(0) + 25} fontSize="9.5" fill={ink}>≈ 73 per second</text>

          {rows.map((r, i) => {
            const y = rowTop(i);
            return (
              <g key={r.label}>
                <text x={x0 - 12} y={y + 22} fontSize="10.5" textAnchor="end" fill={r.lanes ? accent : ink} fontWeight={r.lanes ? '600' : '400'}>{r.label}</text>
                <rect x={x0} y={y + 6} width={r.chain * scale} height={11} rx={2} fill={accent} fillOpacity="0.9" />
                <text x={x0 + r.chain * scale + 4} y={y + 15} fontSize="9.5" fill={ink}>{r.chain.toFixed(1)}</text>
                <rect x={x0} y={y + 19} width={r.client * scale} height={11} rx={2} fill={ink} fillOpacity="0.3" />
                <text x={x0 + r.client * scale + 4} y={y + 28} fontSize="9.5" fill={ink} fillOpacity="0.7">{r.client.toFixed(1)}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">One measurement session on Sei Testnet, every strategy calling the same MockPerpVenue.place at about 330,000 gas per call. Block gas, not the nonce model, sets the ceiling: lanes came within 12 percent of it from one address whose EVM nonce never moved, while the single sequential queue matched the hot-wallet fleet only when every transaction left in one JSON-RPC batch. Short runs read high on the chain-side scale because Sei stamps blocks in whole seconds.</div>
    </div>
  );
};

export const NonceLaneBlockGasUtilization = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const rows = [
    { label: 'tutorial lanes, 4 relayers × 4 per bundle', avg: 10.6, max: 31.1, full: '0 of 7' },
    { label: 'fleet of 8 hot wallets × 64 tx', avg: 54.4, max: 66.7, full: '0 of 25' },
    { label: '1 EOA, 1,024 tx in one JSON-RPC batch', avg: 68.1, max: 97.2, full: '24 of 40' },
    { label: 'lanes, 16 relayers × 16 per bundle', avg: 81.1, max: 91.4, full: '1 of 34' },
    { label: 'lanes, 32 relayers × 8 per bundle', avg: 82.5, max: 94.6, full: '1 of 34' },
    { label: 'lanes, 16 relayers × 36 per bundle', avg: 88.4, max: 98.1, full: '28 of 31' }
  ];
  const x0 = 306;
  const scale = 4.3; // px per percent, 0..100 across 430 px
  const rowTop = (i) => 62 + i * 40;
  const plotBottom = rowTop(rows.length) - 6;
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 350" role="img" aria-label="Average and maximum block gas used as a percentage of the 12,500,000 limit during each benchmark run, with the number of blocks at least 90 percent full" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <text x={20} y={24} fontSize="13" fontWeight="600" fill={ink}>Block gas used during each run, percent of the 12,500,000 limit</text>
          <rect x={x0} y={37} width={10} height={10} rx={2} fill={accent} fillOpacity="0.9" />
          <text x={x0 + 15} y={45} fontSize="9.5" fill={ink} fillOpacity="0.8">average over the run's blocks</text>
          <line x1={x0 + 190} y1={36} x2={x0 + 190} y2={48} stroke={ink} strokeWidth="1.6" />
          <text x={x0 + 197} y={45} fontSize="9.5" fill={ink} fillOpacity="0.8">fullest block</text>
          <text x={770} y={45} fontSize="9.5" fill={ink} fillOpacity="0.8" fontWeight="600">blocks ≥ 90% full</text>

          {[0, 25, 50, 75, 100].map((v) => (
            <g key={'g' + v}>
              <line x1={x0 + v * scale} y1={58} x2={x0 + v * scale} y2={plotBottom} stroke={ink} strokeOpacity="0.12" strokeWidth="1" />
              <text x={x0 + v * scale} y={plotBottom + 14} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">{v}%</text>
            </g>
          ))}
          <line x1={x0 + 90 * scale} y1={58} x2={x0 + 90 * scale} y2={plotBottom} stroke={warn} strokeWidth="1.2" strokeDasharray="4 3" />
          <text x={x0 + 90 * scale} y={plotBottom + 28} fontSize="9.5" textAnchor="middle" fill={ink} fontWeight="600">90%: the chain, not the client, is the limit</text>

          {rows.map((r, i) => {
            const y = rowTop(i);
            const xMax = x0 + r.max * scale;
            // Long bars carry their label inside, so it never sits on the 90% line.
            const inside = r.avg >= 60;
            return (
              <g key={r.label}>
                <text x={x0 - 12} y={y + 20} fontSize="10.5" textAnchor="end" fill={ink}>{r.label}</text>
                <rect x={x0} y={y + 8} width={r.avg * scale} height={16} rx={2} fill={accent} fillOpacity="0.9" />
                <text x={inside ? x0 + r.avg * scale - 5 : x0 + r.avg * scale + 4} y={y + 20} fontSize="9.5" textAnchor={inside ? 'end' : 'start'} fill={inside ? '#ffffff' : ink} fontWeight={inside ? '600' : '400'}>{r.avg.toFixed(1)}%</text>
                <line x1={xMax} y1={y + 5} x2={xMax} y2={y + 27} stroke={ink} strokeWidth="1.6" />
                <text x={xMax + 4} y={y + 20} fontSize="9" fill={ink} fillOpacity="0.65">{r.max.toFixed(1)}%</text>
                <text x={770} y={y + 20} fontSize="10.5" fill={ink} fillOpacity="0.85">{r.full}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Read from the chain with the repository's block report over each run's block range. The tutorial shape leaves blocks almost empty, so its rate is the client's, not the chain's. The lanes run with 16 relayers and 36 operations per bundle filled 28 of 31 blocks past 90 percent. The batch run's fullest block came within one percentage point of it, 97.2 percent compared with 98.1 percent, but averaged 68.1 percent compared with 88.4 percent for lanes.</div>
    </div>
  );
};

export const NonceLaneScalingSeries = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const warn = 'var(--sei-diagram-warning, #b45309)';
  const yTop = 62;
  const yBottom = 252;
  const yFor = (v) => yBottom - (v / 80) * (yBottom - yTop);
  const ceiling = 73;
  const panels = [
    {
      title: '4 relayers, by bundle width',
      axis: 'MAX_OPS_PER_BUNDLE',
      x0: 78,
      step: 70,
      cats: ['1', '4', '8', '16', '32', '36'],
      chain: [3.2, 9.8, 17.1, 28.4, 51.2, 56.9],
      client: [2.7, 8.9, 15.3, 24.3, 45.4, 50.5]
    },
    {
      title: 'width 4, by relayer count',
      axis: 'RELAYER_COUNT',
      x0: 518,
      step: 84,
      cats: ['1', '4', '8', '16', '32'],
      chain: [2.7, 9.8, 17.1, 32.0, 51.2],
      client: [2.2, 8.9, 15.4, 27.9, 47.2]
    }
  ];
  const points = (p, series) => series.map((v, i) => `${p.x0 + i * p.step},${yFor(v)}`).join(' ');
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 312" role="img" aria-label="Landed operations per second as bundle width grows at 4 relayers, and as the relayer count grows at width 4; both series rise toward the block-gas ceiling of about 73 per second" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          {panels.map((p) => {
            const left = p.x0 - 40;
            const right = p.x0 + (p.cats.length - 1) * p.step + 30;
            return (
              <g key={p.title}>
                <text x={left} y={24} fontSize="13" fontWeight="600" fill={ink}>{p.title}</text>
                <text x={left} y={44} fontSize="9.5" fill={ink} fillOpacity="0.6">landed operations per second</text>
                {[0, 20, 40, 60, 80].map((v) => (
                  <g key={p.title + v}>
                    <line x1={left + 22} y1={yFor(v)} x2={right} y2={yFor(v)} stroke={ink} strokeOpacity="0.12" strokeWidth="1" />
                    <text x={left + 16} y={yFor(v) + 3.5} fontSize="9" textAnchor="end" fill={ink} fillOpacity="0.6">{v}</text>
                  </g>
                ))}
                <line x1={left + 22} y1={yFor(ceiling)} x2={right} y2={yFor(ceiling)} stroke={warn} strokeWidth="1.2" strokeDasharray="4 3" />
                <text x={right} y={yFor(ceiling) - 5} fontSize="9" textAnchor="end" fill={ink} fontWeight="600">block-gas ceiling ≈ 73</text>
                <polyline points={points(p, p.client)} fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="5 3" />
                <polyline points={points(p, p.chain)} fill="none" stroke={accent} strokeWidth="1.8" />
                {p.cats.map((c, i) => {
                  const x = p.x0 + i * p.step;
                  // Near the axis a label below the dot would land on the category tick, so it moves beside it.
                  const low = yFor(p.client[i]) + 15 > yBottom - 4;
                  return (
                    <g key={p.title + c}>
                      <circle cx={x} cy={yFor(p.client[i])} r={3} fill={ink} fillOpacity="0.45" />
                      <circle cx={x} cy={yFor(p.chain[i])} r={3.4} fill={accent} />
                      <text x={x} y={yFor(p.chain[i]) - 8} fontSize="9" textAnchor="middle" fill={accent} fontWeight="600">{p.chain[i].toFixed(1)}</text>
                      <text x={low ? x + 8 : x} y={low ? yFor(p.client[i]) + 3.5 : yFor(p.client[i]) + 15} fontSize="8.5" textAnchor={low ? 'start' : 'middle'} fill={ink} fillOpacity="0.65">{p.client[i].toFixed(1)}</text>
                      <text x={x} y={yBottom + 16} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">{c}</text>
                    </g>
                  );
                })}
                <text x={(left + 22 + right) / 2} y={yBottom + 32} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{p.axis}</text>
              </g>
            );
          })}
          <line x1={330} y1={302} x2={352} y2={302} stroke={accent} strokeWidth="1.8" />
          <circle cx={341} cy={302} r={3.4} fill={accent} />
          <text x={358} y={305.5} fontSize="9.5" fill={ink} fillOpacity="0.8">chain-side</text>
          <line x1={430} y1={302} x2={452} y2={302} stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="5 3" />
          <circle cx={441} cy={302} r={3} fill={ink} fillOpacity="0.45" />
          <text x={458} y={305.5} fontSize="9.5" fill={ink} fillOpacity="0.8">client-side</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Categories are evenly spaced, not to scale. Both series climb almost linearly while the pool is the bottleneck, because each relayer's bundle cycle is about 1.5 seconds of sequential RPC round trips plus inclusion, and flatten as the in-flight work approaches what a 12,500,000-gas block can hold. Runs used 32 to 1,024 operations, so the shorter ones read higher on the chain-side scale than they would sustain. The sweep point with 4 relayers and a bundle width of 4 used 32 operations. The tutorial comparison used 24, so their rates differ despite the same bundle shape.</div>
    </div>
  );
};
