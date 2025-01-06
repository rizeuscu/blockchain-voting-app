import { EnvironmentsEnum } from 'types';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqftnvcjlfvwpl5x0mwv58dn3k0t6dff8qd8ssugu57s';
export const API_URL = 'https://devnet-template-api.multiversx.com';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.devnet;
