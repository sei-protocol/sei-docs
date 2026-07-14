export const GigaProposerComparison = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const box = { fill: ink, fillOpacity: 0.05, stroke: ink, strokeOpacity: 0.35, strokeWidth: 1 };
  const lanes = [0, 1, 2, 3];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 300" role="img" aria-label="Single proposer versus Multi-Proposer architecture" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gpc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="gpc-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>

          <text x={110} y={30} fontSize="13" fontWeight="600" fill={ink}>Single proposer (Tendermint-style)</text>
          {lanes.map((i) => (
            <g key={'l' + i}>
              <circle cx={90} cy={80 + i * 52} r={15} fill={i === 1 ? accent : ink} fillOpacity={i === 1 ? 0.9 : 0.12} stroke={i === 1 ? accent : ink} strokeOpacity={i === 1 ? 1 : 0.4} />
              <text x={90} y={84 + i * 52} fontSize="10.5" textAnchor="middle" fill={i === 1 ? '#fff' : ink} fillOpacity={i === 1 ? 1 : 0.8}>V{i + 1}</text>
            </g>
          ))}
          <text x={62} y={136} fontSize="10" textAnchor="end" fill={accent}>leader</text>
          {[0, 2, 3].map((i) => (
            <path key={'v' + i} d={`M 108 ${80 + i * 52} Q 150 ${80 + i * 52} 168 ${138 - (i === 0 ? 6 : 0)}`} fill="none" stroke={ink} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#gpc-a)" />
          ))}
          <text x={148} y={100} fontSize="9.5" fill={ink} fillOpacity="0.55">votes</text>
          <line x1={108} y1={132} x2={170} y2={132} stroke={accent} strokeWidth="1.6" markerEnd="url(#gpc-b)" />
          <rect x={174} y={110} width={120} height={44} rx={7} {...box} stroke={accent} strokeOpacity="0.9" />
          <text x={234} y={129} fontSize="11" textAnchor="middle" fill={ink}>block h</text>
          <text x={234} y={144} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">one block per round</text>
          <line x1={234} y1={154} x2={234} y2={212} stroke={ink} strokeOpacity="0.4" strokeWidth="1" markerEnd="url(#gpc-a)" />
          {[0, 1, 2].map((i) => (
            <g key={'c' + i}>
              <rect x={160 + i * 54} y={216} width={46} height={28} rx={5} {...box} />
              <text x={183 + i * 54} y={234} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">{['h-2', 'h-1', 'h'][i]}</text>
            </g>
          ))}
          <text x={200} y={278} fontSize="10.5" fill={ink} fillOpacity="0.6" textAnchor="middle">throughput capped by one leader's bandwidth</text>

          <line x1={425} y1={20} x2={425} y2={285} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />

          <text x={560} y={30} fontSize="13" fontWeight="600" fill={ink}>Multi-Proposer (Sei Giga)</text>
          {lanes.map((i) => (
            <g key={'r' + i}>
              <circle cx={480} cy={78 + i * 46} r={13} fill={accent} fillOpacity="0.85" />
              <text x={480} y={82 + i * 46} fontSize="10" textAnchor="middle" fill="#fff">V{i + 1}</text>
              {[0, 1, 2].map((j) => (
                <g key={'rb' + i + j}>
                  <rect x={510 + j * 56} y={64 + i * 46} width={44} height={28} rx={5} {...box} stroke={j === 2 ? accent : ink} strokeOpacity={j === 2 ? 0.9 : 0.35} />
                  {j < 2 ? <line x1={554 + j * 56} y1={78 + i * 46} x2={564 + j * 56} y2={78 + i * 46} stroke={ink} strokeOpacity="0.45" strokeWidth="1" markerEnd="url(#gpc-a)" /> : null}
                </g>
              ))}
            </g>
          ))}
          <text x={510} y={50} fontSize="9.5" fill={ink} fillOpacity="0.55">every validator streams its own lane</text>
          <text x={646} y={250} fontSize="9.5" textAnchor="middle" fill={accent}>tips</text>
          <line x1={646} y1={58} x2={646} y2={240} stroke={accent} strokeWidth="1.4" strokeDasharray="5 4" />
          <line x1={652} y1={148} x2={696} y2={148} stroke={accent} strokeWidth="1.6" markerEnd="url(#gpc-b)" />
          <rect x={700} y={106} width={130} height={84} rx={8} fill={accent} fillOpacity="0.09" stroke={accent} strokeWidth="1.2" />
          <text x={765} y={138} fontSize="11" textAnchor="middle" fill={ink}>cut of tips</text>
          <text x={765} y={155} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">one consensus slot</text>
          <text x={765} y={169} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">commits all lanes</text>
          <text x={655} y={278} fontSize="10.5" fill={ink} fillOpacity="0.6" textAnchor="middle">bandwidth scales with the validator count</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">One leader per height versus every validator proposing concurrently. In Giga, consensus will commit a cut of all lane tips, so a single decision will finalize many blocks of data.</div>
    </div>
  );
};

