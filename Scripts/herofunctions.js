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
        self.operations = properties.operations;
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
        var self = this;
        card.call(this, properties, image);
        self.slots = ko.observable(properties.slots || 0);
        self.ranged = properties.ranged || false;
        self.reach = properties.reach || false;
        self.type = properties.type || [];
        self.dice = function () { return _.map(properties.dice, function (die) { return die(); }); };
        self.attachments = ko.observable([]);
        var zeroFunction = function () { return 0; };
        self.pierce = ko.pureComputed(function () {
            return 3;
            return (properties.pierce || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.pierce || zeroFunction)(self);
            }, 0);
        });
        self.accuracy = ko.pureComputed(function () {
            return 5;
            return (properties.accuracy || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.accuracy || zeroFunction)();
            }, 0);
        });
        self.damage = ko.pureComputed(function () {
            return 2;
            return (properties.damage || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.damage || zeroFunction)();
            }, 0);
        });
    };
    weapon.prototype = Object.create(card.prototype);
    var attachment = function (properties, image) {
        card.call(this, properties, image);
        this.pierce = properties.pierce;
        this.accuracy = properties.accuracy;
        this.damage = properties.damage;
    };
    attachment.prototype = Object.create(card.prototype);
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
            self.operationImages = ko.observable(_.flatMap(cost || [], 'images'))
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
        Attachment: attachment,
        Equipment: equipment
    };
});