import { ApplicationType } from './applicationType';
import { GonfalonContext } from './types';
import { getBaseUrl } from './utils';

type GetGonfalonContextOptions = {
	application: ApplicationType;
	anonymous: boolean;
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

export const getGonfalonContext = async ({ anonymous, application, env, cookie }: GetGonfalonContextOptions): Promise<GonfalonContext> => {
	const url = getUrl(anonymous, application, env);

	try {
		const headers = new Headers();
		if (!anonymous && cookie) {
			headers.set('Cookie', cookie);
		}
		const res = await fetch(url, {
			headers,
		});
		const json = await res.json();
		return json as GonfalonContext;
	} catch (err) {
		return {} as GonfalonContext;
	}
};