export const GigaAsyncPipeline = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  const rows = [
    { y: 62, label: 'Ordering' },
    { y: 116, label: 'Execution' },
    { y: 170, label: 'Attestation' }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 250" role="img" aria-label="Ordering, execution, and attestation run as a pipeline" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gap-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          {rows.map((r) => (
            <g key={r.label}>
              <text x={104} y={r.y + 17} fontSize="11.5" textAnchor="end" fill={ink} fillOpacity="0.75">{r.label}</text>
              <line x1={116} y1={r.y + 13} x2={836} y2={r.y + 13} stroke={ink} strokeOpacity="0.1" strokeWidth="1" />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={'o' + i}>
              <rect x={126 + i * 168} y={62} width={118} height={26} rx={5} fill={accent} fillOpacity={0.14} stroke={accent} strokeWidth="1" />
              <text x={185 + i * 168} y={79} fontSize="10.5" textAnchor="middle" fill={ink}>order n{i > 0 ? '+' + i : ''}</text>
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <g key={'e' + i}>
              <rect x={294 + i * 168} y={116} width={128} height={26} rx={5} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.4" strokeWidth="1" />
              <text x={358 + i * 168} y={133} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.85">execute n{i > 0 ? '+' + i : ''}</text>
            </g>
          ))}
          <rect x={630} y={170} width={186} height={26} rx={5} fill={gold} fillOpacity="0.2" stroke={gold} strokeWidth="1" />
          <text x={723} y={187} fontSize="10.5" textAnchor="middle" fill={ink}>attest n: 2/3 sign digest D_n</text>

          <line x1={244} y1={54} x2={244} y2={204} stroke={accent} strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={244} y={46} fontSize="10" textAnchor="middle" fill={accent} fontWeight="600">ordering finality for n</text>
          <line x1={244} y1={204} x2={626} y2={204} stroke={ink} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#gap-a)" />
          <text x={437} y={198} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">attestation for n lags by x blocks</text>
          <line x1={816} y1={162} x2={816} y2={204} stroke={gold} strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={744} y={216} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.85" fontWeight="600">state attestation finality for n</text>

          <line x1={116} y1={228} x2={836} y2={228} stroke={ink} strokeOpacity="0.4" strokeWidth="1" markerEnd="url(#gap-a)" />
          <text x={126} y={243} fontSize="9.5" fill={ink} fillOpacity="0.55">time</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Consensus will keep ordering new blocks while earlier blocks execute and their divergence digests are attested. Ordering finality will be the fast signal; state attestation will follow a bounded number of blocks later.</div>
    </div>
  );
};

export const GigaTxJourney = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  const steps = [
    { t: 'submit', s: 'to any RPC node' },
    { t: 'lane', s: 'validator includes it' },
    { t: 'PoA', s: 'f+1 availability votes' },
    { t: 'ordered', s: 'cut committed' },
    { t: 'executed', s: 'merged, run in parallel' },
    { t: 'attested', s: 'digest signed by 2/3' }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 900 168" role="img" aria-label="Transaction journey from submission to attestation" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gtj-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          {steps.map((st, i) => {
            const x = 76 + i * 150;
            const strong = i === 3 || i === 5;
            return (
              <g key={st.t}>
                {i < steps.length - 1 ? <line x1={x + 22} y1={84} x2={x + 128} y2={84} stroke={ink} strokeOpacity="0.4" strokeWidth="1.2" markerEnd="url(#gtj-a)" /> : null}
                <circle cx={x} cy={84} r={19} fill={strong ? accent : ink} fillOpacity={strong ? 0.9 : 0.07} stroke={strong ? accent : ink} strokeOpacity={strong ? 1 : 0.45} strokeWidth="1.2" />
                <text x={x} y={88.5} fontSize="12" textAnchor="middle" fontWeight="600" fill={strong ? '#fff' : ink}>{i + 1}</text>
                <text x={x} y={124} fontSize="11.5" textAnchor="middle" fontWeight="600" fill={ink}>{st.t}</text>
                <text x={x} y={140} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">{st.s}</text>
              </g>
            );
          })}
          <text x={526} y={40} fontSize="10" textAnchor="middle" fill={accent} fontWeight="600">ordering finality</text>
          <line x1={526} y1={46} x2={526} y2={62} stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
          <text x={826} y={40} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.85" fontWeight="600">state attestation finality</text>
          <line x1={826} y1={46} x2={826} y2={62} stroke={gold} strokeWidth="1.6" strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">The six stops of a Giga transaction. With no traditional public mempool, step 2 will happen immediately, and step 4 will fix the order irrevocably.</div>
    </div>
  );
};

