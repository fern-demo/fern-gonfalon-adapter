import { ApplicationType } from './applicationType';
import { GonfalonContext } from './types';
import { getBaseUrl } from './utils';

type InitGonfalonSecureModeOptions = {
	application: ApplicationType;
	context: GonfalonContext;
	env: Env;
};

export type SecureModeConfig = {
	secureModeHash: string | null;
	dogfoodContext: object | null;
};

export const initGonfalonSecureMode = async ({ application, context, env }: InitGonfalonSecureModeOptions): Promise<SecureModeConfig> => {
	const url = new URL(`${getBaseUrl(application, env)}/internal/docs/init`);
	const body = JSON.stringify(context);

	try {
		const res = await fetch(url, {
			method: 'POST',
			body,
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const json = await res.json();
		return json as SecureModeConfig;
	} catch (err) {
		return { secureModeHash: null, dogfoodContext: null };
	}
};
