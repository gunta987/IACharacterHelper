define(['ko', 'lodash', 'jquery', 'constants', 'surge'], function (ko, _, $, $C, s) {
    var Operation = function (name, performOperation, canPerformOperation, cost, conflictStage, text) {
        var self = this;
        self.name = name;
        self.conflictStage = conflictStage;
        self.canPerformOperation = function (hero, conflict) {
            var otherRequirements = canPerformOperation || function () { return true; };
            return _.every(cost || [], function (c) { return c.required(hero, conflict); }) && otherRequirements(hero, conflict, self.card);
        }
        self.performOperation = function (hero, conflict) {
            performOperation(hero, conflict, self.card);
            _(cost || []).forEach(function (c) { c.incur(hero, conflict); });
            hero.event(self.name);
        }
        self.operationImages = ko.observableArray(_.flatMap(cost || [], 'images'));
        self.text = text;
    };

    var card = function (properties, image) {
        var self = this;
        self.name = properties.name || '';
        self.image = image;
        self.onAdd = properties.onAdd;
        self.events = _.map(properties.events, function (event) {
            event.card = self;
            return event;
        });
        self.operations = _.map(properties.operations, function (operation) {
            operation.card = self;
            return operation;
        }); 
        self.exhausted = ko.observable(false);
    };
    var ability = function (properties, isCore, image) {
        var self = this;
        card.call(self, properties, image);
        self.isCoreAbility = isCore;
        self.isExternal = properties.isExternal || false;
        self.owner = properties.owner || '';
        self.eventOperations = _.map(properties.eventOperations, function (eventOperation) {
            eventOperation.operation.card = self;
            return eventOperation;
        });
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
        self.attachments = ko.observableArray([]);
        self.SlotsAvailable = ko.pureComputed(function() {
            return self.slots() > self.attachments().length;
        });
        var zeroFunction = function () { return 0; };
        self.pierce = ko.pureComputed(function () {
            return (properties.pierce || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.pierce || zeroFunction)(self);
            }, 0);
        });
        self.accuracy = ko.pureComputed(function () {
            return (properties.accuracy || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.accuracy || zeroFunction)(self);
            }, 0);
        });
        self.damage = ko.pureComputed(function () {
            return (properties.damage || 0) + _.reduce(self.attachments(), function (sum, attachment) {
                return sum + (attachment.damage || zeroFunction)(self);
            }, 0);
        });
        self.surges = ko.pureComputed(function () {
            return _.concat([[s.regainStrain()]], (properties.surges || []), _.flatMap(self.attachments(), 'surges'));
        });
        self.surgeOperations = ko.pureComputed(function () {
            return _.flatMap(self.surges(), function (arr) {
                var selectSurge = new Operation('Select Surge',
                        function (hero, conflict) {
                            selectSurge.selected(true);
                            conflict.SelectedSurges.push(selectSurge);
                            _(arr).forEach(function (surge) {
                                surge.Apply(conflict);
                            });
                        },
                        function (hero, conflict) {
                            return !selectSurge.selected() && conflict.MyAttack.surges() > 0;
                        },
                        [],
                        $C.ATTACKROLL, _.compact(_.map(arr, 'text')).join(' '));
                selectSurge.operationImages(_.flatMap(arr, 'images'));
                var deselectSurge = new Operation('Deselect Surge',
                        function (hero, conflict) {
                            selectSurge.selected(false);
                            conflict.SelectedSurges.remove(selectSurge);
                            _(arr).forEach(function (surge) {
                                surge.Remove(conflict);
                            });
                        },
                        function (hero) {
                            return selectSurge.selected();
                        },
                        [],
                        $C.ATTACKROLL, _.compact(_.map(arr, 'text')).join(' '));
                deselectSurge.operationImages(_.flatMap(arr, 'images'));
                selectSurge.selected = ko.observable(false);
                selectSurge.deselect = deselectSurge;
                return [selectSurge, deselectSurge];
            });
        });
        self.modifyDicePool = function(dice) {
            var result = [dice];
            _(self.attachments()).forEach(function(a) { result = a.modifyDicePool(result) });
            return result;
        };
    };
    weapon.prototype = Object.create(card.prototype);
    var attachment = function (properties, image) {
        card.call(this, properties, image);
        this.pierce = properties.pierce;
        this.accuracy = properties.accuracy;
        this.damage = properties.damage;
        this.surges = properties.surges || [];
        this.ranged = properties.ranged || false;
        this.trait = properties.trait || [];
        this.modifyDicePool = properties.modifyDicePool || function (dicePool) { return dicePool; }
    };
    attachment.prototype = Object.create(card.prototype);
    var equipment = function (properties, image) {
        card.call(this, properties, image);
    };
    equipment.prototype = Object.create(card.prototype);

    return {
        Operation: Operation,
        Event: function (name, action) {
            var self = this;
            self.name = name;
            self.action = action;

            this.Execute = function (hero, conflict, event) {
                if (event === self.name) {
                    self.action(hero, conflict, self.card);
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