export const GigaRoadmapTrack = () => {
  const ink = 'currentColor';
  const done = '#10b981';
  const prog = '#f59e0b';
  const items = [
    { l: 'WP v1', s: 'done' },
    { l: 'Devnet', s: 'done' },
    { l: 'WP v2', s: 'done' },
    { l: 'Ares', s: 'prog' },
    { l: 'Eidos', s: 'prog' },
    { l: 'SIP-3', s: 'prog' },
    { l: 'Autobahn testnet', s: 'next' },
    { l: 'Autobahn mainnet', s: 'next' },
    { l: 'Sedna', s: 'next' },
    { l: 'Hermes testnet', s: 'next' },
    { l: 'Hermes mainnet', s: 'next' }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 920 178" role="img" aria-label="Giga roadmap progress track" style={{ width: '100%', minWidth: 680, height: 'auto', display: 'block' }}>
          <line x1={50} y1={92} x2={230} y2={92} stroke={done} strokeWidth="2.5" />
          <line x1={230} y1={92} x2={470} y2={92} stroke={prog} strokeWidth="2.5" strokeDasharray="6 4" />
          <line x1={470} y1={92} x2={890} y2={92} stroke={ink} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 5" />
          {items.map((it, i) => {
            const x = 70 + i * 80;
            const above = i % 2 === 0;
            const c = it.s === 'done' ? done : it.s === 'prog' ? prog : ink;
            return (
              <g key={it.l}>
                <circle cx={x} cy={92} r={9} fill={it.s === 'next' ? 'none' : c} fillOpacity={it.s === 'done' ? 0.95 : it.s === 'prog' ? 0.25 : 0} stroke={c} strokeOpacity={it.s === 'next' ? 0.45 : 1} strokeWidth="1.6" />
                {it.s === 'done' ? <path d={`M ${x - 4} 92 l 3 3.4 l 5.4 -6.4`} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : null}
                {it.s === 'prog' ? <circle cx={x} cy={92} r={3.4} fill={prog} /> : null}
                <line x1={x} y1={above ? 82 : 102} x2={x} y2={above ? 68 : 116} stroke={ink} strokeOpacity="0.25" strokeWidth="1" />
                <text x={x} y={above ? 58 : 132} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.85">{it.l}</text>
              </g>
            );
          })}
          <rect x={296} y={140} width={9} height={9} rx={2} fill={done} />
          <text x={311} y={148.5} fontSize="10" fill={ink} fillOpacity="0.7">complete</text>
          <rect x={386} y={140} width={9} height={9} rx={2} fill={prog} fillOpacity="0.9" />
          <text x={401} y={148.5} fontSize="10" fill={ink} fillOpacity="0.7">in progress (July 2026)</text>
          <rect x={536} y={140} width={9} height={9} rx={2} fill="none" stroke={ink} strokeOpacity="0.5" />
          <text x={551} y={148.5} fontSize="10" fill={ink} fillOpacity="0.7">coming soon</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">The eleven roadmap milestones from giga.seilabs.io. Ares, Eidos, and SIP-3 are live workstreams on the network today; the Autobahn testnet is next.</div>
    </div>
  );
};

export const GigaLanesAndCuts = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const box = { fill: ink, fillOpacity: 0.05, stroke: ink, strokeOpacity: 0.35, strokeWidth: 1 };
  const lanes = [0, 1, 2];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 300" role="img" aria-label="Lanes of chained proposals certified by Proofs of Availability, committed as a cut of tips" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="glc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="glc-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>
          <rect x={112} y={48} width={386} height={216} rx={10} fill={accent} fillOpacity="0.045" />
          <text x={118} y={40} fontSize="10" fill={ink} fillOpacity="0.55">committing a tip implicitly commits everything behind it</text>
          {lanes.map((i) => (
            <g key={'ln' + i}>
              <circle cx={74} cy={92 + i * 72} r={15} fill={accent} fillOpacity="0.85" />
              <text x={74} y={96 + i * 72} fontSize="10.5" textAnchor="middle" fill="#fff">V{i + 1}</text>
              {[0, 1, 2, 3].map((j) => (
                <g key={'p' + i + j}>
                  <rect x={124 + j * 96} y={74 + i * 72} width={72} height={36} rx={6} {...box} stroke={j === 3 ? accent : ink} strokeOpacity={j === 3 ? 0.95 : 0.35} strokeWidth={j === 3 ? 1.4 : 1} />
                  <text x={160 + j * 96} y={90 + i * 72} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">pos {j}</text>
                  <text x={160 + j * 96} y={103 + i * 72} fontSize="8.5" textAnchor="middle" fill={ink} fillOpacity="0.5">batch</text>
                  {j < 3 ? <line x1={196 + j * 96} y1={92 + i * 72} x2={218 + j * 96} y2={92 + i * 72} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#glc-a)" /> : null}
                </g>
              ))}
              <text x={472} y={70 + i * 72} fontSize="9" textAnchor="middle" fill={accent}>tip</text>
            </g>
          ))}
          <text x={252} y={286} fontSize="9.5" fill={ink} fillOpacity="0.55">arrows: parentRef hash-chains each proposal to its predecessor</text>

          <g>
            <rect x={520} y={62} width={128} height={58} rx={8} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.4" />
            <text x={584} y={84} fontSize="10.5" textAnchor="middle" fill={ink}>f + 1 votes</text>
            <text x={584} y={100} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">Proof of Availability</text>
            <line x1={520} y1={91} x2={500} y2={91} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#glc-a)" />
          </g>

          <line x1={490} y1={56} x2={490} y2={252} stroke={accent} strokeWidth="1.6" strokeDasharray="6 4" />
          <text x={490} y={270} fontSize="10" textAnchor="middle" fill={accent} fontWeight="600">cut = [tip 1, tip 2, tip 3]</text>
          <line x1={498} y1={166} x2={532} y2={166} stroke={accent} strokeWidth="1.6" markerEnd="url(#glc-b)" />
          <rect x={536} y={140} width={188} height={52} rx={8} fill={accent} fillOpacity="0.09" stroke={accent} strokeWidth="1.2" />
          <text x={630} y={162} fontSize="10.5" textAnchor="middle" fill={ink}>committed in one slot</text>
          <text x={630} y={178} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">Prepare, then Commit</text>
          <rect x={536} y={206} width={296} height={46} rx={8} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.3" strokeDasharray="4 3" />
          <text x={684} y={225} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">missing batch data is fetched after commit,</text>
          <text x={684} y={239} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">off the critical path</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Each validator will chain batches into its own lane and certify them with f + 1 availability votes. Consensus will only ever order the vector of lane tips.</div>
    </div>
  );
};

