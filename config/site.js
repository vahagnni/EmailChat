var isProd = process.env.NODE_ENV === 'production';

module.exports = {
    schema: 'http',
    base: 'http://localhost:8000/',
    email: 'emailchat@test.com',
    engineeringSupport: ['emailchat@gmail.com']
};