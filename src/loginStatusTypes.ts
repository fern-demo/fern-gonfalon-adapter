import { ApplicationType } from './applicationType';

export enum LoginStatusTypes {
	LOGGED_IN = 'loggedIn',
	LOGGED_OUT = 'loggedOut',
}

export type LoginStatusType = {
	lastUpdated: number;
	accountId?: string;
	userId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	application?: ApplicationType;
	status: LoginStatusTypes.LOGGED_IN | LoginStatusTypes.LOGGED_OUT;
};
