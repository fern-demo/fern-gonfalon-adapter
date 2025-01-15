import { ApplicationType } from './applicationType';
import { initGonfalonSecureMode, SecureModeConfig } from './initGonfalonSecureMode';
import { GonfalonContext } from './types';

type UseInitGonfalonSecureModeOptions = {
	application: ApplicationType;
	context: GonfalonContext;
	enabled?: boolean;
	env: Env;
};

export const useInitGonfalonSecureMode = async ({
	application,
	context,
	enabled,
	env,
}: UseInitGonfalonSecureModeOptions): Promise<{ config: SecureModeConfig | null }> => {
	let config: SecureModeConfig | null = null;

	const fetchConfig = async () => {
		const response = await initGonfalonSecureMode({ application, context, env });
		if (response && response.secureModeHash && response.dogfoodContext) {
			config = { secureModeHash: response.secureModeHash, dogfoodContext: response.dogfoodContext };
		}
	};

	if (enabled) {
		await fetchConfig();
	}

	return { config };
};
