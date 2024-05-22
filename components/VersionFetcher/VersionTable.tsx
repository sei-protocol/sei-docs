import React, { useState } from 'react';
import VersionFetcher from './VersionFetcher';

const VersionTable: React.FC = () => {
  const [mainnetVersion, setMainnetVersion] = useState('');
  const [testnetVersion, setTestnetVersion] = useState('');
  const [devnetVersion, setDevnetVersion] = useState('');

  return (
    <>
      <VersionFetcher chainId="pacific-1" rpcEndpoint="https://rpc.sei-apis.com" setVersion={setMainnetVersion} />
      <VersionFetcher chainId="atlantic-2" rpcEndpoint="https://rpc.atlantic-2.seinetwork.io" setVersion={setTestnetVersion} />
      <VersionFetcher chainId="arctic-1" rpcEndpoint="https://rpc-arctic-1.sei-apis.com" setVersion={setDevnetVersion} />

      <table className="version-table">
        <thead>
          <tr>
            <th>Network</th>
            <th>Version</th>
            <th>Chain ID</th>
            <th>Genesis URL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mainnet</td>
            <td>{mainnetVersion}</td>
            <td>pacific-1</td>
            <td><a href="https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json">Genesis</a></td>
          </tr>
          <tr>
            <td>Testnet</td>
            <td>{testnetVersion}</td>
            <td>atlantic-2</td>
            <td><a href="https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json">Genesis</a></td>
          </tr>
          <tr>
            <td>Devnet</td>
            <td>{devnetVersion}</td>
            <td>arctic-1</td>
            <td><a href="https://raw.githubusercontent.com/sei-protocol/testnet/main/arctic-1/genesis.json">Genesis</a></td>
          </tr>
        </tbody>
      </table>

      <style jsx>{`
        .version-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .version-table th, .version-table td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        .version-table th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #f2f2f2;
          color: black;
        }
        .version-table a {
          color: #0070f3;
          text-decoration: none;
        }
        .version-table a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default VersionTable;
