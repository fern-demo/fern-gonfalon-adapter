import { LoginStatusType, LoginStatusTypes } from './loginStatusTypes';

type Account = {
	accountId: string;
};

type Member = {
	_id: string;
	email: string;
	firstName: string;
	lastName: string;
	creationDate: string;
	quickstartStatus: string;
	_lastSeen: string;
	isBeta: boolean;
};

export const fetchAccount = async (env: Env, cookie: string | null): Promise<LoginStatusType | undefined> => {
	const appUrl = env.GONFALON_URL + '/internal/account/session';
	const application = 'launchDarkly';
	try {
		const headers = new Headers();
		if (cookie) {
			headers.set('Cookie', cookie);
		}
		const result = await fetch(appUrl, {
			headers,
		});
		const account = (await result.json()) as Account;

		if (result.status === 200) {
			// only fetch member if account is logged in
			const user = await fetchMember(env, cookie);
			return {
				lastUpdated: Date.now(),
				userId: user?.userId,
				email: user?.email,
				firstName: user?.firstName,
				lastName: user?.lastName,
				accountId: account.accountId,
				status: LoginStatusTypes.LOGGED_IN,
				application,
				// creationDate: user?.creationDate,
				// quickstartStatus: user?.quickstartStatus,
				// lastSeen: user?.lastSeen,
				// isBeta: user?.isBeta,
			};
		}
	} catch (error) {
		return {
			lastUpdated: Date.now(),
			accountId: '',
			status: LoginStatusTypes.LOGGED_OUT,
			application,
		};
	}
	return {
		lastUpdated: Date.now(),
		accountId: '',
		status: LoginStatusTypes.LOGGED_OUT,
		application,
	};
};

const fetchMember = async (env: Env, cookie: string | null) => {
	const appUrl = env.GONFALON_URL + '/api/v2/members/me';
	try {
		const headers = new Headers();
		if (cookie) {
			headers.set('Cookie', cookie);
		}
		const result = await fetch(appUrl, {
			headers,
		});
		if (result.status === 200) {
			const member = (await result.json()) as Member;
			return {
				userId: member._id,
				email: member.email,
				firstName: member.firstName,
				lastName: member.lastName,
				creationDate: member.creationDate,
				quickstartStatus: member.quickstartStatus,
				lastSeen: member._lastSeen,
				isBeta: member.isBeta,
			};
		}
		return null;
	} catch (error) {
		return null;
	}
};
