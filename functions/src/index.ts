import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

export { generateCampaignApi } from './generateCampaign';
export { generateCombatNarration } from './generateCombatNarration';
export { generateItemReward } from './generateItemReward';
export { generateScene } from './generateScene';
