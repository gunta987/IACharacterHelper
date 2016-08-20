define(['ko'], function (ko) {
    var Surge = function (apply, remove, images, text) {
        this.selected = ko.observable(false);
        this.images = images;
        this.text = text || '';
        this.Apply = function (conflict) { apply(conflict); };
        this.Remove = function (conflict) { remove(conflict); };
    };
    return {
        damage: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
                conflict.ExtraDamage(conflict.ExtraDamage() + count);
            }, function (conflict) {
                conflict.ExtraDamage(conflict.ExtraDamage() - count);
            }, _.fill(Array(count), 'Other/Damage.png'));
        },
        pierce: function (count) {
            count = count || 1;
            return new Surge(function(conflict) {
                    conflict.ExtraPierce(conflict.ExtraPierce() + count);
                },
                function(conflict) {
                    conflict.ExtraPierce(conflict.ExtraPierce() - count);
                },
                _.fill(Array(count), 'Other/Pierce.png'));
        },
        cleave: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
            }, function (conflict) {
            }, _.fill(Array(count), 'Other/Damage.png'), 'Cleave');
        },
        bleed: function () {
            return new Surge(function (conflict) {
                conflict.Bleed(conflict.Bleed() + 1);
            }, function (conflict) {
                conflict.Bleed(conflict.Bleed() - 1);
            }, ['Tokens/Bleed.png']);
        },
        stun: function () {
            return new Surge(function (conflict) {
                conflict.Stun(conflict.Stun() + 1);
            }, function (conflict) {
                conflict.Stun(conflict.Stun() - 1);
            }, ['Tokens/Stun.png']);
        },
        accuracy: function (count) {
            count = count || 1;
            return new Surge(function (conflict) {
                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + count);
            }, function (conflict) {
                conflict.ExtraAccuracy(conflict.ExtraAccuracy() - count);
            }, ['Other/' + count + '.png'], 'Accuracy');
        },
        regainStrain: function () {
            return new Surge(function (conflict) {
                conflict.RegainStrain(true);
            }, function (conflict) {
                conflict.RegainStrain(false);
            }, ['Tokens/strain.png'], 'Gain 1');
        }
    }
});