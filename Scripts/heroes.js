define(['jquery', 'ko', 'lodash'], function ($, ko, _) {
    function Die() {

    }

    var WHITE = new Die();
    var BLACK = new Die();
    var BLUE = new Die();
    var GREEN = new Die();
    var YELLOW = new Die();

    var strain, activation, attack, melee, range, resolveAttack, resolveDefence, damage, defence, defend;

    function Hero(initial) {
        var self = this;

        self.name = ko.observable(initial.name);
        self.health = ko.observable(initial.health);
        self.endurance = ko.observable(initial.endurance);
        self.speed = ko.observable(initial.speed);
        self.defence = ko.observableArray(initial.defence);
        self.fisting = ko.observableArray(initial.fisting);
        self.eye = ko.observableArray(initial.eye);
        self.spanner = ko.observableArray(initial.spanner);
        self.abilities = ko.observableArray(initial.abilities);

        self.wounded = ko.observable(false);
        self.damage = ko.observable(0);
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
                tokens.push({ height: '100%', image: '/Tokens/5damage.png' });
            });
            _.times(self.damage() % 5, function () {
                tokens.push({ height: '80%', image: '/Tokens/1damage.png' });
            });

            return tokens;
        });

        self.cards = ko.observableArray([]);
        self.exhausted = ko.pureComputed(function () {
            return _.filter(self.cards(), 'exhausted');
        })

        self.activate = function () {
            self.actions(2);
            self.interrupt(false);
            self.movement = ko.observable(0);
            _(self.exhausted()).forEach(function (card) {
                card.exhausted(false);
            });
        }

        self.rest = function () {
            if (self.actions() === 0 || self.interrupt()) return;

            _.times(self.endurance(), function () {
                if (self.strain() > 0) {
                    self.strain(self.strain() - 1);
                }
                else if (self.damage() > 0) {
                    self.damage(self.damage() - 1);
                };
            });
            self.actions(self.actions() - 1);
        };

        self.hit = function () { };
        self.suffered = function () { };
        self.reroll = function () { };
        self.gainMovement = function () { };
    }

    return [
        new Hero({
            name: 'Diala',
            health: 12,
            endurance: 5,
            speed: 4,
            defence: [WHITE],
            fisting: [BLUE, GREEN],
            eye: [BLUE, GREEN, YELLOW],
            spanner: [BLUE],
            abilities: [
                {
                    name: 'Precise Strike',
                    on: [attack, melee, function () { return !this.wounded; }],
                    scope: [activation],
                    cost: [strain, strain],
                    effect: function () { remove(defence); },
                },
                {
                    name: 'Foresight',
                    on: [defend],
                    scope: [],
                    cost: [strain],
                    effect: function () { reroll(defence); }
                }
            ]
        }),
        new Hero({
            name: 'Gideon',
            health: 10,
            endurance: 5,
            speed: 4,
            defence: [BLACK],
            fisting: [BLUE, GREEN],
            eye: [BLUE, GREEN, YELLOW],
            spanner: [BLUE, GREEN],
            abilities: [
                {
                    name: 'Disabling Shot',
                    on: [attack, range, function () { return !this.wounded; }],
                    scope: [],
                    cost: [],
                    effect: function () { effect([stun]); }
                }
            ]
        }),
        new Hero({
            name: 'Jyn',
            health: 10,
            endurance: 4,
            speed: 5,
            defence: [WHITE],
            fisting: [BLUE],
            eye: [BLUE, GREEN],
            spanner: [BLUE, GREEN, YELLOW],
            abilities: [
                {
                    name: 'Opportunist',
                    on: [resolveAttack, function () { return hit([damage]); }, function () { return !this.wounded; }],
                    scope: [],
                    cost: [],
                    effect: function () { gainMovement(1); }
                }
            ]
        }),
        new Hero({
            name: 'Gaarkhan',
            health: 14,
            endurance: 4,
            speed: 4,
            defence: [BLACK],
            fisting: [BLUE, GREEN, YELLOW],
            eye: [BLUE],
            spanner: [BLUE, GREEN],
            abilities: [
                {
                    name: 'Charge',
                    on: [attack, melee],
                    scope: [],
                    cost: [strain, strain],
                    effect: function () { gainMovement(this.speed); },
                },
                {
                    name: 'Rage',
                    on: [resolveDefence, function () { return suffered([damage, damage, damage]) }, function () { return !this.wounded; }],
                    scope: [],
                    cost: [],
                    effect: function () { reroll(defence); }
                }
            ]
        })
    ]
});