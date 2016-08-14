define(['conflict', 'ko'], function (conflict, ko) {
    var Surge = function (apply, images, text) {
        this.selected = ko.observable(false);
        this.images = images;
        this.Execute = function () { apply() };
    };
    return {
        damage: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
                conflict.ExtraDamage(conflict.ExtraDamage() + count);
            }, _.fill(Array(count), 'Other/Damage.png'));
        },
        cleave: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
            }, _.fill(Array(count), 'Other/Damage.png'), 'Cleave');
        },
        bleed: function () {
            return new Surge(function (conflict) {
                conflict.Bleed(true);
            }, ['Tokens/Bleed.png']);
        },
        stun: function () {
            return new Surge(function (conflict) {
                conflict.Stun(true);
            }, ['Tokens/Stun.png']);
        },
        accuracy: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + count);
            }, ['Other/' + count + '.png'], 'Accuracy');
        }
    }
});