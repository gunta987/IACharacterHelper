define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants', 'Cards/supply'],
    function(hf, modal, $, d, s, C$, supply) {
        return [
            new hf.Weapon({
                    name: 'Vintage Blaster',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.GREEN, d.GREEN],
                    surges: [[s.damage()], [s.accuracy()]]
                },
                'Cards/Jyn/Vintage Blaster.jpg'),
            new hf.Ability({
                    name: 'Quick As A Whip',
                    events: [
                        new hf.Event(C$.DEFENCE_RESOLVED,
                            function(hero, conflict, card) {
                                modal.ShowInformation('Quick As A Whip: you may move 1 space');
                            })
                    ]
                },
                false,
                'Cards/Jyn/Quick As A Whip.jpg'),
            new hf.Ability({
                    name: "Smuggler's Luck",
                    eventOperations: [
                        {
                            operation: new hf.Operation("Smuggler's Luck (redraw)",
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.cards.pop();
                                    supply.Show();
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.SUPPLY
                        },
                        {
                            operation: new hf.Operation("Smuggler's Luck (reroll)",
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTRIBUTE_TEST_FAIL
                        }
                    ]
                },
                false,
                'Cards/Jyn/Smugglers Luck.jpg'),
            new hf.Ability({
                    name: 'Cheap Shot',
                    events: function() {
                        var usedQuickDraw = false;
                        return [
                            new hf.Event('Quick Draw',
                                function(hero, conflict, card) {
                                    usedQuickDraw = true;
                                }),
                            new hf.Event(C$.ATTACK_START,
                                function(hero, conflict, card) {
                                    if (usedQuickDraw) {
                                        usedQuickDraw = false;
                                        conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                        _(conflict.AttackWeapon().attachments()).last().surges.push([s.stun()]);
                                        conflict.AttackWeapon().attachments.notifySubscribers();
                                    }
                                })
                        ];
                    }()
                },
                false,
                'Cards/Jyn/Cheap Shot.jpg'),
            new hf.Ability({
                    name: 'Roll With It',
                    operations: [
                        new hf.Operation('Roll With It',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                conflict.UsedAbilities.push('Roll With It');
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), 'Roll With It') === -1;
                            },
                            [$.strain()],
                            C$.DEFENCEDICE),
                        new hf.Operation('Roll With It',
                            function(hero, conflict, card) {
                                conflict.ExtraEvade(conflict.ExtraEvade() + 1);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), 'Roll With It') > -1;
                            },
                            [$.block()],
                            C$.DEFENCEROLL,
                            '-1')
                    ]
                },
                false,
                'Cards/Jyn/Roll With It.jpg'),
            new hf.Ability({
                    name: 'Get Cocky',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Get Cocky',
                                function(hero, conflict, card) {
                                    modal.ConfirmOperation('Was your target defeated?',
                                        function() {
                                            hero.setSpecialOperations(_.filter([
                                                    new hf.Operation("Gain <img src='Tokens/focus.png' />",
                                                        function(hero) {
                                                            hero.focused(true);
                                                            hero.setSpecialOperations([]);
                                                        },
                                                        function(hero) {
                                                            return !hero.focused();
                                                        }),
                                                    new hf.Operation("Recover 2<img src='Tokens/strain.png' />",
                                                        function(hero) {
                                                            hero.gainStrain(-2);
                                                            hero.setSpecialOperations([]);
                                                        },
                                                        function(hero) {
                                                            return true;
                                                        })
                                                ],
                                                function(operation) { return operation.canPerformOperation(hero, conflict); }));
                                            card.exhausted(true);
                                        });
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && conflict.MyAttack.damage() > 0;
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Jyn/Get Cocky.jpg'),
            new hf.Ability({
                    name: 'Gunslinger',
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict, card) {
                                if (_(conflict.AttackWeapon().type).includes('pistol')) {
                                    var otherWeapon = _.difference(hero.weapons(), [conflict.AttackWeapon()])[0];
                                    if (otherWeapon != null && _(otherWeapon.type).includes('pistol')) {
                                        var extraSurges = _(conflict.AttackWeapon().attachments()).last().surges;
                                        //slice 1 to exclude the gain strain inherent surge ability
                                        _(otherWeapon.surges().slice(1)).forEach(function(surge) { return extraSurges.push(surge); });
                                        conflict.AttackWeapon().attachments.notifySubscribers();
                                    }
                                }
                            })
                    ],
                    operations: function() {
                        var op = new hf.Operation('Gunslinger',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [$.strain()],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        op.operationImages.push('Other/Surge.png');
                        return [op];
                    }()
                },
                false,
                'Cards/Jyn/Gunslinger.png'),
            new hf.Ability({
                    name: 'Sidewinder',
                    events: [
                        new hf.Event(C$.ATTACK_RESOLVED,
                            function(hero, conflict, card) {
                                modal.ShowInformation('Sidewinder: you may move up to 2 spaces');
                            })
                    ]
                },
                false,
                'Cards/Jyn/Sidewinder.png'),
            new hf.Ability({
                    name: 'Trick Shot',
                    operations: [
                        new hf.Operation('Trick Shot',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.stunned();
                            },
                            [$.action(), $.strain()])
                    ]
                },
                false,
                'Cards/Jyn/Trickshot.png'),
            new hf.Ability({
                    name: 'Peacemaker',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Peacemaker',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.gainStrain(1);
                                    hero.attack();
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [$.strain()],
                                null,
                                '(exhaust)'),
                            event: C$.DEFENCE_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Jyn/Peacemaker.png')
        ];
    });