export const GigaSlotPipeline = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const slots = [0, 1, 2];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 238" role="img" aria-label="Pipelined consensus slots with prepare and commit phases" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gsp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          {slots.map((i) => {
            const x = 130 + i * 105;
            const y = 46 + i * 50;
            return (
              <g key={'s' + i}>
                <text x={x - 12} y={y + 20} fontSize="11" textAnchor="end" fill={ink} fillOpacity="0.75">slot s{i > 0 ? '+' + i : ''}</text>
                <rect x={x} y={y} width={210} height={30} rx={5} fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="1" />
                <text x={x + 105} y={y + 19} fontSize="10" textAnchor="middle" fill={ink}>Prepare (PrepareQC)</text>
                <rect x={x + 210} y={y} width={210} height={30} rx={5} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.4" strokeWidth="1" />
                <text x={x + 315} y={y + 19} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.85">Commit (CommitQC)</text>
              </g>
            );
          })}
          <line x1={235} y1={40} x2={235} y2={182} stroke={ink} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
          <text x={640} y={36} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">next slot starts once the Prepare message for s is seen</text>

          <line x1={130} y1={196} x2={340} y2={196} stroke={ink} strokeOpacity="0.5" strokeWidth="1" markerStart="url(#gsp-a)" markerEnd="url(#gsp-a)" />
          <text x={235} y={212} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">1 round trip</text>
          <line x1={340} y1={196} x2={445} y2={196} stroke={accent} strokeWidth="1.4" markerEnd="url(#gsp-a)" />
          <text x={392} y={212} fontSize="9.5" textAnchor="middle" fill={accent} fontWeight="600">+0.5 effective</text>
          <text x={630} y={208} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.8">steady state: 1.5 round trips per cut</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Slots will overlap: replicas will begin slot s+1 as soon as they see the Prepare message for slot s, so the steady-state cost will be 1.5 network round trips per committed cut.</div>
    </div>
  );
};

export const GigaAttestationFlow = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  const blocks = ['n-1', 'n', 'n+1', 'n+2', 'n+x'];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 288" role="img" aria-label="Divergence digest of block n is attested inside a later block" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gaf-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="gaf-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={gold} />
            </marker>
          </defs>
          {blocks.map((b, i) => (
            <g key={b}>
              <rect x={64 + i * 158} y={44} width={104} height={42} rx={7} fill={i === 1 ? accent : ink} fillOpacity={i === 1 ? 0.14 : 0.05} stroke={i === 1 ? accent : ink} strokeOpacity={i === 1 ? 0.9 : 0.4} strokeWidth={i === 1 ? 1.4 : 1} />
              <text x={116 + i * 158} y={69} fontSize="11" textAnchor="middle" fill={ink}>block {b}</text>
              {i < blocks.length - 1 ? <line x1={168 + i * 158} y1={65} x2={218 + i * 158} y2={65} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gaf-a)" strokeDasharray={i === 3 ? '3 4' : 'none'} /> : null}
            </g>
          ))}
          <text x={116 + 158} y={34} fontSize="9.5" textAnchor="middle" fill={accent} fontWeight="600">ordering final</text>

          <line x1={274} y1={86} x2={274} y2={120} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gaf-a)" />
          {[
            { x: 96, label: 'execute block n', sub: 'deterministic Apply' },
            { x: 296, label: 'write log', sub: 'last write wins' },
            { x: 496, label: 'd_n = LtHash(...)', sub: 'writes, receipts, gas' }
          ].map((s, i) => (
            <g key={s.label}>
              <rect x={s.x} y={124} width={168} height={48} rx={8} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.4" />
              <text x={s.x + 84} y={144} fontSize="10.5" textAnchor="middle" fill={ink}>{s.label}</text>
              <text x={s.x + 84} y={160} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.6">{s.sub}</text>
              {i < 2 ? <line x1={s.x + 168} y1={148} x2={s.x + 196} y2={148} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gaf-a)" /> : null}
            </g>
          ))}
          <line x1={664} y1={148} x2={692} y2={148} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gaf-a)" />
          <rect x={696} y={124} width={128} height={48} rx={8} fill={gold} fillOpacity="0.18" stroke={gold} strokeWidth="1.2" />
          <text x={760} y={144} fontSize="10.5" textAnchor="middle" fill={ink}>digest D_n</text>
          <text x={760} y={160} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.65">compact commitment</text>
          <path d="M 760 122 Q 762 96 736 88" fill="none" stroke={gold} strokeWidth="1.4" strokeDasharray="4 3" markerEnd="url(#gaf-b)" />
          <text x={810} y={100} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">2/3-signed, included</text>
          <text x={810} y={113} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">in block n+x</text>

          <rect x={96} y={210} width={728} height={52} rx={8} fill={ink} fillOpacity="0.03" stroke={ink} strokeOpacity="0.25" strokeDasharray="4 3" />
          <text x={460} y={231} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.75">signing two different digests for the same block is slashable equivocation;</text>
          <text x={460} y={247} fontSize="10" textAnchor="middle" fill={ink} fillOpacity="0.75">divergence under 1/3 of validators isolates the fault, divergence over 1/3 halts the chain</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Execution results will be committed as a lattice-hash digest rather than a state root, and validators will attest to that digest a bounded number of blocks later.</div>
    </div>
  );
};

