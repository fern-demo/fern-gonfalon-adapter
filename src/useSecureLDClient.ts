import { ApplicationType } from './applicationType';
import { SecureModeConfig } from './initGonfalonSecureMode';
import { fetchAccount } from './loginUtils';
import { GonfalonContext } from './types';
import { useGonfalonContext } from './useGonfalonContext';
import { useInitGonfalonSecureMode } from './useInitGonfalonSecureMode';
import { isCommercialLoggedInUser, isFederal, isEU, appendPropertiesToUserContext } from './utils';

export async function useSecureLDClient(
	application: ApplicationType,
	request: Request,
	env: Env
): Promise<{
	context: GonfalonContext | null;
	config: SecureModeConfig | null;
}> {
	const enableGonfalonLogin = env.ENABLE_GONFALON_LOGIN === 'true';

	const { context: gonfalonContext } = await useGonfalonContext({
		application,
		enabled: enableGonfalonLogin,
		env,
		cookie: request.headers.get('Cookie'),
	});

	const properties: Record<string, string> = {
		application,
	};

	const loginStatus = await fetchAccount(env, request.headers.get('Cookie'));

	if (isCommercialLoggedInUser(application, loginStatus) && loginStatus?.userId) {
		// for backwards compatibility with existing rule
		properties.userId = loginStatus.userId; // the memberId
	}

	if (isFederal(application)) {
		// for backwards compatibility with existing rule
		properties.key = 'fed_anonymous';
	}

	if (isEU(application)) {
		// for backwards compatibility with existing rule
		properties.key = 'eu_anonymous';
	}

	const context = appendPropertiesToUserContext(gonfalonContext, properties);

	const { config } = await useInitGonfalonSecureMode({
		application,
		context: context!,
		enabled: !!context,
		env,
	});

	return { context, config };
}
