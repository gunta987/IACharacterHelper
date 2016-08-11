define(['ko', 'lodash', 'jquery'], function (ko, _, $) {
    var card = function (properties, image) {
        var self = this;
        self.name = properties.name || '';
        self.image = image;
        self.onAdd = properties.onAdd;
        self.events = _.map(properties.events, function (event) {
            event.card = self;
            return event;
        });
        self.exhausted = ko.observable(false);
    };
    var ability = function (properties, isCore, image) {
        card.call(this, properties, image);
        this.isCoreAbility = isCore;
    };
    ability.prototype = Object.create(card.prototype);
    var armour = function (properties, image) {
        card.call(this, properties, image);
    };
    armour.prototype = Object.create(card.prototype);
    var weapon = function (properties, image) {
        card.call(this, properties, image);
    };
    weapon.prototype = Object.create(card.prototype);
    var equipment = function (properties, image) {
        card.call(this, properties, image);
    };
    equipment.prototype = Object.create(card.prototype);

    return {
        Operation: function (name, performOperation, canPerformOperation, cost) {
            var self = this;
            self.name = name;
            self.canPerformOperation = function (hero) {
                var otherRequirements = canPerformOperation || function (hero) { return true; };
                return _.every(cost || [], function (c) { return c.required(hero); }) && otherRequirements(hero);
            }
            self.performOperation = function (hero) {
                performOperation(hero);
                _(cost || []).forEach(function (c) { c.incur(hero); });
            }
        },
        Event: function (name, action) {
            var self = this;
            self.name = name;
            self.action = action;

            this.Execute = function (hero, event) {
                if (event === self.name) {
                    self.action(hero, self.card);
                }
            };
        },
        Card: card,
        Ability: ability,
        Armour: armour,
        Weapon: weapon,
        Equipment: equipment
    };
});