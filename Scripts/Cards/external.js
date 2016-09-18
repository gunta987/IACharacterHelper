define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants', 'tokens', 'Cards/saska'],
    function (hf, modal, $, d, s, C$, tokens, saska) {
        return [
            new hf.Ability({
                    name: 'Force Adept',
                    isExternal: true,
                    owner: 'Dialasis',
                    operations: [
                        new hf.Operation('Force Adept (reroll 1)',
                            function(hero, conflict) {
                                conflict.UsedAbilities.push('Force Adept');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Force Adept') === -1 && conflict.RollFinished();
                            },
                            [],
                            C$.ATTACKROLL)
                    ],
                    eventOperations: [
                        {
                            operation: new hf.Operation('Force Adept (reroll 1)',
                                function(hero, conflict, card) {
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        lastTest.usedAbilities.push(card.name);
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return hero.lastAttributeTest() == null || _.indexOf(hero.lastAttributeTest().usedAbilities, card.name) === -1;
                                }),
                            event: C$.ATTRIBUTE_TEST_FAIL,
                            completeEvent: true
                        }
                    ]
                },
                false,
                'Cards/External/ForceAdept.png'),
            new hf.Ability({
                    name: 'Wookiee Loyalty',
                    isExternal: true,
                    owner: 'Wookiee',
                    operations: function() {
                        var op = new hf.Operation('Wookiee Loyalty',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                conflict.UsedAbilities.push('Wookiee Loyalty');
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), 'Wookiee Loyalty') === -1;
                            },
                            [],
                            C$.DEFENCEROLL);
                        op.operationImages(['Other/Block.png']);
                        return [op];
                    }()
                },
                false,
                'Cards/External/WookieLoyalty.png'),
            new hf.Ability({
                    name: 'Command',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: [
                        new hf.Operation('Command (Attack)',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.activated();
                            }),
                        new hf.Operation(C$.External.CommandMove,
                            function(hero) {
                            },
                            function(hero) {
                                return !hero.activated();
                            })
                    ]
                },
                false,
                'Cards/External/Command.png'),
            new hf.Ability({
                    name: 'Called Shot',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: function() {
                        var op = new hf.Operation('Called Shot',
                            function(hero, conflict) {
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                conflict.UsedAbilities.push('Called Shot');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Called Shot') === -1;
                            },
                            [],
                            C$.ATTACKROLL);
                        op.operationImages.push('Other/Surge.png');
                        return [op];
                    }()
                },
                false,
                'Cards/External/CalledShot.png'),
            new hf.Ability({
                    name: 'For the Cause!',
                    isExternal: true,
                    owner: 'OldDude',
                    eventOperations: function() {
                        var op = new hf.Operation('For the Cause!',
                            function(hero, conflict, card) {
                                hero.focused(true);
                                if (hero.activated()) {
                                    hero.abilitiesUsedDuringActivation.push(card.name);
                                }
                            },
                            function(hero, conflict, card) {
                                op.operationImages.removeAll();
                                op.operationImages.push({ src: hero.focusDie().blank, css: 'die' });
                                return !hero.focused() && (!hero.activated() || _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1);
                            },
                            [],
                            null,
                            '+');
                        return [{ operation: op, event: C$.BEFORE_ATTACK }];
                    }()
                },
                false,
                'Cards/External/ForTheCause.png'),
            new hf.Ability({
                    name: 'Hammer and Anvil',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: [
                        new hf.Operation('Hammer and Anvil',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.activated();
                            })
                    ]
                },
                false,
                'Cards/External/HammerAndAnvil.png'),
            new hf.Ability({
                    name: C$.Saska.BattleTechnician,
                    isExternal: true,
                    owner: 'Sass',
                    operations: [
                                    new hf.Operation(C$.Saska.BattleTechnician,
                                        function(hero) {
                                                    hero.tokens.push(new tokens.Device());
                                        },
                                        function(hero) {
                                            return !hero.activated();
                                        })
                                        ]
                },
                false,
                'Cards/External/BattleTechnician.png'),
            new hf.Ability({
                    name: 'Practical Solutions',
                    isExternal: true,
                    owner: 'Sass',
                operations: [
                                new hf.Operation(C$.Saska.PracticalSolutionsAttack,
                                    function(hero, conflict, card) {
                                        conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                        conflict.UsedAbilities.push(card.name);
                                    },
                                    function(hero, conflict, card) {
                                        return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                                    },
                                    [$.deviceToken()],
                                    C$.ATTACKDICE)
                ],
                eventOperations: [
                                {
                                    operation: new hf.Operation(C$.Saska.PracticalSolutionsTest,
                                        function (hero, conflict, card) {
                                            var lastTest = hero.lastAttributeTest();
                                            if (lastTest != null && lastTest.attribute != null) {
                                                lastTest.usedAbilities.push(card.name);
                                                hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                            }
                                        },
                                        function (hero, conflict, card) {
                                            return hero.lastAttributeTest() == null ||
                                                _.indexOf(hero.lastAttributeTest().usedAbilities, card.name) === -1;
                                        },
                                        [$.deviceToken()],
                                        null,
                                        'Not if Saska is wounded'),
                                    event: C$.ATTRIBUTE_TEST_FAIL,
                                    completeEvent: true
                                }
                ]
                },
                false,
                'Cards/External/PracticalSolutions.png'),
            new hf.Ability({
                    name: C$.Saska.ToolKit,
                    isExternal: true,
                    owner: 'Sass',
                    eventOperations: [
                    {
                        //TODO: this doesn't work
                        operation: function() {
                            var op = new hf.Operation(C$.Saska.ToolKit,
                                function() {},
                                function() { return true; },
                                [],
                                null,
                                '(exhaust)');
                            op.operationImages.push('Other/Surge.png');
                            return op;
                        }(),
                        event: C$.Saska.PracticalSolutionsTest,
                        completeEvent: true
                    }
            ]
                },
                false,
                'Cards/External/ToolKit.png'),
            new hf.Ability({
                    name: C$.Saska.UnstableDevice,
                    isExternal: true,
                    owner: 'Sass',
                    operations: _(saska).filter(function (ability) { return ability.name === C$.Saska.UnstableDevice }).first().operations
                },
                false,
                'Cards/External/UnstableDevice.png'),
            new hf.Ability({
                    name: C$.Saska.EnergyShield,
                    isExternal: true,
                    owner: 'Sass',
                    operations: _(saska).filter(function (ability) { return ability.name === C$.Saska.EnergyShield }).first().operations
                },
                false,
                'Cards/External/EnergyShield.png'),
            new hf.Ability({
                    name: C$.Saska.PowerConverter,
                    isExternal: true,
                    owner: 'Sass',
                    operations: _(saska).filter(function (ability) { return ability.name === C$.Saska.PowerConverter }).first().operations
                },
                false,
                'Cards/External/PowerConverter.png'),
            new hf.Ability({
                    name: C$.Saska.AdrenalineInjector,
                    isExternal: true,
                    owner: 'Sass',
                    eventOperations: _(saska).filter(function (ability) { return ability.name === C$.Saska.AdrenalineInjector }).first().eventOperations
                },
                false,
                'Cards/External/AdrenalineInjector.png'),
            new hf.Ability({
                    name: 'Inspiring',
                    isExternal: true,
                    owner: 'Luke',
                    operations: [
                        new hf.Operation('Inspiring (reroll 1)',
                            function(hero, conflict) {
                                conflict.UsedAbilities.push('Inspiring');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Inspiring') === -1 && conflict.RollFinished();
                            },
                            [],
                            C$.ATTACKROLL)
                    ]
                },
                false,
                'Cards/Characters/Luke-skywalker-1-.png'),
            new hf.Ability({
                    name: 'Protector',
                    isExternal: true,
                    owner: 'Chewbacca',
                    operations: [
                        function() {
                            var op = new hf.Operation('Protector',
                                function(hero, conflict) {
                                    conflict.UsedAbilities.push('Protector');
                                    conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                },
                                function(hero, conflict) {
                                    return _.indexOf(conflict.UsedAbilities(), 'Protector') === -1;
                                },
                                [],
                                C$.DEFENCEROLL);
                            op.operationImages.push('Other/Block.png');
                            return op;
                        }()
                    ]
                },
                false,
                'Cards/Characters/Chewbacca-1-.png'),
            new hf.Ability({
                    name: 'Distracting',
                    isExternal: true,
                    owner: 'Han',
                    operations: [
                        function() {
                            var op = new hf.Operation('Distracting',
                                function(hero, conflict) {
                                    conflict.UsedAbilities.push('Distracting');
                                    conflict.ExtraEvade(conflict.ExtraEvade() + 1);
                                },
                                function(hero, conflict) {
                                    return _.indexOf(conflict.UsedAbilities(), 'Distracting') === -1;
                                },
                                [],
                                C$.DEFENCEROLL);
                            op.operationImages.push('Other/Evade.png');
                            return op;
                        }()
                    ]
                },
                false,
                'Cards/Characters/Han-solo.png'),
            new hf.Ability({
                    name: 'The Ways of the Force',
                    isExternal: true,
                    owner: 'None',
                    eventOperations: function() {
                        var op = new hf.Operation('The Ways of the Force',
                            function(hero, conflict, card) {
                                hero.focused(true);
                            },
                            function(hero, conflict, card) {
                                return !hero.focused();
                            },
                            [$.strain()]);
                        return [{ operation: op, event: C$.BEFORE_ATTRIBUTE_TEST }];
                    }()
                },
                false,
                'Cards/Other/The Ways of the Force.png'),
            new hf.Ability({
                    name: 'Heroic',
                    isExternal: true,
                    owner: 'None',
                    onAdd: function() { this.extraHealth(this.extraHealth() + 3); },
                    operations: [
                        new hf.Operation('Second Activation',
                            function(hero, conflict, card) {
                                hero.activate();
                                hero.abilitiesUsedDuringRound.push(card.name);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(hero.abilitiesUsedDuringRound(), card.name) === -1 && hero.hasActivated();
                            })
                    ]
                },
                false,
                'Cards/Other/Heroic.png'),
            new hf.Ability({
                    name: 'Legendary',
                    isExternal: true,
                    owner: 'None',
                    onAdd: function() { this.extraHealth(this.extraHealth() + 10); },
                    operations: [
                        new hf.Operation('Second Activation',
                            function(hero, conflict, card) {
                                hero.activate();
                                hero.abilitiesUsedDuringRound.push(card.name);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(hero.abilitiesUsedDuringRound(), card.name) === -1 && hero.hasActivated();
                            })
                    ]
                },
                false,
                'Cards/Other/Legendary.png')
        ];
    });