module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
	collectCoverageFrom: ['scripts/**/*.js', '!scripts/__tests__/**', '!**/node_modules/**'],
	setupFilesAfterEnv: [],
	verbose: true,
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true
};