export const GigaOccDiagram = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const workers = ['worker 1', 'worker 2', 'worker 3'];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 268" role="img" aria-label="Block-STM optimistic concurrency: parallel execution with conflict re-execution" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="goc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>
          {workers.map((w, i) => (
            <g key={w}>
              <text x={104} y={72 + i * 62} fontSize="11" textAnchor="end" fill={ink} fillOpacity="0.75">{w}</text>
              <line x1={116} y1={68 + i * 62} x2={620} y2={68 + i * 62} stroke={ink} strokeOpacity="0.12" strokeWidth="1" />
            </g>
          ))}
          <rect x={126} y={50} width={120} height={34} rx={6} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.45" />
          <text x={186} y={71} fontSize="10.5" textAnchor="middle" fill={ink}>t1</text>
          <rect x={126} y={112} width={120} height={34} rx={6} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.45" />
          <text x={186} y={133} fontSize="10.5" textAnchor="middle" fill={ink}>t2 writes k</text>
          <rect x={126} y={174} width={180} height={34} rx={6} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.45" />
          <text x={216} y={195} fontSize="10.5" textAnchor="middle" fill={ink}>t3</text>
          <rect x={286} y={50} width={120} height={34} rx={6} fill={accent} fillOpacity="0.08" stroke={accent} strokeOpacity="0.8" strokeDasharray="4 3" />
          <text x={346} y={71} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.85">t4 reads k</text>
          <rect x={286} y={112} width={120} height={34} rx={6} fill={ink} fillOpacity="0.06" stroke={ink} strokeOpacity="0.45" />
          <text x={346} y={133} fontSize="10.5" textAnchor="middle" fill={ink}>t5</text>
          <path d="M 250 129 Q 300 96 330 88" fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="4 3" markerEnd="url(#goc-a)" />
          <text x={300} y={104} fontSize="9" fill={accent}>conflict</text>
          <path d="M 406 67 Q 446 40 470 58" fill="none" stroke={accent} strokeWidth="1.4" markerEnd="url(#goc-a)" />
          <rect x={470} y={50} width={130} height={34} rx={6} fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="1.3" />
          <text x={535} y={71} fontSize="10.5" textAnchor="middle" fill={ink}>t4 re-executes</text>
          <text x={452} y={30} fontSize="9.5" fill={ink} fillOpacity="0.6">validation caught the stale read</text>

          <line x1={636} y1={128} x2={664} y2={128} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#goc-a)" />
          <rect x={668} y={92} width={172} height={72} rx={8} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.4" />
          <text x={754} y={117} fontSize="10.5" textAnchor="middle" fill={ink}>commit in block order</text>
          <text x={754} y={133} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">result identical to</text>
          <text x={754} y={147} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">sequential execution</text>

          <text x={126} y={244} fontSize="9.5" fill={ink} fillOpacity="0.6">only conflicting transactions re-run; after 10 retries the implementation falls back to sequential execution</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">All transactions in a block will start in parallel with private write buffers. Validation will re-execute only those whose reads collided with an earlier transaction's writes.</div>
    </div>
  );
};

export const GigaStorageArchitecture = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 300" role="img" aria-label="Giga storage: RAM-first flat key-value state with WAL, tiers, and lattice-hash commitments" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gsa-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          <text x={200} y={32} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>state path</text>
          <rect x={60} y={44} width={280} height={40} rx={7} fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.1" />
          <text x={200} y={69} fontSize="10.5" textAnchor="middle" fill={ink}>execution: reads served from RAM</text>
          <line x1={200} y1={84} x2={200} y2={106} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" />
          <rect x={60} y={110} width={280} height={44} rx={7} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
          <text x={200} y={129} fontSize="10.5" textAnchor="middle" fill={ink}>flat key-value store (LSM tree)</text>
          <text x={200} y={145} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.6">no per-write Merkle updates</text>
          <rect x={372} y={110} width={140} height={44} rx={7} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.35" strokeDasharray="4 3" />
          <text x={442} y={129} fontSize="10" textAnchor="middle" fill={ink}>append-only WAL</text>
          <text x={442} y={145} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.6">crash recovery</text>
          <line x1={340} y1={132} x2={368} y2={132} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" strokeDasharray="3 3" />
          <text x={354} y={122} fontSize="8.5" textAnchor="middle" fill={ink} fillOpacity="0.55">async</text>
          <line x1={200} y1={154} x2={200} y2={176} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" />
          <rect x={60} y={180} width={280} height={40} rx={7} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
          <text x={200} y={200} fontSize="10.5" textAnchor="middle" fill={ink}>hot tier: local high-performance SSDs</text>
          <line x1={200} y1={220} x2={200} y2={242} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" strokeDasharray="3 3" />
          <rect x={60} y={246} width={280} height={40} rx={7} fill={ink} fillOpacity="0.03" stroke={ink} strokeOpacity="0.3" strokeDasharray="4 3" />
          <text x={200} y={266} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.85">cold tier: distributed columnar store</text>

          <text x={690} y={32} fontSize="12" fontWeight="600" textAnchor="middle" fill={ink}>commitment path</text>
          <rect x={580} y={44} width={220} height={40} rx={7} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
          <text x={690} y={69} fontSize="10.5" textAnchor="middle" fill={ink}>write log of block n</text>
          <line x1={690} y1={84} x2={690} y2={106} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" />
          <rect x={580} y={110} width={220} height={44} rx={7} fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.1" />
          <text x={690} y={129} fontSize="10.5" textAnchor="middle" fill={ink}>lattice hash d_n (LtHash)</text>
          <text x={690} y={145} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.6">incremental, order-independent</text>
          <line x1={690} y1={154} x2={690} y2={176} stroke={ink} strokeOpacity="0.45" strokeWidth="1.1" markerEnd="url(#gsa-a)" />
          <rect x={580} y={180} width={220} height={40} rx={7} fill={gold} fillOpacity="0.16" stroke={gold} strokeWidth="1.1" />
          <text x={690} y={205} fontSize="10.5" textAnchor="middle" fill={ink}>D_n attested by 2/3 quorum</text>
          <rect x={580} y={246} width={220} height={40} rx={7} fill={ink} fillOpacity="0.03" stroke={ink} strokeOpacity="0.3" strokeDasharray="4 3" />
          <text x={690} y={262} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">disputes: compare chunk digests,</text>
          <text x={690} y={276} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">bisect, replay one range</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">The write path will never touch a Merkle tree: state will live in a RAM-first flat store with an append-only WAL, while commitments will come from a homomorphic lattice hash over each block's write log.</div>
    </div>
  );
};

