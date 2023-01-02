'use strict'
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

class StaticVariable {

    static days(){

        const Days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ]

        return Days

    }

    static generateSimpleEncryption(stringData) {
        const bufferString = Buffer.from(stringData);
        try {
            return bufferString.toString('base64');
        } catch (e) {
            return false;
        }
    }

    static generateSimpleDecryption(stringData) {
        const bufferString = Buffer.from(stringData, 'base64');
        try {
            return bufferString.toString('utf-8');
        } catch (e) {
            return false;
        }
    }

    static encrypt(text) {
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        };

    }

    static decrypt(hash) {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

        return decrpyted.toString();

    }

    static randomNumbers(min = 7492740382, max = 9859184930){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static checkUuid(value){
        if (!value) {
            return false
        }

        if(/^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(value) == false){
            return false
        }

        return true
    }
}

module.exports = StaticVariable
