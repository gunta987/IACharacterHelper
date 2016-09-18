define(['jquery', 'ko', 'lodash', 'herofunctions', 'cards', 'inherentOperations', 'dice', 'conflict', 'cost', 'constants', 'modal', 'tokens'],
    function ($, ko, _, hf, cards, inherentOperations, d, conflict, cost, C$, modal, tokens) {
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
            self.weakened = ko.observable(false);
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
            self.tokenStash = ko.observableArray(initial.tokenStash || []);
            self.tokens = ko.observableArray([]);

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
                        eventOperation.operation.completeEvent = eventOperation.completeEvent || false;
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

            var eventStack = ko.observableArray([]);
            var latestEventOperations = ko.pureComputed(function() {
                var latestEvent = _.last(eventStack());
                return latestEvent != null ? latestEvent.activeOperations() : [];
            });
            self.event = ko.observable('');
            self.cardEvents = ko.pureComputed(function() {
                return _(self.weapons())
                    .flatMap(function(w) { return w.attachments(); })
                    .concat(self.cards())
                    .flatMap('events')
                    .value();
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
            self.RefreshCurrentEvent = function() {
                eventStack.notifySubscribers();
            };
            self.publishEventWithFollowOn = function (eventName, followOn) {
                //i don't want to pop the stack until after the followon in case the followon changes the conditions for operations
                //staying valid for the event.
                var newfollowOn = function() {
                    (followOn || function () { })();
                    eventStack.pop();
                }
                const thisEvent = { name: eventName, usedOperations: [], activeOperations: ko.observableArray([]) };
                eventStack.push(thisEvent);
                self.event(eventName);

                new Promise(function (resolve, reject) {
                        var closeEvent = function() {
                            eventStackSubscription.dispose();
                            resolve();
                        };

                        function getEventOperations() {
                            const thisEventOperations = _(eventOperations[eventName] || [])
                                .filter(function(operation) {
                                    return _.indexOf(thisEvent.usedOperations, operation.name) === -1 &&
                                        operation.canPerformOperation(self, conflict);
                                })
                                .map(function(operation) {
                                    operation.beforePerformOperation = function() {
                                        thisEvent.usedOperations.push(operation.name);
                                        if (operation.completeEvent) {
                                            closeEvent();
                                        }
                                    };
                                    return operation;
                                })
                                .value();
                            if (thisEventOperations.length === 0) {
                                return false;
                            }
                            thisEventOperations.push(new hf.Operation('Continue',
                                closeEvent,
                                function () { return true; }));
                            thisEvent.activeOperations(thisEventOperations);
                            return true;
                        }

                        var eventStackSubscription = eventStack.subscribe(function () {
                            if (thisEvent === _.last(eventStack()) && !getEventOperations()) {
                                closeEvent();
                            }
                        });
                        if (thisEvent === _.last(eventStack()) && !getEventOperations()) {
                            closeEvent();
                        }
                    })
                    .then(newfollowOn)
                    .catch(console.log.bind(console));
            };

            self.availableOperations = ko.pureComputed(function () {
                var so = specialOperations();
                var leo = latestEventOperations();
                if (!_.isEmpty(so)) {
                    return so;
                } else if (!_.isEmpty(leo)) {
                    return leo;
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

            self.activate = function() {
                self.activated(true);
                self.abilitiesUsedDuringActivation([]);
                self.actions(2);
                self.movement(0);
                self.strainMoves(0);
                self.suffered(0);
                _(self.exhausted())
                    .forEach(function (card) {
                        card.exhausted(false);
                    });
            }

            self.focusDie = d.GREEN;
            self.attack = function(additionalDice, abilitySurges, ranged, restrictionsFunction, overrideWeapon) {
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

                        if (overrideWeapon != null) {
                            var additional = { pierce: overrideWeapon.pierce(), damage: overrideWeapon.damage(), accuracy: overrideWeapon.accuracy() };
                            conflict.Attack(self, overrideWeapon.ranged || ranged || false, overrideWeapon.dice(), additional, overrideWeapon, abilitySurges);
                        } else {
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
                        }
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
                    //self.setSpecialOperations([]);
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
                name: 'MrT',
                health: 13,
                endurance: 4,
                speed: 4,
                defence: [d.BLACK],
                fisting: [d.BLUE, d.GREEN, d.YELLOW],
                eye: [d.BLUE],
                spanner: [d.BLUE, d.GREEN],
                coreAbilities: {
                    'Close and Personal': function() {
                        var activated = 0;
                        var attack = function(hero) {
                            hero.attack(null,
                                null,
                                false,
                                null,
                                new hf.Weapon({ name: C$.Biv.CloseAndPersonal, ranged: false, dice: [d.RED, d.YELLOW] }));
                            activated++;
                        };
                        return new hf.Ability({
                                operations: [
                                    new hf.Operation(C$.Biv.CloseAndPersonal,
                                        function(hero) {
                                            attack(hero);
                                        },
                                        function(hero) {
                                            return !hero.stunned() && _(hero.weapons()).some(function(w) { return w.ranged; });
                                        },
                                        [cost.action(1, true), cost.strain(2)])
                                ],
                                events: [
                                    new hf.Event(C$.ATTACK_RESOLVED,
                                        function(hero) {
                                            function resolve() {
                                                activated = 0;
                                                hero.publishEventWithFollowOn(C$.Biv.CloseAndPersonalResolved,
                                                    function() {
                                                        hero.event(C$.Biv.CloseAndPersonalComplete);
                                                    });
                                            };

                                            if (activated === 1) {
                                                activated++;
                                                modal.AskQuestion('Close and Personal: was your target defeated?',
                                                    function() { resolve() },
                                                    function() {
                                                        hero.attack(null, null, false, function(weapon) { return weapon.ranged; });
                                                    });
                                            } else if (activated === 2) {
                                                resolve();
                                            }
                                        })
                                ]
                            },
                            true);
                    }(),
                    'Deadly Precision': new hf.Ability({
                            operations: [
                                new hf.Operation(C$.Biv.DeadlyPrecision,
                                    function(hero, conflict, card) {
                                        conflict.UsedAbilities.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return conflict.RollFinished() && _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                                    },
                                    [cost.strain()],
                                    C$.ATTACKROLL)
                            ]
                        },
                        true)
                },
                onWounded: function() {
                    var hero = this;
                    if (!(hero instanceof Hero)) return;

                    hero.endurance--;
                    hero.speed--;
                    hero.cards.remove(hero.coreAbilities[C$.Biv.DeadlyPrecision]);
                    hero.fisting([d.BLUE, d.RED, d.GREEN]);
                    hero.eye([d.RED]);
                    hero.spanner([d.BLUE, d.RED]);
                },
                classCards: cards.Biv
            }),
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
                                    [cost.action(1, true), cost.strain(2)])
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
                                    [cost.action(1, true), cost.strain(2)])
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
            }),
            new Hero({
                name: 'Sass',
                health: 11,
                endurance: 4,
                speed: 5,
                defence: [d.WHITE],
                fisting: [d.BLUE],
                eye: [d.BLUE, d.GREEN],
                spanner: [d.BLUE, d.GREEN, d.YELLOW],
                tokenStash: _.times(8, function() { return new tokens.Device(); }),
                coreAbilities: {
                    'Battle Technician': new hf.Ability({
                            onAdd: function() {
                                var hero = this;
                                hero.tokens.subscribe(function(changes) {
                                        _(changes)
                                            .forEach(function(change) {
                                                if (change.status === 'deleted' && change.value instanceof tokens.Device) {
                                                    hero.tokenStash.push(change.value);
                                                }
                                            });
                                    },
                                    null,
                                    'arrayChange');
                            },
                            operations: [
                                new hf.Operation(C$.Saska.BattleTechnician,
                                    function(hero, conflict, card) {
                                        var token = hero.tokenStash.pop();
                                        modal.ConfirmOperation('Are you claiming the device token?',
                                            function() {
                                                hero.tokens.push(token);
                                            });
                                        hero.abilitiesUsedDuringActivation.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return hero.activated() &&
                                            _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1 &&
                                            hero.tokenStash().length > 0;
                                    },
                                    [cost.strain()]),
                                new hf.Operation('Recover Discarded Token',
                                    function(hero) {
                                        hero.tokenStash.push(new tokens.Device());
                                    },
                                    function(hero) {
                                        return !hero.activated() &&
                                            (hero.tokenStash().length +
                                                _.sumBy(hero.tokens(), function(token) { return token instanceof tokens.Device ? 1 : 0 })) <
                                            8;
                                    })
                            ]
                        },
                        true),
                    'Practical Solutions': new hf.Ability({
                            operations: [
                                new hf.Operation(C$.Saska.PracticalSolutionsAttack,
                                    function(hero, conflict, card) {
                                        conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                        conflict.UsedAbilities.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                                    },
                                    [cost.deviceToken()],
                                    C$.ATTACKDICE)
                            ]
                        },
                        true),
                    'Practical Solutions (reroll 1)': new hf.Ability({
                            eventOperations: [
                                {
                                    operation: new hf.Operation(C$.Saska.PracticalSolutionsTest,
                                        function(hero, conflict, card) {
                                            var lastTest = hero.lastAttributeTest();
                                            if (lastTest != null && lastTest.attribute != null) {
                                                lastTest.usedAbilities.push(card.name);
                                                hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                            }
                                        },
                                        function(hero, conflict, card) {
                                            return hero.lastAttributeTest() == null ||
                                                _.indexOf(hero.lastAttributeTest().usedAbilities, card.name) === -1;
                                        },
                                        [cost.deviceToken()]),
                                    event: C$.ATTRIBUTE_TEST_FAIL,
                                    completeEvent: true
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
                    hero.cards.remove(hero.coreAbilities['Practical Solutions (reroll 1)']);
                    hero.fisting([d.RED]);
                    hero.eye([d.BLUE, d.RED]);
                    hero.spanner([d.BLUE, d.RED, d.GREEN]);
                },
                classCards: cards.Saska
            })
        ];
    });