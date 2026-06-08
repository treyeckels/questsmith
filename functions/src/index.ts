import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

export { generateCampaignApi } from './generateCampaign';
export { generateScene } from './generateScene';
