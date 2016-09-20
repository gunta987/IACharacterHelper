define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants', 'tokens'],
    function (hf, modal, $, d, s, C$, tokens) {
        return [
            new hf.Weapon({
                    name: 'Modified Blaster',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 1,
                    dice: [d.GREEN, d.YELLOW],
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict, card) {
                                if (conflict.AttackWeapon() === card) {
                                    conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 1);
                                }
                            })
                    ],
                    surges: [[s.weaken()], [s.damage()], [s.pierce()], [s.accuracy()]]
                },
                'Cards/Saska/Modified Blaster.png'),
            new hf.Ability({
                name: C$.Saska.ToolKit,
                eventOperations: [
                    {
                        operation: function() {
                            var op = new hf.Operation(C$.Saska.ToolKit,
                                function (hero, conflict, card) {
                                    var lastTest = hero.lastAttributeTest();
                                    if (lastTest != null && lastTest.attribute != null) {
                                        card.exhausted(true);
                                        lastTest.usedAbilities.push(card.name);
                                        hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                    }
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() &&
                                        hero.lastAttributeTest() != null &&
                                        (_.indexOf(hero.lastAttributeTest().usedAbilities, C$.Saska.PracticalSolutionsTest) !== -1 ||
                                            hero.lastAttributeTest().attribute === hero.spanner);
                                },
                                [],
                                null,
                                '(exhaust) +1');
                            op.operationImages.push('Other/Surge.png');
                            return op;
                        }(),
                        event: C$.ATTRIBUTE_TEST_FAIL,
                        completeEvent: true
                    }
                ]
                },
                false,
                'Cards/Saska/Tool Kit.png'),
            new hf.Ability({
                    name: C$.Saska.UnstableDevice,
                    operations: [
                        new hf.Operation(C$.Saska.UnstableDevice,
                            function(hero, conflict, card) {
                                hero.gainDamage(1);
                                hero.abilitiesUsedDuringActivation.push(card.name);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1;
                            },
                            [$.deviceToken()])
                    ]
                },
                false,
                'Cards/Saska/Unstable Device.png'),
            new hf.Ability({
                    name: C$.Saska.EnergyShield,
                    operations: [
                        new hf.Operation(C$.Saska.EnergyShield,
                            function(hero, conflict) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            },
                            function() { return true; },
                            [$.deviceToken()],
                            C$.DEFENCEROLL,
                            "+1<img src='Other/Block.png'/>"),
                        new hf.Operation(C$.Saska.EnergyShield,
                            function(hero, conflict) {
                                conflict.ExtraEvade(conflict.ExtraEvade() + 1);
                            },
                            function() { return true; },
                            [$.deviceToken()],
                            C$.DEFENCEROLL,
                            "+1<img src='Other/Evade.png'/>")
                    ]
                },
                false,
                'Cards/Saska/Energy Shield.png'),
            new hf.Ability({
                    name: C$.Saska.StructuralWeakness,
                    operations: [
                        new hf.Operation(C$.Saska.StructuralWeakness,
                            function(hero, conflict, card) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 2);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.ATTACKROLL,
                            "<div style='display: inline-block; vertical-align:top'>(exhaust)</div><span style='display:inline-block'><i>OBJECT</i></span>"),
                        new hf.Operation(C$.Saska.StructuralWeakness,
                            function(hero, conflict, card) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.ATTACKROLL,
                            "<div style='display: inline-block; vertical-align:top'>(exhaust)</div><span style='display:inline-block'><i>VEHICLE <br/>or DROID</i></span>")
                    ]
                },
                false,
                'Cards/Saska/Structural Weakness.png'),
            new hf.Ability({
                    name: C$.Saska.Gadgeteer,
                    events: [
                        new hf.Event(C$.Saska.BattleTechnician,
                            function(hero, conflict, card) {
                                if (_.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1) {
                                    hero.abilitiesUsedDuringActivation.remove(C$.Saska.BattleTechnician);
                                    hero.abilitiesUsedDuringActivation.push(card.name);
                                }
                            })
                    ],
                    weaponSlotModification: 1
                },
                false,
                'Cards/Saska/Gadgeteer.png'),
            new hf.Ability({
                    name: C$.Saska.PowerConverter,
                    operations: [
                        new hf.Operation(C$.Saska.PowerConverter,
                            function(hero, conflict, card) {
                                //Get all die combinations with 1 die switched that aren't the same combination as the original pool.
                                var defaultDice = _(conflict.MyDice()).sortBy(function(die) { return d.SortOrder(die.colour); });
                                var ddTitle = defaultDice.map(function(die) { return "<img src='" + die.blank + "'/>" }).join(' ');
                                var result = defaultDice
                                    .flatMap(function(die, index) {
                                        return _(conflict.AttackSelection)
                                            .map(function(alternateDie) {
                                                var newPool = conflict.MyDice().slice();
                                                newPool[index] = alternateDie.copy();
                                                return _(newPool).sortBy(function(die) { return d.SortOrder(die.colour); }).value();
                                            })
                                            .value();
                                    })
                                    .map(function(alternateDiePool) {
                                        return {
                                            pool: alternateDiePool,
                                            title: _(alternateDiePool)
                                                .map(function(die) { return "<img src='" + die.blank + "'/>" })
                                                .join(' ')
                                        };
                                    })
                                    .filter(function(x) { return x.title !== ddTitle; })
                                    .uniqBy(function(x) { return x.title; })
                                    .map(function(x) {
                                        return new hf.Operation(x.title,
                                            function(hero, conflict) {
                                                conflict.MyDice(x.pool);
                                                hero.setSpecialOperations([]);
                                            },
                                            function() { return true; });
                                    });
                                hero.setSpecialOperations(result.value());
                                conflict.UsedAbilities.push(card.name);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), card.name) === -1 &&
                                    _.indexOf(conflict.UsedAbilities(), C$.Saska.PracticalSolutionsAttack) !== -1;
                            },
                            [$.strain()],
                            C$.ATTACKDICE)
                    ]
                },
                false,
                'Cards/Saska/Power Converter.png'),
            new hf.Ability({
                    name: C$.Saska.AdrenalineInjector,
                    eventOperations: [
                        {
                            operation: new hf.Operation(C$.Saska.AdrenalineInjector,
                                function(hero) {
                                    hero.gainMovement(2);
                                    hero.focused(true);
                                },
                                function() { return true; },
                                [$.deviceToken()]),
                            event: C$.Inherent.GainMovement,
                            completeEvent: true
                        },
                        {
                            operation: new hf.Operation(C$.Saska.AdrenalineInjector,
                                function(hero) {
                                    hero.focused(true);
                                },
                                function() { return true; },
                                [$.deviceToken()]),
                            event: C$.External.CommandMove,
                            completeEvent: true
                        }
                    ]
                },
                false,
                'Cards/Saska/Adrenaline Injector.png'),
            new hf.Ability({
                    name: C$.Saska.RemoteDistribution,
                    onAdd: function() {
                        this.extraHealth(this.extraHealth() + 2);
                        this.extraEndurance(this.extraEndurance() + 1);
                    }
                },
                false,
                'Cards/Saska/Remote Distribution.png'),
            new hf.Equipment({
                    name: C$.Saska.TechGoggles,
                    operations: [
                        new hf.Operation(C$.Saska.TechGoggles,
                            function(hero, conflict, card) {
                                hero.tokens.push(new tokens.Device());
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !hero.activated() &&
                                    !card.exhausted() &&
                                    (hero.tokenStash().length +
                                        _.sumBy(hero.tokens(), function(token) { return token instanceof tokens.Device ? 1 : 0 })) <
                                    8;
                            },
                            [],
                            null,
                            '(exhaust)')
                    ]
                },
                'Cards/Saska/Tech Goggles.png')
        ];
    });