// Public EmailJS client/IDs (from EmailJS dashboard; not server secrets). Used for local
// and static preview. The deploy workflow overwrites this file on gh-pages with GitHub
// Action secrets (same shape) for production.
window.ENV_CONFIG = {
  emailjsUserId: 'zRYVGu1o6DDmrdc4f',
  emailjsServiceId: 'service_ju06a1p',
  emailjsTemplateId: 'template_925ze9i',
  // Optional: Set the same value as Vercel SUBSCRIBERS_API_KEY so admin can GET/POST /subscribers* when the API requires Bearer auth
  subscribersApiKey: '',
};
