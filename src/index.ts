import { LoginStatusTypes } from './loginStatusTypes';
import { ApplicationType } from './applicationType';
import { LoginStatusType } from './loginStatusTypes';
import { useGonfalonContext } from './useGonfalonContext';
import { appendPropertiesToUserContext, getBaseUrl } from './utils';
import { useInitGonfalonSecureMode } from './useInitGonfalonSecureMode';
import { fetchAccount } from './loginUtils';

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const application = versionToApplication(searchParams.get('version'));
		const anonymous = searchParams.get('anonymous') !== 'false';

		const enableGonfalonLogin = env.ENABLE_GONFALON_LOGIN === 'true';

		const { context: gonfalonContext } = await useGonfalonContext({
			application,
			anonymous,
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

		const responseHeaders = new Headers();
		if (config?.secureModeHash) {
			responseHeaders.set('X-Secure-Mode-Hash', config.secureModeHash);
		}

		return new Response(JSON.stringify(context), {
			headers: responseHeaders,
		});
	},
} satisfies ExportedHandler<Env>;

function versionToApplication(version: string | null): ApplicationType {
	if (version === 'fed-docs') {
		return 'federal';
	}

	if (version === 'eu-docs') {
		return 'eu';
	}

	return 'launchDarkly';
}

const isFederal = (site?: ApplicationType) => {
	return site === 'federal';
};

const isEU = (site?: ApplicationType) => {
	return site === 'eu';
};

const isCommercialLoggedInUser = (site: ApplicationType, loginStatus?: LoginStatusType) => {
	return loginStatus?.accountId && !isFederal(site);
};

const isAnonymous = (site: ApplicationType, loginStatus?: LoginStatusType) => {
	return !isCommercialLoggedInUser(site, loginStatus) && !isFederal(site) && !isLoggedIn(loginStatus);
};

const isLoggedIn = (loginStatus?: LoginStatusType) => loginStatus?.status === LoginStatusTypes.LOGGED_IN;