export const GigaBudWindow = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  const leaves = ['(key a, value, n, prev)', '(key b, value, n, prev)', '(key c, value, n, prev)'];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 260" role="img" aria-label="Block Update Digests: per-block Merkle roots aggregated into SuperBUD windows" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gbw-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          {leaves.map((l, i) => (
            <g key={l}>
              <rect x={56} y={36 + i * 34} width={170} height={26} rx={5} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.4" />
              <text x={141} y={53 + i * 34} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.85" fontFamily="var(--sei-font-mono)">{l}</text>
              <line x1={226} y1={49 + i * 34} x2={262} y2={83} stroke={ink} strokeOpacity="0.4" strokeWidth="1" />
            </g>
          ))}
          <text x={141} y={148} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">this block's writes, sorted by key</text>
          <rect x={264} y={68} width={92} height={32} rx={6} fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.2" />
          <text x={310} y={88} fontSize="10.5" textAnchor="middle" fill={ink}>root U_n</text>
          <line x1={356} y1={84} x2={392} y2={84} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gbw-a)" />
          <rect x={396} y={62} width={170} height={44} rx={7} fill={gold} fillOpacity="0.16" stroke={gold} strokeWidth="1.1" />
          <text x={481} y={81} fontSize="10" textAnchor="middle" fill={ink}>attested with D_n</text>
          <text x={481} y={97} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.65">same 2/3 quorum schedule</text>
          <rect x={598} y={54} width={222} height={60} rx={7} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.35" strokeDasharray="4 3" />
          <text x={709} y={76} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">proof = Merkle path to attested U_n;</text>
          <text x={709} y={91} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">two proofs bracket an unmodified span</text>
          <text x={709} y={106} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">cost scales with the block's updates</text>

          <line x1={56} y1={196} x2={830} y2={196} stroke={ink} strokeOpacity="0.4" strokeWidth="1" markerEnd="url(#gbw-a)" />
          {Array.from({ length: 17 }, (_, i) => (
            <line key={'t' + i} x1={70 + i * 46} y1={192} x2={70 + i * 46} y2={200} stroke={ink} strokeOpacity="0.45" strokeWidth="1" />
          ))}
          <text x={70} y={214} fontSize="9" fill={ink} fillOpacity="0.55">blocks</text>
          {[0, 1, 2, 3].map((i) => (
            <path key={'w1' + i} d={`M ${70 + i * 184} 186 L ${70 + i * 184} 180 L ${208 + i * 184} 180 L ${208 + i * 184} 186`} fill="none" stroke={accent} strokeWidth="1.2" />
          ))}
          <text x={139} y={172} fontSize="9" textAnchor="middle" fill={accent}>SuperBUD, e blocks</text>
          <path d="M 70 162 L 70 154 L 806 154 L 806 162" fill="none" stroke={accent} strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="5 4" />
          <text x={438} y={146} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.75">guaranteed proof window: the last e^Lmax blocks (governance-set); older claims need archive nodes</text>
          <text x={520} y={232} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">touch transactions refresh a stale key's anchor; deletions leave tombstones for exclusion proofs</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Every block will get a Merkle root over just its own updates. SuperBUDs will aggregate those roots over exponentially sized windows so provers can cover long ranges with a handful of digests.</div>
    </div>
  );
};

