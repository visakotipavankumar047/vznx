import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**'],
  },
];

export default config;
