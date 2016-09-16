define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Repeating Blaster',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 1,
                    dice: [d.BLUE, d.RED],
                    surges: [[s.accuracy()]]
                },
                'Cards/Biv/Repeating Blaster.png'),
            new hf.Ability({
                    name: C$.Biv.Advance
                },
                false,
                'Cards/Biv/Advance.png'),
            new hf.Ability({
                    name: C$.Biv.ShakeItOff,
                    operations: [
                        new hf.Operation('<i>Shake It Off</i>',
                            function(hero, conflict, card) {
                                hero.testAttribute(hero.fisting,
                                    function() {
                                        hero.setSpecialOperations(_.filter([
                                                new hf.Operation("Remove <img src='Tokens/bleed.png' />",
                                                    function(hero) {
                                                        hero.bleeding(false);
                                                        hero.setSpecialOperations([]);
                                                    },
                                                    function(hero) {
                                                        return hero.bleeding();
                                                    }),
                                                new hf.Operation("Remove <img src='Tokens/stun.png' />",
                                                    function(hero) {
                                                        hero.stunned(false);
                                                        hero.setSpecialOperations([]);
                                                    },
                                                    function(hero) {
                                                        return hero.stunned();
                                                    }),
                                                new hf.Operation("Remove <img src='Tokens/weaken.png' />",
                                                    function(hero) {
                                                        hero.weakened(false);
                                                        hero.setSpecialOperations([]);
                                                    },
                                                    function(hero) {
                                                        return hero.weakened();
                                                    }),
                                                new hf.Operation("Recover 1<img src='Tokens/strain.png' />",
                                                    function(hero) {
                                                        hero.gainStrain(-1);
                                                        hero.setSpecialOperations([]);
                                                    },
                                                    function(hero) {
                                                        return hero.strain() > 0 || hero.damage() > 0;
                                                    })
                                            ],
                                            function(operation) { return operation.canPerformOperation(hero, conflict); }));
                                    });
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() &&
                                    hero.actions() === 2 &&
                                    (hero.bleeding() || hero.stunned() || hero.weakened() || hero.strain() > 0 || hero.damage() > 0);
                            },
                            [],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Biv/Shake It Off.png'),
            new hf.Ability({
                    name: C$.Biv.CrushingBlow,
                    operations: [
                        new hf.Operation(C$.Biv.CrushingBlow,
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.AttackWeapon().attachments.push(new hf.Attachment({ surges: [[s.weaken(), s.stun()]] }, null));
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.AttackWeapon().name === C$.Biv.CloseAndPersonal;
                            },
                            [],
                            C$.ATTACKROLL,
                            "surge <img src='Tokens/weaken.png' />, <img src='Tokens/stun.png' /> (exhaust)"),
                        new hf.Operation(C$.Biv.CrushingBlow,
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.AttackWeapon().attachments.push(new hf.Attachment({ surges: [[s.damage(2)]] }, null));
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.AttackWeapon().name === C$.Biv.CloseAndPersonal;
                            },
                            [],
                            C$.ATTACKROLL,
                            "surge +2<img src='Other/damage.png' /> (exhaust)")
                    ]
                },
                false,
                'Cards/Biv/Crushing Blow.png'),
            new hf.Ability({
                    name: C$.Biv.IntoTheFray,
                    operations: [
                        function() {
                            var op = new hf.Operation(C$.Biv.IntoTheFray,
                                function(hero, conflict, card) {
                                    conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                    conflict.UsedAbilities.push(card.name);
                                },
                                function(hero, conflict, card) {
                                    return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                                },
                                [],
                                C$.DEFENCEROLL,
                                '(Check Card)');
                            op.operationImages.push('Other/Block.png');
                            return op;
                        }()
                    ]
                },
                false,
                'Cards/Biv/Into the Fray.png'),
            new hf.Armour({
                name: C$.Biv.TrophyArmour,
                    onAdd: function() { this.extraHealth(this.extraHealth() + 4); },
                    operations: [
                        new hf.Operation(C$.Biv.TrophyArmour,
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return conflict.RollFinished() && !card.exhausted();
                            },
                            [],
                            C$.DEFENCEROLL)
                    ]
                },
                'Cards/Biv/Trophy Armour.png'),
            new hf.Attachment({
                    name: 'Vibrobayonet',
                    ranged: true,
                    trait: ['Blade'],
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict) {
                                if (conflict.AttackWeapon().name === C$.Biv.CloseAndPersonal) {
                                    conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                    conflict.ExtraPierce(conflict.ExtraPierce() + 1);
                                    conflict.Bleed(conflict.Bleed() + 1);
                                }
                            })
                    ]
                },
                'Cards/Biv/Vibrobayonet.png'),
            function() {
                var activated = false;
                return new hf.Ability({
                        name: C$.Biv.FinalStand,
                        operations: [
                            new hf.Operation(C$.Biv.FinalStand,
                                function(hero, conflict, card) {
                                    activated = true;
                                    hero.gainStrain(-(hero.endurance + hero.extraEndurance()));
                                    hero.coreAbilities[C$.Biv.CloseAndPersonal].operations[0].performOperation(hero, conflict, true);
                                },
                                function(hero, conflict, card) {
                                    return !hero.stunned();
                                },
                                [$.action()],
                                null,
                                '(deplete)')
                        ],
                        events: [
                            new hf.Event(C$.Biv.CloseAndPersonalComplete,
                                function(hero, conflict, card) {
                                    if (activated) {
                                        activated = false;
                                        hero.gainDamage(2);
                                        hero.stunned(true);
                                        hero.cards.splice(hero.cards.indexOf(card), 1);
                                    }
                                })
                        ]
                    },
                    false,
                    'Cards/Biv/Final Stand.png');
            }(),
            new hf.Ability({
                    name: C$.Biv.StayDown,
                    eventOperations: [
                        {
                            operation: new hf.Operation(C$.Biv.StayDown,
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.attack(null,
                                        null,
                                        false,
                                        null,
                                        new hf.Weapon({ name: C$.Biv.CloseAndPersonal, ranged: false, dice: [d.RED, d.YELLOW] }));
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [$.strain(2)]),
                            event: C$.Biv.CloseAndPersonalResolved
                        }
                    ]
                },
                false,
                'Cards/Biv/Stay Down.png'),
            new hf.Ability({
                name: C$.Biv.HuntThemDown,
                operations: [
                    new hf.Operation(C$.Biv.HuntThemDown,
                        function(hero, conflict, card) {
                            conflict.ExtraPierce(conflict.ExtraPierce() + 1);
                            conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                            conflict.UsedAbilities.push(card.name);
                        },
                        function(hero, conflict, card) {
                            return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                        },
                        [],
                        C$.ATTACKROLL,
                        '<i>TROOPER</i> Only')
                ]
                },
                false,
                'Cards/Biv/Hunt Them Down.png')
        ];
    });