export const GigaMergeRule = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const lanesIn = [
    { v: 'V1', max: 12, txs: [{ n: 'a', t: 12 }, { n: 'e', t: 8, dup: true }] },
    { v: 'V2', max: 40, txs: [{ n: 'c', t: 40 }, { n: 'd', t: 9 }] },
    { v: 'V3', max: 20, txs: [{ n: 'f', t: 20 }, { n: 'e', t: 8 }] }
  ];
  const sorted = [1, 2, 0];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 880 300" role="img" aria-label="Tip-priority merge rule: sort lanes by highest tip, keep intra-lane order, deduplicate" style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gmr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          <text x={60} y={34} fontSize="11" fontWeight="600" fill={ink}>new transactions per lane</text>
          {lanesIn.map((ln, i) => (
            <g key={ln.v}>
              <text x={74} y={72 + i * 56} fontSize="10.5" textAnchor="middle" fill={ink} fillOpacity="0.8">{ln.v}</text>
              <text x={74} y={86 + i * 56} fontSize="8.5" textAnchor="middle" fill={ink} fillOpacity="0.5">max {ln.max}</text>
              {ln.txs.map((tx, j) => (
                <g key={ln.v + tx.n}>
                  <rect x={100 + j * 92} y={54 + i * 56} width={80} height={30} rx={6} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
                  <text x={140 + j * 92} y={73 + i * 56} fontSize="10" textAnchor="middle" fill={ink}>{tx.n} · tip {tx.t}</text>
                </g>
              ))}
            </g>
          ))}
          <line x1={300} y1={122} x2={352} y2={122} stroke={ink} strokeOpacity="0.5" strokeWidth="1.2" markerEnd="url(#gmr-a)" />
          <text x={326} y={110} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">1. sort lanes</text>
          <text x={326} y={136} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">by max tip</text>

          <text x={366} y={34} fontSize="11" fontWeight="600" fill={ink}>lane order: V2, V3, V1</text>
          {sorted.map((li, i) => (
            <g key={'s' + li}>
              <text x={382} y={72 + i * 56} fontSize="10.5" textAnchor="middle" fill={accent} fontWeight="600">{i + 1}</text>
              {lanesIn[li].txs.map((tx, j) => (
                <g key={'s' + li + tx.n}>
                  <rect x={404 + j * 92} y={54 + i * 56} width={80} height={30} rx={6} fill={accent} fillOpacity="0.08" stroke={accent} strokeOpacity="0.7" />
                  <text x={444 + j * 92} y={73 + i * 56} fontSize="10" textAnchor="middle" fill={ink}>{lanesIn[li].v}: {tx.n}</text>
                </g>
              ))}
            </g>
          ))}
          <text x={490} y={218} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">2. intra-lane order preserved</text>

          <line x1={608} y1={122} x2={652} y2={122} stroke={ink} strokeOpacity="0.5" strokeWidth="1.2" markerEnd="url(#gmr-a)" />
          <text x={630} y={110} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">3. dedupe</text>
          <text x={666} y={34} fontSize="11" fontWeight="600" fill={ink}>executable sequence</text>
          {['c', 'd', 'f', 'e', 'a', 'e'].map((n, i) => {
            const dup = i === 5;
            return (
              <g key={'r' + i}>
                <rect x={666} y={48 + i * 36} width={150} height={28} rx={6} fill={dup ? 'none' : ink} fillOpacity={dup ? 0 : 0.05} stroke={dup ? accent : ink} strokeOpacity={dup ? 0.7 : 0.45} strokeDasharray={dup ? '4 3' : 'none'} />
                <text x={741} y={66 + i * 36} fontSize="10" textAnchor="middle" fill={ink} fillOpacity={dup ? 0.5 : 1} textDecoration={dup ? 'line-through' : 'none'}>{i + 1}. {n}{dup ? ' (duplicate hash)' : ''}</text>
              </g>
            );
          })}
          <text x={741} y={276} fontSize="9" textAnchor="middle" fill={ink} fillOpacity="0.6">dropped copy gets a partial tip refund</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">The merged order will be a pure function of finalized lane contents: lanes will sort by their highest included tip, order inside each lane will not change, and the first occurrence of a hash will win.</div>
    </div>
  );
};

export const GigaFinalitySignals = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 232" role="img" aria-label="Which finality signal to wait for" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gfs-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
          </defs>
          <rect x={48} y={92} width={158} height={48} rx={8} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
          <text x={127} y={112} fontSize="10.5" textAnchor="middle" fill={ink}>transaction lands</text>
          <text x={127} y={128} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">in a committed cut</text>

          <line x1={206} y1={104} x2={280} y2={70} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gfs-a)" />
          <rect x={284} y={44} width={218} height={52} rx={8} fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.2" />
          <text x={393} y={65} fontSize="10.5" textAnchor="middle" fontWeight="600" fill={ink}>ordering finality</text>
          <text x={393} y={82} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">receipt available; no reorgs</text>
          <line x1={502} y1={70} x2={560} y2={70} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gfs-a)" />
          <rect x={564} y={44} width={250} height={52} rx={8} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.4" />
          <text x={689} y={65} fontSize="10" textAnchor="middle" fill={ink}>trading UX, games, payments,</text>
          <text x={689} y={81} fontSize="10" textAnchor="middle" fill={ink}>most dApp flows</text>

          <line x1={206} y1={128} x2={280} y2={162} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" strokeDasharray="4 3" markerEnd="url(#gfs-a)" />
          <rect x={284} y={136} width={218} height={52} rx={8} fill={gold} fillOpacity="0.14" stroke={gold} strokeWidth="1.2" />
          <text x={393} y={157} fontSize="10.5" textAnchor="middle" fontWeight="600" fill={ink}>state attestation finality</text>
          <text x={393} y={174} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">2/3-signed digest, x blocks later</text>
          <line x1={502} y1={162} x2={560} y2={162} stroke={ink} strokeOpacity="0.5" strokeWidth="1.1" markerEnd="url(#gfs-a)" />
          <rect x={564} y={136} width={250} height={52} rx={8} fill={ink} fillOpacity="0.04" stroke={ink} strokeOpacity="0.4" />
          <text x={689} y={157} fontSize="10" textAnchor="middle" fill={ink}>exchange deposits, bridges,</text>
          <text x={689} y={173} fontSize="10" textAnchor="middle" fill={ink}>high-value settlement, BUD proofs</text>

          <text x={393} y={216} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">the outcome is already decided at ordering finality; attestation adds a signed confirmation of it</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Two confirmation signals, two audiences: act on the receipt for interactive flows, and wait for the attested digest when third-party value moves on the result.</div>
    </div>
  );
};

