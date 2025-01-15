import { ApplicationType } from './applicationType';
import { GonfalonContext } from './types';
import { getBaseUrl } from './utils';

type GetGonfalonContextOptions = {
	application: ApplicationType;
	env: Env;
	cookie: string | null;
};

const getUrl = (anonymous: boolean, application: ApplicationType, env: Env) => {
	const base = getBaseUrl(application, env);

	if (anonymous) {
		return new URL(`${base}/internal/docs/context/anonymous`);
	}

	return new URL(`${base}/internal/docs/context/authenticated`);
};

export const getGonfalonContext = async ({ application, env, cookie }: GetGonfalonContextOptions): Promise<GonfalonContext> => {
	const authUrl = getUrl(false, application, env);
	const anonUrl = getUrl(true, application, env);

	try {
		const headers = new Headers();
		if (cookie) {
			headers.set('Cookie', cookie);
		}
		let res = await fetch(cookie ? authUrl : anonUrl, { headers });
		if (!res.ok) {
			res = await fetch(anonUrl, { headers });
		}
		const json = await res.json();
		return json as GonfalonContext;
	} catch (err) {
		return {} as GonfalonContext;
	}
};
