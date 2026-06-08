import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

export { generateCampaign } from './generateCampaign';
