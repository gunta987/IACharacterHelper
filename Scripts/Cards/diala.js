define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function (hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Plasteel Staff',
                    ranged: false,
                    type: ['staff'],
                    slots: 1,
                    dice: [d.GREEN, d.YELLOW],
                    reach: true,
                    surges: [[s.stun()], [s.damage()]]
                },
                'Cards/Diala/Plasteel Staff.png'),
            new hf.Ability({
                    name: 'Force Adept',
                    operations: [
                        new hf.Operation('Force Adept',
                            function(hero, conflict) {
                                conflict.UsedAbilities.push('Force Adept');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Force Adept') === -1;
                            },
                            [$.strain()],
                            C$.ATTACKROLL),
                        new hf.Operation('Force Adept',
                            function(hero, conflict) {
                            },
                            function(hero, conflict) {
                                return !hero.activated();
                            },
                            [$.strain()],
                            null,
                            '(give reroll)')
                    ],
                    eventOperations: [
                            {
                                operation: new hf.Operation('Force Adept',
                                    function (hero, conflict, card) {
                                        var lastTest = hero.lastAttributeTest();
                                        if (lastTest != null && lastTest.attribute != null) {
                                            lastTest.usedAbilities.push(card.name);
                                            hero.testAttribute(lastTest.attribute, lastTest.onSuccess, lastTest.dice, true);
                                        }
                                    },
                                    function (hero, conflict, card) {
                                        return hero.lastAttributeTest() == null || _.indexOf(hero.lastAttributeTest().usedAbilities, card.name) === -1;
                                    },
                                    [$.strain()]),
                                event: C$.ATTRIBUTE_TEST_FAIL
                            }
                    ]
                },
                false,
                'Cards/Diala/Force Adept.png'),
            new hf.Ability({
                    name: 'Force Throw',
                    operations: [
                        new hf.Operation('Force Throw',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                hero.testAttribute(hero.eye);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !card.exhausted();
                            },
                            [$.strain(2)])
                    ]
                },
                false,
                'Cards/Diala/Force Throw.png'),
            new hf.Ability({
                    name: 'Battle Meditation',
                    events: [
                        new hf.Event(C$.REST,
                            function(hero) {
                                hero.testAttribute(hero.eye,
                                    function() {
                                        modal.ConfirmOperation("Battle Meditation: Is the <img src='Tokens/focus.png' /> for you?",
                                            function() {
                                                hero.focused(true);
                                            });
                                    });
                            })
                    ]
                },
                false,
                'Cards/Diala/Battle Meditation.png'),
            new hf.Ability({
                    name: 'Defensive Stance',
                    events: [
                        new hf.Event('Foresight',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            }),
                        new hf.Event(C$.DEFENCE_RESOLVED,
                            function(hero, conflict, card) {
                                if (hero.suffered() === 0) {
                                    hero.focused(true);
                                }
                            })
                    ]
                },
                false,
                'Cards/Diala/Defensive Stance.png'),
            new hf.Ability({
                    name: 'Art of Movement',
                    onAdd: function() {
                        this.extraSpeed(this.extraSpeed() + 1);
                    }
                },
                false,
                'Cards/Diala/Art of Movement.png'),
            new hf.Ability({
                    name: 'Snap Kick',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Snap Kick',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && !conflict.AttackWeapon().ranged;
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Diala/Snap Kick.png'),
            new hf.Ability({
                    name: 'Dancing Weapon',
                    operations: [
                        new hf.Operation('Dancing Weapon',
                            function(hero) {
                                hero.attack([d.BLUE()],
                                    [[s.accuracy(2), s.damage()]],
                                    true,
                                    function(weapon) {
                                        return !weapon.ranged;
                                    });
                            },
                            function(hero) {
                                return !hero.stunned() && _(hero.weapons()).some(function(w) { return !w.ranged; });
                            },
                            [$.action(), $.strain()])
                    ]
                },
                false,
                'Cards/Diala/Dancing Weapon.png'),
            function() {
                var activated = false;
                var attack = function(hero) {
                    hero.attack(null, null, false, function(weapon) { return !weapon.ranged; });
                    activated = true;
                };
                return new hf.Ability({
                        name: 'Way of the Sarlacc',
                        operations: [
                            new hf.Operation('Way of the Sarlacc',
                                function(hero) {
                                    attack(hero);
                                },
                                function(hero) {
                                    return !hero.stunned() && _(hero.weapons()).some(function(w) { return !w.ranged; });
                                },
                                [$.action(), $.strain(2)])
                        ],
                        events: [
                            new hf.Event(C$.ATTACK_RESOLVED,
                                function(hero) {
                                    if (activated) {
                                        modal.AskQuestion('Way of the Sarlacc: are there any more adjacent enemies?',
                                            function() {
                                                attack(hero);
                                            },
                                            function() {
                                                activated = false;
                                            });
                                    }
                                })
                        ]
                    },
                    false,
                    'Cards/Diala/Way of the Sarlacc.png');
            }(),
            function() {
                var foresightActivated = false;
                return new hf.Weapon({
                        name: "Shu Yen's Lightsaber",
                        ranged: false,
                        type: ['blade'],
                        slots: 1,
                        dice: [d.BLUE, d.RED],
                        reach: false,
                        surges: [[s.pierce(3)], [s.damage(), s.cleave(2)]],
                        events: [
                            new hf.Event('Foresight',
                                function(hero, conflict, card) {
                                    foresightActivated = true;
                                }),
                            new hf.Event(C$.DEFENCE_RESOLVED,
                                function(hero, conflict, card) {
                                    if (foresightActivated) {
                                        modal.ShowInformation("Foresight + Shu Yen's Lightsaber: Attacker receives 1<img src='Other/Damage.png' />");
                                        foresightActivated = false;
                                    }
                                })
                        ]
                    },
                    "Cards/Diala/Shu Yen's Lightsaber.png");
            }()
        ];
    });