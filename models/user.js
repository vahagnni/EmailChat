var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uuid = require('uuid'),
    crypto = require('crypto');

var CounterSchema = new Schema({
    _id: {type: String, required: true},
    seq: {type: Number, default: 0}
});

var counter = mongoose.model('counter', CounterSchema);

var UserSchema = new Schema({
    email: {
        type: 'String',
        required: true
    },
    password: {
        type: 'String',
        required: true
    },
    passwordSalt: {
        type: 'String'
    },
    fullName: {
        type: 'String'
    },
    billingAddress: {
        type: 'String'
    },
    city: {
        type: 'String'
    },
    state: {
        type: 'String'
    },
    zipCode: {
        type: 'String'
    },
    contactNumber: {
        type: 'String'
    },
    dateOfBirth: {
        type: 'Date'
    },
    created: {
        type: 'Date'
    }
});


UserSchema.methods = {
    generateSalt: function () {
        return uuid.v4();
    },
    createPasswordHash: function (password) {
        if (password === '' || typeof password !== 'string') {
            return null;
        }

        this.passwordSalt = this.generateSalt();

        var hash = this.encryptPassword(password);

        if (hash === '') {
            return null;
        }

        this.password = hash;

        return true;
    },
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.passwordSalt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.password;
    }
};

UserSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.passwordSalt;
        delete ret.files;

        return ret;
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
