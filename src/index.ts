import { ApplicationType } from './applicationType';
import { useInitGonfalonSecureMode } from './useInitGonfalonSecureMode';
import { useSecureLDClient } from './useSecureLDClient';

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return preflight(request);
		}

		if (request.method !== 'GET') {
			return methodNotAllowed();
		}

		// adapt the fern docs version into an application type
		const { searchParams } = new URL(request.url);
		const application = versionToApplication(searchParams.get('version'));

		// get the gonfalon context and secure mode config
		const { context, config } = await useSecureLDClient(application, request, env);

		// add the secure mode hash to the response headers
		const responseHeaders = new Headers();
		responseHeaders.set('Content-Type', 'application/json');
		if (config?.secureModeHash) {
			responseHeaders.set('X-Secure-Mode-Hash', config.secureModeHash);
		}

		// TODO: what should we do with the dogfood context?

		// allow cross-origin requests
		// TODO: this should be updated with a strict allowlist of origins
		accessControlHeaders(responseHeaders, request.headers.get('Origin'));

		// return the response
		return new Response(JSON.stringify(context), { headers: responseHeaders });
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

function methodNotAllowed(): Response {
	return new Response('Method not allowed', { status: 405 });
}

function preflight(request: Request): Response {
	const headers = accessControlHeaders(new Headers(), request.headers.get('Origin'));
	return new Response(null, { headers });
}
