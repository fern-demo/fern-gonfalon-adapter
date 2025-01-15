import { ApplicationType } from './applicationType';
import { getGonfalonContext } from './getGonfalonContext';
import { GonfalonContext } from './types';

type UseGonfalonContextOptions = {
	application: ApplicationType;
	anonymous: boolean;
	enabled: boolean;
	env: Env;
	cookie: string | null;
};

export const useGonfalonContext = async ({ application, anonymous, enabled, env, cookie }: UseGonfalonContextOptions) => {
	let context: GonfalonContext | null = null;

	const fetchConfig = async () => {
		const response = await getGonfalonContext({ application, anonymous, env, cookie });
		if (response) {
			context = response;
		}
	};

	if (enabled) {
		await fetchConfig();
	} else {
		context = { kind: 'user', key: 'anonymous', anonymous: true, application };
	}

	return { context };
};
