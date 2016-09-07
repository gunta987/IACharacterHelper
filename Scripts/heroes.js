define(['jquery', 'ko', 'lodash', 'herofunctions', 'cards', 'inherentOperations', 'dice', 'conflict', 'cost', 'constants', 'modal'],
    function ($, ko, _, hf, cards, inherentOperations, d, conflict, cost, C$, modal) {
        var Hero = function(initial) {
            var self = this;

            var name = initial.name;
            self.health = initial.health;
            self.extraHealth = ko.observable(0);
            var fullHealth = function() { return this.health + this.extraHealth(); };
            self.endurance = initial.endurance;
            self.extraEndurance = ko.observable(0);
            var fullEndurance = function() { return this.endurance + this.extraEndurance(); };
            self.speed = initial.speed;
            self.extraSpeed = ko.observable(0);
            var fullSpeed = function() { return this.speed + this.extraSpeed(); };
            self.defence = function() { return _.map(initial.defence, function(die) { return die(); }); };
            self.fisting = ko.observableArray(initial.fisting);
            self.eye = ko.observableArray(initial.eye);
            self.spanner = ko.observableArray(initial.spanner);
            self.coreAbilities = initial.coreAbilities;
            var coreAbilities = _.values(_.mapValues(initial.coreAbilities,
                function(value, key) {
                    value.name = key;
                    return value;
                }));

            self.wounded = ko.observable(false);
            self.imageName = ko.pureComputed(function() {
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
            self.abilitiesUsedDuringActivation = ko.observableArray([]);
            self.abilitiesUsedDuringRound = ko.observableArray([]);
            self.hasActivated = ko.observable(false);
            self.movement = ko.observable(0);

            self.inConflict = ko.observable(false);

            self.damageTokens = ko.pureComputed(function() {
                var tokens = [];
                _.times(self.damage() / 5,
                    function() {
                        tokens.push({ height: '100%', image: 'Tokens/5damage.png' });
                    });
                _.times(self.damage() % 5,
                    function() {
                        tokens.push({ height: '80%', image: 'Tokens/1damage.png' });
                    });

                return tokens;
            });

            self.cards = ko.observableArray([]);
            self.equipment = ko.pureComputed(function() {
                return _.filter(self.cards(), function(card) { return card instanceof hf.Equipment; });
            });
            self.armour = ko.pureComputed(function() {
                return _.first(_.filter(self.cards(), function(card) { return card instanceof hf.Armour; }));
            });
            self.weapons = ko.pureComputed(function() {
                return _.filter(self.cards(), function(card) { return card instanceof hf.Weapon; });
            });
            self.abilities = ko.pureComputed(function() {
                return _.filter(self.cards(), function(card) { return card instanceof hf.Ability; });
            });
            self.purchasedAbilities = ko.pureComputed(function() {
                return _.filter(self.abilities(), function(ability) { return !ability.isCoreAbility; });
            });
            self.exhausted = ko.pureComputed(function () {
                return _(self.weapons())
                    .flatMap(function(w) { return w.attachments(); })
                    .concat(self.cards())
                    .filter(_.method('exhausted'))
                    .value();
            });
            self.classCards = initial.classCards;
            var eventOperations = {};
            self.AddCard = function(card) {
                self.cards.push(card);
                if (card.onAdd != null) {
                    card.onAdd.call(self);
                }
                _(card.eventOperations || [])
                    .forEach(function (eventOperation) {
                        eventOperation.operation.isExternal = card.isExternal;
                        eventOperations[eventOperation.event] = eventOperations[eventOperation.event] || [];
                        eventOperations[eventOperation.event].push(eventOperation.operation);
                    });
            };
            _.forEach(coreAbilities, self.AddCard);

            self.operations = ko.pureComputed(function () {
                return _.concat(inherentOperations,
                    _(self.cards())
                    .flatMap(function(card) {
                        return _(card.operations || [])
                            .map(function(op) {
                                    op.isExternal = card.isExternal || false;
                                    return op;
                                }
                            )
                            .value();
                    })
                    .value());
            });
            var specialOperations = ko.observableArray([]);
            var clearPreviousSpecialOperations;
            self.setSpecialOperations = function (operations, dispose) {
                if (clearPreviousSpecialOperations != null) {
                    clearPreviousSpecialOperations();
                }
                clearPreviousSpecialOperations = dispose;
                specialOperations(operations);
            };
            self.availableOperations = ko.pureComputed(function () {
                if (!_.isEmpty(specialOperations())) {
                    return specialOperations();
                } else {
                    var emptyArrayFunction = function () { return []; };
                    //TODO: ummm... rethink how this is extracted - there has to be a neater method.
                    var weaponOperations = _.concat((conflict.AttackWeapon().surgeOperations || emptyArrayFunction)(),
                        _.flatMap(_.flatMap(_.map(self.weapons(), function (weapon) { return weapon.attachments || emptyArrayFunction; }),
                                    function (fn) { return fn(); }),
                            'operations'));
                    return _.filter(_.concat(self.operations(), weaponOperations),
                        function (operation) {
                            return ((!self.inConflict() && operation.conflictStage == null) ||
                                (self.inConflict() && operation.conflictStage != null && operation.conflictStage == conflict.Stage())) &&
                                operation.canPerformOperation(self, conflict);
                        });
                }
            });

            self.event = ko.observable('');
            self.cardEvents = ko.pureComputed(function() {
                return _.flatMap(self.cards(), 'events');
            });
            self.event.subscribe(function(eventName) {
                if (eventName !== '') {
                    _(self.cardEvents())
                        .forEach(function(event) {
                            if (event != null) {
                                event.Execute(self, conflict, eventName);
                            }
                        });
                    self.event('');
                }
            });
            self.publishEventWithFollowOn = function(eventName, followOn) {
                self.event(eventName);
                followOn = followOn || function() {};
                new Promise(function (resolve, reject) {
                        var operationNames;
                        var operations = [];
                        var hasSetSpecialOps = false;
                        function getEventOperations() {
                            var thisEventOperations = _(eventOperations[eventName] || [])
                                .filter(function(operation) {
                                    return operation.canPerformOperation(self, conflict);
                                })
                                .value();
                            if (thisEventOperations.length === 0) {
                                return false;
                            }
                            thisEventOperations.push(new hf.Operation('Continue',
                                function() {},
                                function() { return true; }));
                            operationNames = thisEventOperations.map(function (operation) { return operation.name });
                            thisEventOperations.forEach(function (operation) {
                                operations.push(operation);
                            });
                            if (!hasSetSpecialOps) {
                                hasSetSpecialOps = true;
                                self.setSpecialOperations(operations,
                                    function() {
                                        if (eventSubscription != null) {
                                            eventSubscription.dispose();
                                        }
                                    });
                            } else {
                                specialOperations.notifySubscribers();
                            }
                            return true;
                        }

                        if (!getEventOperations()) {
                            resolve();
                        } else {
                            //another operation (e.g. attack) requires special operations. Cancel these operations
                            var eventSubscription = self.event.subscribe(function(event) {
                                if (operationNames.indexOf(event) !== -1) {
                                    operations.length = 0;
                                    if (event === 'Continue' || !getEventOperations()) {
                                        self.setSpecialOperations([]);
                                        resolve();
                                    }
                                }
                            });
                        }
                    })
                    .then(followOn)
                    .catch(console.log.bind(console));
            };

            self.damage.subscribe(function() {
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

            self.gainStrain = function(gain) {
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
            self.gainMovement = function(gain) {
                self.movement(self.movement() + gain);
            };
            self.gainDamage = function(gain) {
                self.damage(Math.max(self.damage() + gain, 0));
                self.suffered(self.suffered() + gain);
            };

            self.focusDie = d.GREEN;
            self.attack = function(additionalDice, abilitySurges, ranged, restrictionsFunction) {
                self.publishEventWithFollowOn(C$.BEFORE_ATTACK,
                    function() {
                        //step 1: choose your weapon
                        restrictionsFunction = restrictionsFunction || function() { return true; };
                        var availableWeapons = _(self.weapons()).filter(function(w) { return restrictionsFunction(w); }).value();
                        additionalDice = additionalDice || [];
                        abilitySurges = abilitySurges || [];
                        if (self.focused()) {
                            additionalDice.push(self.focusDie());
                            self.focused(false);
                        }

                        var chooseWeaponOperations = [];
                        _(availableWeapons)
                            .forEach(function(weapon) {
                                var originalPool = _.concat(weapon.dice(), additionalDice);
                                _(weapon.modifyDicePool(originalPool))
                                    .forEach(function(dice) {
                                        var additional = { pierce: weapon.pierce(), damage: weapon.damage(), accuracy: weapon.accuracy() };
                                        var operation = new hf.Operation(weapon.name,
                                            function() {
                                                self.setSpecialOperations([]);
                                                conflict.Attack(self, weapon.ranged || ranged || false, dice, additional, weapon, abilitySurges);
                                            },
                                            function() { return true; });
                                        var images = [];
                                        images.push(_.map(dice, function(die) { return { src: die.blank, css: 'die' }; }));
                                        images.push(_.times(additional.pierce, function() { return 'Other/Pierce.png' }));
                                        images.push(_.times(additional.damage, function() { return 'Other/Damage.png' }));
                                        if (weapon.accuracy() > 0) {
                                            images.push(['Other/' + additional.accuracy + '.png']);
                                        }
                                        operation.operationImages(_.flatten(images));
                                        chooseWeaponOperations.push(operation);
                                    });
                            });
                        self.setSpecialOperations(chooseWeaponOperations);
                    });
            };

            self.defend = function() {
                modal.AskQuestion('Is the attack melee or ranged?',
                    function() { conflict.Defend(self, true); },
                    function() { conflict.Defend(self, false); },
                    'Ranged',
                    'Melee');
            };

            self.lastAttributeTest = ko.observable({});
            self.testAttribute = function (attribute, onSuccess, overrideDice, isReroll) {
                onSuccess = onSuccess || function() {};
                var dice = overrideDice || _(attribute()).map(function (f) { return f(); }).value();
                var performTest = function() {
                    if (self.focused()) {
                        dice.push(d.GREEN());
                        self.focused(false);
                    }

                    if (!isReroll) {
                        self.lastAttributeTest({ attribute: attribute, onSuccess: onSuccess, dice: dice, usedAbilities: [] });
                    }
                    self.event(C$.ATTRIBUTE_TEST);
                    self.setSpecialOperations([]);
                    modal.AskQuestion( isReroll ?
                        'What about now?' :
                        'Roll ' +
                        _(dice).map(function(die) { return "<img src='" + die.blank + "' />"; }).join(' ') +
                        '<br/>Was the attribute test successful?',
                        onSuccess,
                        function() {
                            self.publishEventWithFollowOn(C$.ATTRIBUTE_TEST_FAIL);
                        });
                };
                if (isReroll) {
                    performTest();
                } else {
                    self.publishEventWithFollowOn(C$.BEFORE_ATTRIBUTE_TEST, performTest);
                }
            };
        };

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
                                        if (hero.activated()) {
                                            hero.abilitiesUsedDuringActivation.push(card.name);
                                        }
                                    },
                                    function(hero, conflict, card) {
                                        return (!hero.activated() || _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1) &&
                                            !conflict.AttackWeapon().ranged &&
                                            !hero.wounded();
                                    },
                                    [cost.strain(2)],
                                    C$.ATTACKDICE)
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
                                    C$.DEFENCEROLL)
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
                    hero.fisting([d.BLUE, d.RED]);
                    hero.eye([d.BLUE, d.RED, d.GREEN]);
                    hero.spanner([d.RED]);
                },
                classCards: cards.Diala
            }),
            new Hero({
                name: 'Loner',
                health: 12,
                endurance: 4,
                speed: 4,
                defence: [d.BLACK],
                fisting: [d.BLUE, d.GREEN],
                eye: [d.BLUE, d.GREEN],
                spanner: [d.BLUE, d.GREEN],
                coreAbilities: {
                    'Havoc Shot': new hf.Ability({
                            operations: [
                                new hf.Operation('Havoc Shot',
                                    function(hero, conflict, card) {
                                        conflict.UsedAbilities.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return conflict.AttackWeapon().ranged && _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                                    },
                                    [cost.strain()],
                                    C$.ATTACKROLL)
                            ]
                        },
                        true),
                    'Lone Wolf': new hf.Ability({
                            eventOperations: [
                                {
                                    operation: new hf.Operation('Lone Wolf',
                                        function(hero, conflict, card) {
                                            hero.gainStrain(-1);
                                            hero.abilitiesUsedDuringActivation.push(card.name);
                                        },
                                        function(hero, conflict, card) {
                                            return _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1;
                                        }),
                                    event: 'End Activation'
                                }
                            ]
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities['Lone Wolf']);
                    hero.fisting([d.BLUE, d.RED]);
                    hero.eye([d.BLUE, d.RED]);
                    hero.spanner([d.BLUE, d.RED]);
                },
                classCards: cards.Fenn
            }),
            new Hero({
                name: 'Wookiee',
                health: 14,
                endurance: 4,
                speed: 4,
                defence: [d.BLACK],
                fisting: [d.BLUE, d.GREEN, d.YELLOW],
                eye: [d.BLUE],
                spanner: [d.BLUE, d.GREEN],
                coreAbilities: {
                    'Charge': new hf.Ability({
                            operations: [
                                new hf.Operation('Charge',
                                    function(hero) {
                                        hero.attack();
                                    },
                                    function(hero) {
                                        return !hero.stunned();
                                    },
                                    [cost.action(), cost.strain(2)])
                            ]
                        },
                        true),
                    'Rage': new hf.Ability({
                            events: [
                                new hf.Event(C$.DEFENCE_RESOLVED,
                                    function(hero) {
                                        if (hero.suffered() >= 3) {
                                            hero.focused(true);
                                        }
                                    })
                            ]
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities['Rage']);
                    hero.fisting([d.BLUE, d.RED, d.GREEN]);
                    hero.eye([d.RED]);
                    hero.spanner([d.BLUE, d.RED]);
                },
                classCards: cards.Gaarkhan
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
                            operations: [
                                new hf.Operation('Command',
                                    function() {},
                                    function() { return true; },
                                    [cost.action(), cost.strain(2)])
                            ]
                        },
                        true),
                    'Disabling Shot': new hf.Ability({
                            events: [
                                new hf.Event(C$.ATTACK_START,
                                    function(hero, con) {
                                        if (con.AttackWeapon().ranged) {
                                            con.ExtraSurges(con.ExtraSurges() + 1);
                                        }
                                    })
                            ]
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities['Disabling Shot']);
                    hero.fisting([d.BLUE, d.RED]);
                    hero.eye([d.BLUE, d.RED, d.GREEN]);
                    hero.spanner([d.BLUE, d.RED]);
                },
                classCards: cards.Gideon
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
                            operations: [
                                new hf.Operation('Quick Draw',
                                    function(hero, conflict, card) {
                                        hero.abilitiesUsedDuringRound.push(card.name);
                                        hero.attack(null,
                                            null,
                                            true,
                                            function(weapon) {
                                                return _(weapon.type).includes('pistol');
                                            });
                                    },
                                    function(hero, conflict, card) {
                                        return _.indexOf(hero.abilitiesUsedDuringRound(), card.name) === -1 &&
                                            !hero.wounded() &&
                                            !hero.inConflict() &&
                                            !hero.activated() &&
                                            !hero.stunned();
                                    },
                                    [cost.strain(2)])
                            ]
                        },
                        true),
                    'Opportunist': new hf.Ability({
                            events: [
                                new hf.Event(C$.ATTACK_RESOLVED,
                                    function(hero, conflict, card) {
                                        if (conflict.MyAttack.damage() > 0) {
                                            modal.ShowInformation('Opportunist: you may move 1 space');
                                        }
                                    })
                            ]
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities['Opportunist']);
                    hero.fisting([d.RED]);
                    hero.eye([d.BLUE, d.RED]);
                    hero.spanner([d.BLUE, d.RED, d.GREEN]);
                },
                classCards: cards.Jyn
            }),
            new Hero({
                name: 'MakkaPakka',
                health: 10,
                endurance: 5,
                speed: 4,
                defence: [d.WHITE],
                fisting: [d.BLUE, d.GREEN],
                eye: [d.BLUE, d.GREEN],
                spanner: [d.BLUE, d.GREEN, d.YELLOW],
                coreAbilities: {
                    'Ambush': new hf.Ability({
                            operations: [
                                new hf.Operation('Ambush',
                                    function(hero, conflict, card) {
                                        conflict.ExtraPierce(conflict.ExtraPierce() + 2);
                                        conflict.UsedAbilities.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return _.indexOf(conflict.UsedAbilities(), card.name) === -1;;
                                    },
                                    [cost.strain()],
                                    C$.ATTACKDICE)
                            ]
                        },
                        true),
                    'Covert': new hf.Ability({
                        
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities['Covert']);
                    hero.fisting([d.BLUE, d.RED]);
                    hero.eye([d.BLUE, d.RED]);
                    hero.spanner([d.BLUE, d.RED, d.GREEN]);
                },
                classCards: cards.Mak
            })
        ];
    });