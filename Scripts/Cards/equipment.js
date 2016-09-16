define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Equipment({
                    name: 'Adrenal Implant',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Adrenal Implant',
                                function(hero, conflict, card) {
                                    hero.focused(true);
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !hero.focused() && !card.exhausted();
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.REST
                        }
                    ]
                },
                'Cards/Wearables/Adrenal Implant.png'),
            new hf.Equipment({
                    name: 'Combat Knife',
                    operations: [
                        new hf.Operation('Combat Knife',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !card.exhausted();
                            },
                            [$.strain()],
                            null,
                            "(exhaust)")
                    ]
                },
                'Cards/Wearables/Combat Knife.png'),
            new hf.Equipment({
                    name: 'Combat Visor',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Combat Visor (reroll 1)',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && hero.lastAttributeTest().attribute === hero.eye;
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTRIBUTE_TEST_FAIL,
                            completeEvent: true
                        }
                    ],
                    operations: [
                        new hf.Operation('Combat Visor',
                            function(hero, conflict, card) {
                                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 2);
                                conflict.UsedAbilities.push(card.name);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                            },
                            [$.strain()],
                            C$.ATTACKROLL)
                    ]
                },
                'Cards/Wearables/Combat Visor.png'),
            new hf.Equipment({
                    name: 'Extra Ammunition',
                    operations: [
                        new hf.Operation('Extra Ammunition',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return conflict.RollFinished() && conflict.AttackWeapon().ranged && !card.exhausted();
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)')
                    ]
                },
                'Cards/Wearables/Extra Ammunition.png'),
            new hf.Equipment({
                    name: 'Personal Shields',
                    operations: [
                        new hf.Operation('Personal Shields',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 5);
                            },
                            function(hero, conflict, card) {
                                return true;
                            },
                            [$.deplete()],
                            C$.DEFENCEROLL,
                            '(deplete)')
                    ]
                },
                'Cards/Wearables/Personal Shields.png'),
            new hf.Equipment({
                    name: 'Portable Medkit',
                    eventOperations: [
                        {
                            operation: function() {
                                var op = new hf.Operation('Portable Medkit',
                                    function(hero, conflict, card) {
                                        modal.ConfirmOperation('Is the Portable Medkit for you?',
                                            function() {
                                                hero.gainStrain(-1);
                                                hero.gainDamage(-3);
                                            });
                                    },
                                    function() { return true; },
                                    [$.deplete()],
                                    null,
                                    '(deplete)');
                                op.operationImages.push('Other/Damage.png', 'Other/Damage.png', 'Other/Damage.png', 'Tokens/strain.png');
                                return op;
                            }(),
                            event: C$.REST
                        }
                    ]
                },
                'Cards/Wearables/Portable Medkit.png'),
            new hf.Equipment({
                    name: 'Reinforced Helmet',
                    operations: [
                        new hf.Operation('Reinforced Helmet',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.RollFinished();
                            },
                            [],
                            C$.DEFENCEROLL,
                            '(exhaust)')
                    ]
                },
                'Cards/Wearables/Reinforced Helmet.png'),
            new hf.Equipment({
                    name: 'Slicing Tools',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Slicing Tools (reroll 1)',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && hero.lastAttributeTest().attribute === hero.spanner;
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTRIBUTE_TEST_FAIL,
                            completeEvent: true
                        }
                    ],
                    operations: [
                        new hf.Operation('Slicing Tools',
                            function(hero) {
                                hero.testAttribute(hero.spanner,
                                    function() {
                                        modal.ShowInformation(
                                            "Chosen droid suffers 1<img src='Other/Damage.png' /> and gains <img src='Tokens/stun.png' />");
                                    });
                            },
                            function(hero) {
                                return true;
                            },
                            [$.action(1, true)])
                    ]
                },
                'Cards/Wearables/Slicing Tools.png'),
            new hf.Equipment({
                    name: 'Survival Gear',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Survival Gear (reroll 1)',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && hero.lastAttributeTest().attribute === hero.fisting;
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTRIBUTE_TEST_FAIL,
                            completeEvent: true
                        }
                    ]
                },
                'Cards/Wearables/Survival Gear.png')
        ];
    });