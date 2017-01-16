var isProd = process.env.NODE_ENV === 'production';

module.exports = {
    schema: isProd ? 'https' : 'http',
    base: isProd ? 'www.locdel.com/api' : 'http://localhost:8000/api',
    email: 'support@locdel.com',
    paymentSupportEmails: ['locdeltest@gmail.com'],
    engineeringSupport: ['locdeltest@gmail.com']
};