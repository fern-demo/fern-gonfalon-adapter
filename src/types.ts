export type GonfalonAnonymousMultiContext = {
	kind: 'multi';
	session: object;
	user: object;
};

export type GonfalonAccountMultiContext = {
	kind: 'multi';
	account: object;
	environment: object;
	member: object;
	project: object;
	user: object;
};

export type GonfalonUserContext = {
	kind: 'user';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
};

export type GonfalonContext = GonfalonAnonymousMultiContext | GonfalonAccountMultiContext | GonfalonUserContext;
