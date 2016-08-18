﻿define(['jquery', 'ko', 'lodash', 'herofunctions', 'cards', 'inherentOperations', 'dice', 'conflict', 'cost', 'constants', 'modal'],
    function ($, ko, _, hf, cards, inherentOperations, d, conflict, cost, $C, modal) {
    //function Die() {

    //}

    //var WHITE = new Die();
    //var BLACK = new Die();
    //var BLUE = new Die();
    //var GREEN = new Die();
    //var YELLOW = new Die();



    //var strain = new hf.Operation('Strain', function (hero) {
    //    hero.gainStrain(1);
    //});

    //var action, activation, attack, melee, range, resolveAttack, resolveDefence, damage, defence, defend, surge, round;

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
        self.defence = function () { return _.map(initial.defence, function (die) { return die(); }); };
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
        self.strainMoves = ko.observable(0);
        self.focused = ko.observable(false);
        self.stunned = ko.observable(false);
        self.bleeding = ko.observable(false);
        self.actions = ko.observable(0);
        self.activated = ko.observable(false);
        self.interrupt = ko.observable(false);
        self.movement = ko.observable(0);

        self.inConflict = ko.observable(false);

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

        self.operations = ko.observableArray(inherentOperations);
        self.specialOperations = ko.observableArray([]);
        self.availableOperations = ko.pureComputed(function () {
            if (!_.isEmpty(self.specialOperations())) {
                return self.specialOperations();
            }
            else {
                var emptyArrayFunction = function () { return []; };
                var weaponOperations = _.concat((conflict.AttackWeapon().surgeOperations || emptyArrayFunction)(),
                    _.flatMap((self.inConflict() ? (conflict.AttackWeapon().attachments || emptyArrayFunction) : emptyArrayFunction)(), 'operations'));
                return _.filter(_.concat(self.operations(), weaponOperations), function (operation) {
                    return ((!self.inConflict() && operation.conflictStage == null) ||
                            (self.inConflict() && operation.conflictStage != null && operation.conflictStage == conflict.Stage())) &&
                        operation.canPerformOperation(self, conflict);
                });
            }
        });

        self.cards = ko.observableArray([]);
        self.exhausted = ko.pureComputed(function () {
            return _.filter(self.cards(), 'exhausted');
        });
        self.equipment = ko.pureComputed(function () {
            return _.filter(self.cards(), function (card) { return card instanceof hf.Equipment; });
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
            _(card.operations || []).forEach(function (op) { self.operations.push(op); });
        };
        _.forEach(coreAbilities, self.AddCard);

        self.event = ko.observable('');
        self.cardEvents = ko.pureComputed(function () {
            return _.flatMap(self.cards(), 'events');
        });
        self.event.subscribe(function (eventName) {
            if (eventName != '') {
                _(self.cardEvents()).forEach(function (event) {
                    if (event != null) {
                        event.Execute(self, eventName);
                    }
                });
                self.event('');
            }
        });

        self.damage.subscribe(function () {
            var health = fullHealth.call(self);
            if (self.damage() >= health) {
                self.wounded(true);
                self.damage(0);
                initial.onWounded.call(self);
                var endurance = fullEndurance.call(self);
                if (self.strain() > endurance) {
                    self.strain(endurance);
                }
            }
        });

        self.gainStrain = function (gain) {
            var damage = 0;
            var strain = self.strain() + gain;
            if (strain < 0) {
                damage = strain;
                strain = 0;
            } else {
                var endurance = fullEndurance.call(self);
                if (strain > endurance) {
                    damage = strain - endurance;
                    strain = endurance;
                }
            }
            self.strain(strain);
            self.gainDamage(damage);
        };
        self.gainMovement = function (gain) {
            self.movement(self.movement() + gain);
        };
        self.gainDamage = function (gain) {
            self.damage(Math.max(self.damage() + gain, 0));
            self.suffered(self.suffered() + gain);
        };

        self.hit = function () { };
        self.suffered = function () { };
        self.reroll = function () { };

        self.attack = function (additionalDice, abilitySurges, ranged) {
            //step 1: choose your weapon
            additionalDice = additionalDice || [];
            abilitySurges = abilitySurges || [];
            if (self.focused()) {
                additionalDice.push(d.GREEN());
                self.focused(false);
            }

            _(self.weapons()).forEach(function (weapon) {
                var dice = _.concat(weapon.dice(), additionalDice);
                var additional = { pierce: weapon.pierce(), damage: weapon.damage(), accuracy: weapon.accuracy() };
                var operation = new hf.Operation(weapon.name,
                    function () {
                        self.specialOperations.removeAll();
                        conflict.Attack(self, weapon.ranged || ranged || false, dice, additional, weapon, abilitySurges);
                    },
                    function () { return true; });
                var images = [];
                images.push(_.map(dice, function (die) { return { src: die.blank, css: 'die' }; }));
                images.push(_.times(additional.pierce, function () { return 'Other/Pierce.png' }));
                images.push(_.times(additional.damage, function () { return 'Other/Damage.png' }));
                if (weapon.accuracy() > 0) {
                    images.push(['Other/' + additional.accuracy + '.png']);
                }
                operation.operationImages(_.flatten(images));
                self.specialOperations.push(operation);
            });
        };

        self.defend = function () {
            modal.AskQuestion('Is the attack melee or ranged?',
                function () { conflict.Defend(self, true); }, function () { conflict.Defend(self, false); }, 'Ranged', 'Melee');
        };
    }

    return [
        new Hero({
            name: 'Dialasis',
            health: 12,
            endurance: 5,
            speed: 4,
            defence: [d.WHITE],
            fisting: [d.BLUE, d.GREEN],
            eye: [d.BLUE, d.GREEN, d.YELLOW],
            spanner: [d.BLUE],
            coreAbilities: {
                'Precise Strike': new hf.Ability({
                        operations: [
                            new hf.Operation('Precise Strike',
                                function(hero, conflict, card) {
                                    //TODO: this can also be used during interrupt
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && !conflict.AttackWeapon().ranged && !hero.wounded();
                                },
                                [cost.strain(2)],
                                $C.ATTACKDICE)
                        ]
                    },
                    true),
                'Foresight': new hf.Ability({
                        operations: [
                            new hf.Operation('Foresight',
                                function(hero, conflict, card) {
                                    //reroll die
                                    conflict.UsedAbilities.push('Foresight');
                                },
                                function(hero, conflict, card) {
                                    return conflict.RollFinished() && _.indexOf(conflict.UsedAbilities(), 'Foresight') === -1;
                                },
                                [cost.strain()],
                                $C.DEFENCEROLL)
                        ]
                    },
                    true)
            },
            onWounded: function() {
                var hero = this;
                if (!(hero instanceof Hero)) return;

                hero.endurance--;
                hero.speed--;
                hero.cards.remove(hero.coreAbilities['Precise Strike']);
            }
        }),
        new Hero({
            name: 'OldDude',
            health: 10,
            endurance: 5,
            speed: 4,
            defence: [d.BLACK],
            fisting: [d.BLUE, d.GREEN],
            eye: [d.BLUE, d.GREEN, d.YELLOW],
            spanner: [d.BLUE, d.GREEN],
            coreAbilities: {
                'Command': new hf.Ability({
                
                    },
                    true),
                'Disabling Shot': new hf.Ability({
                
                    },
                    true)
            }
        }),
        new Hero({
            name: 'SlipperyBitch',
            health: 10,
            endurance: 4,
            speed: 5,
            defence: [d.WHITE],
            fisting: [d.BLUE],
            eye: [d.BLUE, d.GREEN],
            spanner: [d.BLUE, d.GREEN, d.YELLOW],
            coreAbilities: {
                'Quick Draw': new hf.Ability({
                
                    },
                    true),
                'Opportunist': new hf.Ability({
                
                    },
                    true)
            }
        }),
        new Hero({
            name: 'Wookie',
            health: 14,
            endurance: 4,
            speed: 4,
            defence: [d.BLACK],
            fisting: [d.BLUE, d.GREEN, d.YELLOW],
            eye: [d.BLUE],
            spanner: [d.BLUE, d.GREEN],
            coreAbilities: {
                'Charge': new hf.Ability({
                
                    },
                    true),
                'Rage': new hf.Ability({
                
                    },
                    true)
            }
        })
    ];
});