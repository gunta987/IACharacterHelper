define(['jquery', 'ko', 'lodash', 'herofunctions', 'cards'], function ($, ko, _, hf, cards) {
    function Die() {

    }

    var WHITE = new Die();
    var BLACK = new Die();
    var BLUE = new Die();
    var GREEN = new Die();
    var YELLOW = new Die();



    var strain = new hf.Action();
    strain.performAction = function (hero) {
        hero.increaseStrain();
    };

    var action, activation, attack, melee, range, resolveAttack, resolveDefence, damage, defence, defend, surge, round;

    function Hero(initial) {
        var self = this;

        var name = initial.name;
        self.health = initial.health;
        self.extraHealth = ko.observable(0);
        var fullHealth = function () { return this.health + this.extraHealth(); };
        self.endurance = initial.endurance;
        self.extraEndurance = ko.observable(0);
        var fullEndurance = function () { return this.endurance + this.extraEndurance(); };
        self.speed = initial.speed;
        self.extraSpeed = ko.observable(0);
        var fullSpeed = function () { return this.speed + this.extraSpeed(); };
        self.defence = ko.observableArray(initial.defence);
        self.fisting = ko.observableArray(initial.fisting);
        self.eye = ko.observableArray(initial.eye);
        self.spanner = ko.observableArray(initial.spanner);
        self.coreAbilities = initial.coreAbilities;
        var coreAbilities = _.values(_.mapValues(initial.coreAbilities, function (value, key) { value.name = key; return value; }));

        self.wounded = ko.observable(false);
        self.imageName = ko.pureComputed(function () {
            return self.wounded() ? name + 'W' : name;
        });
        self.damage = ko.observable(0);
        self.suffered = ko.observable(0);
        self.strain = ko.observable(0);
        self.focused = ko.observable(false);
        self.stunned = ko.observable(false);
        self.bleeding = ko.observable(false);
        self.actions = ko.observable(0);
        self.interrupt = ko.observable(false);
        self.movement = ko.observable(0);

        self.damageTokens = ko.pureComputed(function () {
            var tokens = [];
            _.times(self.damage() / 5, function () {
                tokens.push({ height: '100%', image: 'Tokens/5damage.png' });
            });
            _.times(self.damage() % 5, function () {
                tokens.push({ height: '80%', image: 'Tokens/1damage.png' });
            });

            return tokens;
        });

        self.cards = ko.observableArray([]);
        self.exhausted = ko.pureComputed(function () {
            return _.filter(self.cards(), 'exhausted');
        });
        self.armour = ko.pureComputed(function () {
            return _.first(_.filter(self.cards(), function (card) { return card instanceof hf.Armour; }));
        });
        self.weapons = ko.pureComputed(function () {
            return _.filter(self.cards(), function (card) { return card instanceof hf.Weapon; });
        });
        self.abilities = ko.pureComputed(function () {
            return _.filter(self.cards(), function (card) { return card instanceof hf.Ability; })
        });
        self.purchasedAbilities = ko.pureComputed(function () {
            return _.filter(self.abilities(), function (ability) { return !ability.isCoreAbility; });
        });
        self.AddCard = function (card) {
            self.cards.push(card);
            if (card.onAdd != null) {
                card.onAdd.call(self);
            }
        };
        _.forEach(coreAbilities, self.AddCard);

        self.damage.subscribe(function () {
            var health = fullHealth.call(self);
            if (self.damage() >= health) {
                self.wounded(true);
                self.damage(0);
                initial.onWounded.call(self);
                var endurance = fullEndurance.call(self);
                if (self.strain() > endurance) {
                    self.strain(endurance)
                }
            }
        });

        self.activate = function () {
            self.actions(2);
            self.interrupt(false);
            self.movement(0);
            self.suffered(0);
            _(self.exhausted()).forEach(function (card) {
                card.exhausted(false);
            });
        };

        self.endActivation = function () {
            self.movement(0);
        }

        self.rest = function () {
            if (self.actions() === 0 || self.interrupt()) return;

            var endurance = fullEndurance.call(self);
            _.times(endurance, function () {
                if (self.strain() > 0) {
                    self.strain(self.strain() - 1);
                }
                else if (self.damage() > 0) {
                    self.damage(self.damage() - 1);
                };
            });
            self.actions(self.actions() - 1);
        };

        self.gainStrain = function (gain) {
            self.strain(self.strain() + gain);
        };
        self.gainMovement = function (gain) {
            self.movement(self.movement() + gain);
        };
        self.gainDamage = function (gain) {
            self.damage(self.damage() + gain);
            self.suffered(self.suffered() + gain);
        };

        self.hit = function () { };
        self.suffered = function () { };
        self.reroll = function () { };
    }

    return [
        new Hero({
            name: 'Dialasis',
            health: 12,
            endurance: 5,
            speed: 4,
            defence: [WHITE],
            fisting: [BLUE, GREEN],
            eye: [BLUE, GREEN, YELLOW],
            spanner: [BLUE],
            coreAbilities: {
                'Precise Strike': new hf.Ability({
                    on: [attack, melee, function () { return !this.wounded; }],
                    scope: [activation],
                    cost: [strain, strain],
                    effect: function () { remove(defence); },
                }, true),
                'Foresight': new hf.Ability({
                    on: [defend],
                    scope: [],
                    cost: [strain],
                    effect: function () { reroll(defence); }
                }, true)
            },
            onWounded: function () {
                var hero = this;
                if (!(hero instanceof Hero)) return;

                hero.endurance--;
                hero.speed--;
                hero.abilities(_.without(hero.abilities(), hero.coreAbilities['Precise Strike']));
            }
        }),
        new Hero({
            name: 'OldDude',
            health: 10,
            endurance: 5,
            speed: 4,
            defence: [BLACK],
            fisting: [BLUE, GREEN],
            eye: [BLUE, GREEN, YELLOW],
            spanner: [BLUE, GREEN],
            coreAbilities: {
                'Command': new hf.Ability({
                    on: [],
                    scope: [],
                    cost: [action, strain, strain],
                    effect: function () { }
                }, true),
                'Disabling Shot': new hf.Ability({
                    on: [attack, range, function () { return !this.wounded; }],
                    scope: [],
                    cost: [surge],
                    effect: function () { effect([stun]); }
                }, true)
            }
        }),
        new Hero({
            name: 'SlipperyBitch',
            health: 10,
            endurance: 4,
            speed: 5,
            defence: [WHITE],
            fisting: [BLUE],
            eye: [BLUE, GREEN],
            spanner: [BLUE, GREEN, YELLOW],
            coreAbilities: {
                'Quick Draw': new hf.Ability({
                    on: [function () { hasWeaponType(pistol); }],
                    scope: [round],
                    cost: [strain, strain],
                    effect: function () { startAttack(pistol); }
                }, true),
                'Opportunist': new hf.Ability({
                    on: [resolveAttack, function () { return hit([damage]); }, function () { return !this.wounded; }],
                    scope: [],
                    cost: [],
                    effect: function () { gainMovement(1); }
                }, true)
            }
        }),
        new Hero({
            name: 'Wookie',
            health: 14,
            endurance: 4,
            speed: 4,
            defence: [BLACK],
            fisting: [BLUE, GREEN, YELLOW],
            eye: [BLUE],
            spanner: [BLUE, GREEN],
            coreAbilities: {
                'Charge': new hf.Ability({
                    on: [attack, melee],
                    scope: [],
                    cost: [strain, strain],
                    effect: function () { gainMovement(this.speed); },
                }, true),
                'Rage': new hf.Ability({
                    on: [resolveDefence, function () { return hasSuffered([damage, damage, damage]) }, function () { return !this.wounded; }],
                    scope: [],
                    cost: [],
                    effect: function () { reroll(defence); }
                }, true)
            }
        })
    ]
});