export const GigaParallelismContrast = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const users = [0, 1, 2, 3];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 250" role="img" aria-label="Isolated per-user state runs in parallel; a shared hot slot serializes" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          <defs>
            <marker id="gpv-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={ink} fillOpacity="0.6" />
            </marker>
            <marker id="gpv-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={accent} />
            </marker>
          </defs>
          <text x={120} y={34} fontSize="12.5" fontWeight="600" fill={ink}>isolated state: one wave</text>
          {users.map((i) => (
            <g key={'u' + i}>
              <circle cx={92} cy={64 + i * 44} r={13} fill={ink} fillOpacity="0.08" stroke={ink} strokeOpacity="0.45" />
              <text x={92} y={68 + i * 44} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">tx{i + 1}</text>
              <line x1={110} y1={64 + i * 44} x2={196} y2={64 + i * 44} stroke={accent} strokeWidth="1.5" markerEnd="url(#gpv-b)" />
              <rect x={200} y={50 + i * 44} width={168} height={28} rx={6} fill={ink} fillOpacity="0.05" stroke={ink} strokeOpacity="0.45" />
              <text x={284} y={68 + i * 44} fontSize="9.5" textAnchor="middle" fill={ink} fontFamily="var(--sei-font-mono)">balances[user{i + 1}]</text>
            </g>
          ))}
          <text x={230} y={238} fontSize="10" fill={ink} fillOpacity="0.65" textAnchor="middle">disjoint write sets: all four execute simultaneously</text>

          <line x1={430} y1={20} x2={430} y2={235} stroke={ink} strokeOpacity="0.15" strokeWidth="1" />

          <text x={560} y={34} fontSize="12.5" fontWeight="600" fill={ink}>hot slot: one at a time</text>
          {users.map((i) => (
            <g key={'h' + i}>
              <circle cx={492} cy={64 + i * 44} r={13} fill={ink} fillOpacity="0.08" stroke={ink} strokeOpacity="0.45" />
              <text x={492} y={68 + i * 44} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">tx{i + 1}</text>
              <path d={`M 510 ${64 + i * 44} Q 580 ${64 + i * 44} 620 ${118 + (i - 1.5) * 6}`} fill="none" stroke={ink} strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray={i === 0 ? 'none' : '4 3'} markerEnd="url(#gpv-a)" />
            </g>
          ))}
          <rect x={626} y={96} width={180} height={40} rx={6} fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.2" />
          <text x={716} y={120} fontSize="9.5" textAnchor="middle" fill={ink} fontFamily="var(--sei-font-mono)">totalTransfers++</text>
          <text x={716} y={158} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">every transaction writes this slot,</text>
          <text x={716} y={173} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.7">so they re-run in sequence: 1, 2, 3, 4</text>
          <text x={648} y={238} fontSize="10" fill={ink} fillOpacity="0.65" textAnchor="middle">conflicting write sets: parallelism lost for the block</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">The same four transfers, two storage layouts. Per-user slots let Block-STM commit everything in one pass; a shared counter forces retries until the transactions run one by one.</div>
    </div>
  );
};

export const GigaFeeSplit = () => {
  const ink = 'currentColor';
  const accent = 'var(--sei-maroon-50)';
  const gold = 'var(--sei-gold-25)';
  const parts = [
    { x: 60, w: 300, label: 'execution fee', sub: '1559-style base fee', to: 'pays for gas actually consumed', c: null },
    { x: 360, w: 240, label: 'ordering fee (tip)', sub: 'buys a position in the order', to: 'socialised: epoch pool, stake x liveness', c: 'accent' },
    { x: 600, w: 200, label: 'distribution fee', sub: 'prices duplicate copies', to: 'only one copy executes; partial refund', c: 'gold' }
  ];
  return (
    <div className="not-prose w-full my-5">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4 text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 860 190" role="img" aria-label="The three components of a Giga transaction fee" style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          {parts.map((p) => {
            const fill = p.c === 'accent' ? accent : p.c === 'gold' ? gold : ink;
            const op = p.c ? 0.16 : 0.06;
            return (
              <g key={p.label}>
                <rect x={p.x} y={46} width={p.w - 8} height={44} rx={7} fill={fill} fillOpacity={op} stroke={fill} strokeOpacity={p.c ? 0.9 : 0.4} strokeWidth="1.1" />
                <text x={p.x + (p.w - 8) / 2} y={65} fontSize="11" textAnchor="middle" fontWeight="600" fill={ink}>{p.label}</text>
                <text x={p.x + (p.w - 8) / 2} y={81} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.65">{p.sub}</text>
                <line x1={p.x + (p.w - 8) / 2} y1={94} x2={p.x + (p.w - 8) / 2} y2={112} stroke={ink} strokeOpacity="0.35" strokeWidth="1" />
                <text x={p.x + (p.w - 8) / 2} y={128} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.8">{p.to}</text>
              </g>
            );
          })}
          <text x={60} y={30} fontSize="11.5" fontWeight="600" fill={ink}>one transaction, three priced things</text>
          <text x={430} y={166} fontSize="9.5" textAnchor="middle" fill={ink} fillOpacity="0.6">tipping a specific proposer buys nothing: the pool pays validators by stake and measured liveness</text>
        </svg>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Execution, ordering, and duplicate distribution will be priced separately. The tip will be strictly enforced for ordering and then socialised across the validator set.</div>
    </div>
  );
};
