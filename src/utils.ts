import { ApplicationType } from './applicationType';
import { GonfalonAnonymousMultiContext, GonfalonContext } from './types';

export const getBaseUrl = (application: ApplicationType, env: Env) => {
	switch (application) {
		case 'federal': // use anon for fed
		default:
			return env.GONFALON_URL;
	}
};

export const isGonfalonAnonMultiContext = (context: GonfalonContext): context is GonfalonAnonymousMultiContext => {
	return 'session' in context;
};

export const isGonfalonAcctMultiContext = (context: GonfalonContext): context is GonfalonAnonymousMultiContext => {
	return context.kind === 'multi' && 'account' in context;
};

export const isGonfalonUserContext = (context: GonfalonContext): context is GonfalonAnonymousMultiContext => {
	return context.kind === 'user';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const appendPropertiesToUserContext = (context: GonfalonContext | null, properties: Record<string, any>) => {
	if (!context) {
		return context;
	}

	if (isGonfalonAnonMultiContext(context) || isGonfalonAcctMultiContext(context)) {
		return {
			...context,
			user: {
				...context.user,
				...properties,
			},
		};
	}

	if (isGonfalonUserContext(context)) {
		return {
			...context,
			...properties,
		};
	}

	return context;
};
