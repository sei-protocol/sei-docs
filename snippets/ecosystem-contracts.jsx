export const EcosystemContracts = () => {
	// --- Static data: inlined verbatim from ecosystem-contracts-data.ts ---
	const ECOSYSTEM_CONTRACTS_DATA = [
		{
			Protocol: 'Common',
			'Contract Address': '0xB952578f3520EE8Ea45b7914994dcf4702cEe578',
			'Contract Name': 'Permit2'
		},
		{
			Protocol: 'Common',
			'Contract Address': '0xcA11bde05977b3631167028862bE2a173976CA11',
			'Contract Name': 'Multicall3'
		},
		{
			Protocol: 'Common',
			'Contract Address': '0x0000000000FFe8B47B3e2130213B802212439497',
			'Contract Name': 'ImmutableCreate2Factory'
		},
		{
			Protocol: 'Common',
			'Contract Address': '0xce0042B868300000d44A59004Da54A005ffdcf9f',
			'Contract Name': 'SingletonFactory'
		},
		{
			Protocol: 'Common',
			'Contract Address': '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed',
			'Contract Name': 'CreateX'
		},
		{
			Protocol: 'Account Abstraction',
			'Contract Address': '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
			'Contract Name': 'EntryPoint v0.6.0'
		},
		{
			Protocol: 'Account Abstraction',
			'Contract Address': '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
			'Contract Name': 'EntryPoint v0.7.0'
		},
		{
			Protocol: 'Account Abstraction',
			'Contract Address': '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
			'Contract Name': 'EntryPoint v0.8.0 (+ EIP-7702)'
		},
		{
			Protocol: 'Account Abstraction',
			'Contract Address': '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
			'Contract Name': 'EntryPoint v0.9.0 (+ EIP-7702)'
		},
		{
			Protocol: 'Account Abstraction',
			'Contract Address': '0x0A630a99Df908A81115A3022927Be82f9299987e',
			'Contract Name': 'SenderCreator v0.9'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0x11da6463d6cb5a03411dbf5ab6f6bc3997ac7428',
			'Contract Name': 'SwapRouter02'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0x179d9a5592bc77050796f7be28058c51ca575df4',
			'Contract Name': 'DragonswapV2Factory'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7',
			'Contract Name': 'WSEI'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0x71f6b49ae1558357bbb5a6074f1143c46cbca03d',
			'Contract Name': 'DragonswapFactory'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0x150b4A3088dFB06d92531D1cCa6E980FB9a270e1',
			'Contract Name': 'Dragonswap DS ERC 20'
		},
		{
			Protocol: 'Saphyre',
			'Contract Address': '0xa4cf2f53d1195addde9e4d3aca54f556895712f2',
			'Contract Name': 'DragonswapRouter'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0xDe48600aA18Ae707f5D57e0FaafEC7C118ABaeb2',
			'Contract Name': 'FeeLibV1'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0x45d417612e177672958dc0537c45a8f8d754ac2e',
			'Contract Name': 'StargatePoolUSDC'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0x873cfB4bAe1Ab6A5DE753400e9d0616e10Dced22',
			'Contract Name': 'Treasurer'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0x0db9afb4c33be43a0a0e396fd1383b4ea97ab10a',
			'Contract Name': 'StargatePoolMigratable'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0x1502FA4be69d526124D453619276FacCab275d3D',
			'Contract Name': 'TokenMessaging'
		},
		{
			Protocol: 'Stargate',
			'Contract Address': '0x5c386D85b1B82FD9Db681b9176C8a4248bb6345B',
			'Contract Name': 'StargateOFT'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x8138da4417340594aeea4be8fbc7693d9875b6cb',
			'Contract Name': 'PoolAddressesProviderRegistry'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x5c57266688a4ad1d3ab61209ebcb967b84227642',
			'Contract Name': 'PoolAddressesProvider'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0xa1ce28cebab91d8df346d19970e4ee69a6989734',
			'Contract Name': 'AaveOracle'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x127201e84ad4ee06ec15104cf083696d6354f8dd',
			'Contract Name': 'PullRewardsTransferStrategy'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x4ec5e3f9a32aabd6af62b9a22188f429d65f39c7',
			'Contract Name': 'CollectorController'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0xbf63c919a8c15f4741e75c232c7be0d0af4d1d05',
			'Contract Name': 'InitializableAdminUpgradeabilityProxy'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x69ea2c310a950e58984f4bec4accf2ece391dafd',
			'Contract Name': 'EmissionManager'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0xd078c43f88fbed47b3ce16dc361606b594c8f305',
			'Contract Name': 'Pool'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x800f3e929686ec90eeaabb8b98ed1eff126d532c',
			'Contract Name': 'Collector'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x60c82a40c57736a9c692c42e87a8849fb407f0d6',
			'Contract Name': 'AaveProtocolDataProvider'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0xf8157786e3401a7377becb7af288b84c8ee614e1',
			'Contract Name': 'InitializableImmutableAdminUpgradeabilityProxy'
		},
		{
			Protocol: 'YEI',
			'Contract Address': '0x241995b768c1ae629eb5a6f3749c6e7b8c4d47f2',
			'Contract Name': 'ACLManager'
		},
		{
			Protocol: 'CarbonDeFi',
			'Contract Address': '0xe4816658ad10bF215053C533cceAe3f59e1f1087',
			'Contract Name': 'Carbon Controller'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x75FC67473A91335B5b8F8821277262a13B38c9b3',
			'Contract Name': 'v3 Core Factory'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xa683c66045ad16abb1bCE5ad46A64d95f9A25785',
			'Contract Name': 'Universal Router'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xB3309C48F8407651D918ca3Da4C45DE40109E641',
			'Contract Name': 'Proxy Admin'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xE3dbcD53f4Ce1b06Ab200f4912BD35672e68f1FA',
			'Contract Name': 'Tick Lens'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x454050C4c9190390981Ac4b8d5AFcd7aC65eEffa',
			'Contract Name': 'NFT Descriptor Library V1.3.0'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x38EB9e62ABe4d3F70C0e161971F29593b8aE29FF',
			'Contract Name': 'Nonfungible Token Position Descriptor V1.3.0'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x743E03cceB4af2efA3CC76838f6E8B50B63F184c',
			'Contract Name': 'Descriptor Proxy'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x8B3c541c30f9b29560f56B9E44b59718916B69EF',
			'Contract Name': 'Nonfungible Token Position Manager'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x6Aa54a43d7eEF5b239a18eed3Af4877f46522BCA',
			'Contract Name': 'v3 Migrator'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xaa52bB8110fE38D0d2d2AF0B85C3A3eE622CA455',
			'Contract Name': 'v3 Staker'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0x807F4E281B7A3B324825C64ca53c69F0b418dE40',
			'Contract Name': 'Quoter V2'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xdD489C75be1039ec7d843A6aC2Fd658350B067Cf',
			'Contract Name': 'Swap Router02'
		},
		{
			Protocol: 'oku.trade',
			'Contract Address': '0xA9d71E1dd7ca26F26e656E66d6AA81ed7f745bf0',
			'Contract Name': 'Limit order registry'
		},
		{
			Protocol: 'JellyVerse',
			'Contract Address': '0xfb43069f6d0473b85686a85f4ce4fc1fd8f00875',
			'Contract Name': 'Vault'
		},
		{
			Protocol: 'Takara Lend',
			'Contract Address': '0x56A171Acb1bBa46D4fdF21AfBE89377574B8D9BD',
			'Contract Name': 'Comptroller'
		},
		{
			Protocol: 'Takara Lend',
			'Contract Address': '0x71034bf5eC0FAd7aEE81a213403c8892F3d8CAeE',
			'Contract Name': 'Unitroller'
		},
		{
			Protocol: 'Takara Lend',
			'Contract Address': '0x323917A279B209754B32Ab57a817c64ECfE2AF40',
			'Contract Name': 'MarketState'
		},
		{
			Protocol: 'Takara Lend',
			'Contract Address': '0x68A92Be349d48766128C0Ae893Fc391859F9BC11',
			'Contract Name': 'MultiRewardDistributor'
		},
		{
			Protocol: 'Takara Lend',
			'Contract Address': '0x8DF1265bFb778fFD08341c63e7C67367c0a60288',
			'Contract Name': 'ProxyAdmin'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x5512D5E89a29447462Ab6BBBcbD3fe6F0A0D9FDd',
			'Contract Name': 'vaultOriginalAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x6944BfDAcD00957715eCBCeAac3F49e07cB6f35F',
			'Contract Name': 'vaultFactoryAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x7c96Bf5203fA1584A81f160B9445EAB02bfa3E7B',
			'Contract Name': 'tokenizedStrategyAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xE560fC83EA78028a95CCAb1ECD45039fFB62301C',
			'Contract Name': 'registryAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x43e60c59567996C5a1b27ca8719ADF6CA2bC407B',
			'Contract Name': 'releaseRegistryAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x79756b033390232a5A55B5D6571a7Bc1b11A2b93',
			'Contract Name': 'accountantAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x07428D1CdC20Ce70Ac5D06E44CCB9920F99ab447',
			'Contract Name': 'accountantFactoryAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x9CDdFFc79Ba597CCBBd6da6a81Cc1b1ef29FB4de',
			'Contract Name': 'keeperAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xed6A3CD7591Df25bC92E42381d9c53E041B5ACAa',
			'Contract Name': 'baseAprOracleAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xdF7F9020800c2B444ad524982Fc6cA5A30915811',
			'Contract Name': 'aaveStrategyAprOracleAddress'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x63E37028c1740303e8456962E6ddf98359FE0BDc',
			'Contract Name': 'vault-PITv1-AAVEv3-WSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x0044f5f3F121beB7ef11c6cfBc45a56e80adFd6B',
			'Contract Name': 'strategy-PITv1-AAVEv3-WSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x0f9BaCD61cf1fd9d038F41a8380dBd7A826470A7',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-WSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x1e3BcEb9AD3dc3f80820d29039C1A46e28d3A573',
			'Contract Name': 'vault-PITv1-AAVEv3-USDT-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x5E2BAF273586F747e406eB0fD0CAdAECe0f479Da',
			'Contract Name': 'strategy-PITv1-AAVEv3-USDT-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x3aEC64F4e285cFFD50605EB962455159d436d31B',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-USDT-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x575E2291C6FDe8eEf7284CBd7Ff17615de75c47B',
			'Contract Name': 'vault-PITv1-AAVEv3-USDC-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x1eB5B573852897831414Fbd607c214EdB9b0B7Dd',
			'Contract Name': 'strategy-PITv1-AAVEv3-USDC-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x318253deCE357Ef0f75428C7369A180D60FD0971',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-USDC-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x49561C4a905f7acCdaCAec5e3C17113d5f1C5a3b',
			'Contract Name': 'vault-PITv1-AAVEv3-iSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xA4A3B54665A5ef21ac5B294b8945Dd130aC6E5fc',
			'Contract Name': 'strategy-PITv1-AAVEv3-iSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x130c58f93cE57121c97F524CD5171BDd258f4314',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-iSEI-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xE8d7f53173BB5D0C898e4D576E4E297cB2859472',
			'Contract Name': 'vault-PITv1-AAVEv3-FRAX-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xCd6d59a116F0d4E370A62b8D6EA146dD02E2114A',
			'Contract Name': 'strategy-PITv1-AAVEv3-FRAX-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x9975f0d8560ed6a29C376ddc950f5663527327e8',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-FRAX-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0x0AEfC6F2E9a866ddB4813Cb1E897a2E9e26a1E53',
			'Contract Name': 'vault-PITv1-AAVEv3-WETH-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xE77790035f956E9C6E895e57cded63A7AC69F2c9',
			'Contract Name': 'strategy-PITv1-AAVEv3-WETH-LENDER-POOL'
		},
		{
			Protocol: 'Pit',
			'Contract Address': '0xb4169a0cD663FB4A7762a71c9d0Dd0ddc18201e2',
			'Contract Name': 'rewards-escrow-PITv1-AAVEv3-WETH-LENDER-POOL'
		},
		{
			Protocol: 'Symbiosis',
			'Contract Address': '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
			'Contract Name': 'Portal'
		},
		{
			Protocol: 'Filament Finance',
			'Contract Address': '0xB28EAb5253f6a0f8a5B0a1120d9C03Db8Fc10C2f',
			'Contract Name': 'DiamondProxy'
		},
		{
			Protocol: 'DonkeSwap',
			'Contract Address': '0x4B4746216214f9e972c5D35D3Fe88e6Ec4C28A6B',
			'Contract Name': 'DonkeV2Factory'
		},
		{
			Protocol: 'Sailor Finance',
			'Contract Address': '0xd1EFe48B71Acd98Db16FcB9E7152B086647Ef544',
			'Contract Name': 'SwapRouter'
		},
		{
			Protocol: 'Sailor Finance',
			'Contract Address': '0x4ed1F9Cc4ee6bc11b27e285464C4DCaF911c85d9',
			'Contract Name': 'NFTDescriptor'
		},
		{
			Protocol: 'Sailor Finance',
			'Contract Address': '0xA51136931fdd3875902618bF6B3abe38Ab2D703b',
			'Contract Name': 'UniswapV3Factory'
		},
		{
			Protocol: 'Sailor Finance',
			'Contract Address': '0x9aeB489F5bc0d3Eb7892DD7E1FAE2d2ebD02E80b',
			'Contract Name': 'Quoter'
		},
		{
			Protocol: 'Sailor Finance',
			'Contract Address': '0xE40703878aC5d3F76eAc66f8688A8F5652Af85b1',
			'Contract Name': 'QuoterV2'
		},
		{
			Protocol: 'Citrex',
			'Contract Address': '0x993543DC8BdFCba9fc7355d822108eF49dB6b9F9',
			'Contract Name': 'OrderDispatch'
		},
		{
			Protocol: 'Citrex',
			'Contract Address': '0x7461cFe1A4766146cAFce60F6907Ea657550670d',
			'Contract Name': 'Ciao'
		},
		{
			Protocol: 'Symphony',
			'Contract Address': '0xAD3DF981018149CD90e5869d14Efe2516b108270',
			'Contract Name': 'Symphony'
		},
		{
			Protocol: 'Open Ocean',
			'Contract Address': '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
			'Contract Name': 'OpenOceanExchangeProxy'
		},
		{
			Protocol: 'DZap',
			'Contract Address': '0xb3926deF2e0989B0700a57034C9A211bfBcF858B',
			'Contract Name': 'DZapDiamond'
		},
		{
			Protocol: 'OKX Dex',
			'Contract Address': '0x411d2C093e4c2e69Bf0D8E94be1bF13DaDD879c6',
			'Contract Name': 'DexRouter'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0xc9cDAc20FCeAAF616f7EB0bb6Cd2c69dcfa9094c',
			'Contract Name': 'Morpho'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x6eFA8e3Aa8279eB2fd46b6083A9E52dA72EA56c4',
			'Contract Name': 'Adaptive Curve Irm'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x4bD68c2FF3274207EC07ED281C915758b6F23F07',
			'Contract Name': 'Morpho ChainlinkOracleV2 Factory'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x8Dea49ec5bd5AeAc8bcf96B3E187F59354118291',
			'Contract Name': 'MetaMorpho Factory V1.1'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0xD878509446bE2C601f0f032F501851001B159D6B',
			'Contract Name': 'Public Allocator'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x65eD61058cEB4895B7d62437BaCEA39b04f6D27B',
			'Contract Name': 'PreLiquidation Factory'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0xF9457356F18A3349Bb317Ac144c3Bcc62e5761aD',
			'Contract Name': 'Bundler3'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x02e0e71e145f254820B9D89c9E6068f08256F601',
			'Contract Name': 'GeneralAdapter1'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x30f5b078c80bd06fedc3b40b4a4441a96dd9cf22',
			'Contract Name': 'VaultV2Factory'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0xbADd49F7db90f65fF5822681AA6B8548E8356a1D',
			'Contract Name': 'MorphoMarketV1AdapterV2Factory'
		},
		{
			Protocol: 'Morpho',
			'Contract Address': '0x26abEaee65A878E9Fe8F99fEb31aec62fbA2624E',
			'Contract Name': 'MorphoRegistry'
		},
		{
			Protocol: 'LayerZero',
			'Contract Address': '0x1a44076050125825900e736c501f859c50fE728c',
			'Contract Name': 'EndpointV2'
		},
		{
			Protocol: 'Circle CCTP',
			'Contract Address': '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
			'Contract Name': 'TokenMessengerV2'
		},
		{
			Protocol: 'Circle CCTP',
			'Contract Address': '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
			'Contract Name': 'MessageTransmitterV2'
		},
		{
			Protocol: 'Circle CCTP',
			'Contract Address': '0xfd78EE919681417d192449715b2594ab58f5D002',
			'Contract Name': 'TokenMinterV2'
		},
		{
			Protocol: 'Tokens',
			'Contract Address': '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
			'Contract Name': 'USDC'
		},
		{
			Protocol: 'Tokens',
			'Contract Address': '0x9151434b16b9763660705744891fA906F660EcC5',
			'Contract Name': 'USDT0'
		},
		{
			Protocol: 'Tokens',
			'Contract Address': '0x54cD901491AeF397084453F4372B93c33260e2A6',
			'Contract Name': 'USDY (Ondo)'
		},
		{
			Protocol: 'Splashing',
			'Contract Address': '0xC257361320F4514D91c05F461006CE6a0300E2d2',
			'Contract Name': 'spSEI Token'
		},
		{
			Protocol: 'Splashing',
			'Contract Address': '0x151669B501b561a52ad95574603AD52546F46Bf4',
			'Contract Name': 'Staking Pool (Proxy)'
		},
		{
			Protocol: 'Pyth',
			'Contract Address': '0x6dd1f8257e1fb3ef75f8d6aafae608b42cfc1270',
			'Contract Name': 'Pyth Oracle'
		},
		{
			Protocol: 'Chainlink',
			'Contract Address': '0x60fAa7faC949aF392DFc858F5d97E3EEfa07E9EB',
			'Contract Name': 'VerifierProxy'
		},
		{
			Protocol: 'Safe',
			'Contract Address': '0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7',
			'Contract Name': 'SafeSingletonFactory'
		}
	];

	const nameKey = 'Contract Name';
	const addressKey = 'Contract Address';

	// --- Dark mode detection (Mintlify toggles a `dark` class on <html>) ---
	const [isDark, setIsDark] = useState(false);
	useEffect(() => {
		const el = document.documentElement;
		const update = () => setIsDark(el.classList.contains('dark'));
		update();
		const obs = new MutationObserver(update);
		obs.observe(el, { attributes: true, attributeFilter: ['class'] });
		return () => obs.disconnect();
	}, []);

	// --- Group rows by Protocol (preserved from index.tsx) ---
	const groupedData = useMemo(() => {
		const groups = {};
		for (const row of ECOSYSTEM_CONTRACTS_DATA) {
			const key = row.Protocol;
			if (!groups[key]) groups[key] = [];
			groups[key].push(row);
		}
		return Object.entries(groups).map(([projectName, contracts]) => ({
			projectName,
			contracts,
			contractCount: contracts.length
		}));
	}, []);

	const [query, setQuery] = useState('');
	const [openSections, setOpenSections] = useState({});
	// Base id of the latest search hit. The scroll runs in the effect below —
	// after React commits this state — so the target row has already left its
	// `hidden` (display:none) section and getBoundingClientRect is accurate.
	const [pendingScrollId, setPendingScrollId] = useState(null);

	const slugify = (value) => {
		return String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	const toggleSection = (projectName) => {
		setOpenSections((prev) => ({ ...prev, [projectName]: !prev[projectName] }));
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		const q = query.trim().toLowerCase();
		if (!q) return;

		for (const group of groupedData) {
			for (const contract of group.contracts) {
				const name = String(contract[nameKey] || '').toLowerCase();
				const address = String(contract[addressKey] || '').toLowerCase();
				if (name.includes(q) || address.includes(q)) {
					const baseId = `contract-${slugify(group.projectName)}-${address}`;
					// Open the matching section and defer the scroll: the effect
					// below runs it once React has committed the open state and the
					// row is no longer inside a `hidden` (display:none) section.
					setOpenSections((prev) => ({ ...prev, [group.projectName]: true }));
					setPendingScrollId(baseId);
					return;
				}
			}
		}
	};

	useEffect(() => {
		if (!pendingScrollId) return;
		const baseId = pendingScrollId;
		// Clear immediately so unrelated re-renders never re-trigger the scroll.
		setPendingScrollId(null);

		const el =
			[`${baseId}-desktop`, `${baseId}-mobile`]
				.map((cid) => document.getElementById(cid))
				.find((node) => node && node.offsetParent !== null) ||
			document.getElementById(`${baseId}-desktop`) ||
			document.getElementById(`${baseId}-mobile`);
		if (!el) return;

		// Center the element in the viewport for better visibility.
		const rect = el.getBoundingClientRect();
		const currentScrollY = window.scrollY || window.pageYOffset;
		const absoluteTop = rect.top + currentScrollY;
		const viewportHeight = window.innerHeight;
		const targetTop = absoluteTop - Math.max(0, (viewportHeight - rect.height) / 2);

		const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - viewportHeight);
		const clampedTop = Math.min(Math.max(0, targetTop), maxScroll);

		window.scrollTo({ top: clampedTop, behavior: 'smooth' });
	}, [pendingScrollId]);

	// --- Theme-aware brand colors (replace former sei-* Tailwind classes) ---
	// Light/dark text + background for the SeiScan link button.
	const seiScanStyle = isDark
		? { color: 'var(--sei-maroon-25)', backgroundColor: 'rgba(96, 0, 20, 0.2)' }
		: { color: 'var(--sei-maroon-100)', backgroundColor: 'var(--sei-grey-25)' };

	const focusRingColor = 'var(--sei-maroon-100)';

	// Desktop rows use a div-based grid (not a <table>): Mintlify maps MDX
	// <table> to a wrapper with a negative `var(--page-padding)` margin that,
	// inside this card's overflow-hidden box, clipped the first column. An inline
	// grid template also avoids relying on Tailwind's JIT for an arbitrary value.
	const rowGridStyle = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)' };

	// --- SeiScan link (nested component) handles its own hover state ---
	const SeiScanLink = ({ address }) => {
		const [hover, setHover] = useState(false);

		const baseStyle = isDark
			? {
					color: hover ? 'var(--sei-cream)' : 'var(--sei-maroon-25)',
					backgroundColor: hover ? 'rgba(96, 0, 20, 0.3)' : 'rgba(96, 0, 20, 0.2)'
			  }
			: {
					color: hover ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)',
					backgroundColor: hover ? 'var(--sei-grey-30)' : 'var(--sei-grey-25)'
			  };

		return (
			<a
				href={`https://seiscan.io/address/${address}`}
				target='_blank'
				rel='noopener noreferrer'
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				style={{ ...baseStyle, transition: 'colors 0.15s ease' }}
				className='text-xs px-2 py-1 transition-colors no-underline'>
				SeiScan ↗
			</a>
		);
	};

	if (groupedData.length === 0) {
		return (
			<div className='my-4 p-4 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm'>
				No contract data available.
			</div>
		);
	}

	// --- Search button hover (replaces hover:bg-sei-maroon-200) ---
	const SearchButton = () => {
		const [hover, setHover] = useState(false);
		return (
			<button
				type='submit'
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				style={{ backgroundColor: hover ? 'var(--sei-maroon-200)' : 'var(--sei-maroon-100)' }}
				className='px-3 py-2 text-white text-sm transition-colors focus:outline-none'>
				Search
			</button>
		);
	};

	return (
		<div className='my-6'>
			<div className='sheet-content'>
				<div className='space-y-4'>
					<form onSubmit={handleSearchSubmit} className='flex gap-2 items-center'>
						<input
							type='text'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Search by contract name or address'
							aria-label='Search by contract name or address'
							autoComplete='off'
							onFocus={(e) => {
								e.target.style.borderColor = focusRingColor;
								e.target.style.boxShadow = `0 0 0 2px rgba(96, 0, 20, 0.25)`;
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '';
								e.target.style.boxShadow = '';
							}}
							className='w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:!bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none transition-colors'
						/>
						<SearchButton />
					</form>

					<div className='w-full space-y-3'>
						{groupedData.map((group) => {
							const isOpen = !!openSections[group.projectName];
							const sectionId = `section-${slugify(group.projectName)}`;
							return (
								<div key={group.projectName} className='border border-neutral-200 dark:border-neutral-800 overflow-hidden'>
									<button
										type='button'
										onClick={() => toggleSection(group.projectName)}
										className='w-full flex items-center justify-between px-4 py-3 bg-white dark:!bg-neutral-900 hover:bg-neutral-50 dark:hover:!bg-neutral-800 transition-colors'
										aria-expanded={isOpen}
										aria-controls={sectionId}>
										<span className='flex items-center gap-3 text-left'>
											<span className='text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100'>{group.projectName}</span>
											<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full'>
												{group.contractCount} contract{group.contractCount !== 1 ? 's' : ''}
											</span>
										</span>
										<span className={`ml-4 inline-block transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden='true'>
											<svg width='16' height='16' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' className='text-neutral-600 dark:text-neutral-300'>
												<path d='M5 8l5 5 5-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
											</svg>
										</span>
									</button>
									<section id={sectionId} className={`${isOpen ? 'block' : 'hidden'}`}>
										<div className='p-4 space-y-4'>
												{/* Desktop view — a div grid (not a <table>): Mintlify maps MDX
											    <table> to a wrapper with a negative var(--page-padding) margin
											    that this card's overflow-hidden clipped, shifting the first
											    column off the left edge. */}
											<div className='hidden sm:block border border-gray-200 dark:border-gray-700'>
												<div role='table' className='w-full text-sm'>
													<div role='row' style={rowGridStyle} className='bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
														<div role='columnheader' className='px-4 py-3 text-left font-semibold text-gray-900 dark:text-white'>
															Contract Name
														</div>
														<div role='columnheader' className='px-4 py-3 text-left font-semibold text-gray-900 dark:text-white'>
															Contract Address
														</div>
													</div>
													{group.contracts.map((contract, contractIndex) => {
														const addr = String(contract[addressKey] || '').toLowerCase();
														const id = `contract-${slugify(group.projectName)}-${addr}`;
														return (
															<div
																role='row'
																key={contractIndex}
																id={`${id}-desktop`}
																style={rowGridStyle}
																className='border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors'>
																<div role='cell' className='px-4 py-3 text-gray-900 dark:text-white font-medium break-words'>
																	{contract[nameKey] || 'Unnamed Contract'}
																</div>
																<div role='cell' className='px-4 py-3'>
																	<div className='flex items-center gap-2 min-w-0'>
																		<code
																			className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all'
																			style={{ fontFamily: 'var(--sei-font-mono)' }}>
																			{contract[addressKey]}
																		</code>
																		<SeiScanLink address={contract[addressKey]} />
																	</div>
																</div>
															</div>
														);
													})}
												</div>
											</div>

											{/* Mobile card view */}
											<div className='block sm:hidden space-y-3'>
												{group.contracts.map((contract, contractIndex) => {
													const addr = String(contract[addressKey] || '').toLowerCase();
													const id = `contract-${slugify(group.projectName)}-${addr}`;
													return (
														<div key={contractIndex} id={`${id}-mobile`} className='border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800'>
															<div className='space-y-2'>
																<div>
																	<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Name</span>
																	<span className='text-sm font-medium text-gray-900 dark:text-white'>{contract[nameKey] || 'Unnamed Contract'}</span>
																</div>
																<div>
																	<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Address</span>
																	<div className='flex items-center gap-2'>
																		<code
																			className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all'
																			style={{ fontFamily: 'var(--sei-font-mono)' }}>
																			{contract[addressKey]}
																		</code>
																		<SeiScanLink address={contract[addressKey]} />
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										</div>
									</section>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
