import React, { useEffect, useState } from 'react';
import styles from '../../styles/InteractiveTerminal.module.css';

const InteractiveTerminal: React.FC = () => {
	const [jsonData, setJsonData] = useState<any>(null);
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

	useEffect(() => {
		fetch('https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/sei/chain.json')
			.then((res) => res.json())
			.then((data) => setJsonData(data))
			.catch((err) => console.error('Failed to fetch JSON data:', err));
	}, []);

	const toggleNode = (path: string) => {
		setExpandedNodes((prevNodes) => {
			const newNodes = new Set(prevNodes);
			if (newNodes.has(path)) {
				newNodes.delete(path);
			} else {
				newNodes.add(path);
			}
			return newNodes;
		});
	};

	const renderNode = (key: string, value: any, path: string) => {
		const isExpandable = typeof value === 'object' && value !== null;
		const isOpen = expandedNodes.has(path);
		const displayKey = key || 'root';

		return (
			<div key={path} className={styles.node}>
				<div className={styles.nodeHeader} onClick={() => isExpandable && toggleNode(path)}>
					{isExpandable && (isOpen ? '▼' : '▶')} {displayKey}
				</div>
				{isExpandable && isOpen && (
					<div className={styles.nodeChildren}>
						{Object.entries(value).map(([childKey, childValue]) => renderNode(childKey, childValue, `${path}.${childKey}`))}
					</div>
				)}
				{!isExpandable && <div className={styles.leafNode}>{String(value)}</div>}
			</div>
		);
	};

	return (
		<div className={styles.terminal}>
			<div className={styles.header}>
				<div className={styles.circle} style={{ backgroundColor: '#FF605C' }} />
				<div className={styles.circle} style={{ backgroundColor: '#FFBD44' }} />
				<div className={styles.circle} style={{ backgroundColor: '#00CA4E' }} />
			</div>
			<div className={styles.body}>{jsonData ? renderNode('', jsonData, 'root') : <div className={styles.loading}>Loading...</div>}</div>
		</div>
	);
};

export default InteractiveTerminal;
