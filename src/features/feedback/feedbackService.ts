import { trackFeedbackFormOpened } from '../analytics/analyticsService';
import { FEEDBACK_FORM_URL } from '../../shared/constants/feedbackForm';

export function openFeedbackForm(): void {
    window.open(FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer');
    trackFeedbackFormOpened();
}
