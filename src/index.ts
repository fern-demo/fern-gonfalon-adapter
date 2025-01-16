import { ApplicationType } from './applicationType';
import { useGonfalonContext } from './useGonfalonContext';
import { appendPropertiesToUserContext, isCommercialLoggedInUser, isEU, isFederal } from './utils';
import { useInitGonfalonSecureMode } from './useInitGonfalonSecureMode';
import { fetchAccount } from './loginUtils';

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: accessControlHeaders(new Headers(), request.headers.get('Origin')),
			});
		}

		if (request.method !== 'GET') {
			return new Response('Method not allowed', { status: 405 });
		}

		const { searchParams } = new URL(request.url);
		const application = versionToApplication(searchParams.get('version'));

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

		const responseHeaders = new Headers();
		responseHeaders.set('Content-Type', 'application/json');
		if (config?.secureModeHash) {
			responseHeaders.set('X-Secure-Mode-Hash', config.secureModeHash);
		}

		accessControlHeaders(responseHeaders, request.headers.get('Origin'));

		return new Response(JSON.stringify(context), {
			headers: responseHeaders,
		});
	},
} satisfies ExportedHandler<Env>;

function versionToApplication(version: string | null): ApplicationType {
	if (version === 'Federal docs') {
		return 'federal';
	}

	if (version === 'EU docs') {
		return 'eu';
	}

	return 'launchDarkly';
}

function accessControlHeaders(responseHeaders: Headers = new Headers(), origin: string | null): Headers {
	responseHeaders.set('Access-Control-Allow-Origin', origin ?? '*');
	responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
	responseHeaders.set('Access-Control-Allow-Headers', 'Authorization, Cookie');
	responseHeaders.set('Access-Control-Expose-Headers', 'X-Secure-Mode-Hash');
	responseHeaders.set('Access-Control-Allow-Credentials', 'true');
	return responseHeaders;
}
