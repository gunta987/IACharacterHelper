define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
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
            new hf.Ability({ name: "Smuggler's Luck" }, false, 'Cards/Jyn/Smugglers Luck.jpg'), //TODO: implement this after implementing crates
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
                                //TODO: handle block to evade
                            },
                            function(hero, conflict, card) {
                                return true;
                            },
                            [$.strain()],
                            C$.DEFENCEDICE)
                    ]
                },
                false,
                'Cards/Jyn/Roll With It.jpg'),
            new hf.Ability({
                    name: 'Get Cocky',
                    events: [
                        new hf.Event(C$.ATTACK_RESOLVED,
                            function(hero, conflict, card) {
                                if (!card.exhausted() && conflict.MyAttack.damage() > 0) {
                                    modal.ConfirmOperation('Was your target defeated?',
                                        function() {
                                            modal.ConfirmOperation(
                                                "Exhaust 'Get Cocky' to recover 2 <img src='Tokens/strain.png' /> or become <img src='Tokens/focus.png' />?",
                                                function() {
                                                    card.exhausted(true);
                                                    modal.AskQuestion(
                                                        "Recover 2 <img src='Tokens/strain.png' /> or become <img src='Tokens/focus.png' />?",
                                                        function() {
                                                            hero.focused(true);
                                                        },
                                                        function() {
                                                            hero.gainStrain(-2);
                                                        },
                                                        'Focus',
                                                        'Strain');
                                                });
                                        });
                                }
                            })
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
                                    if (otherWeapon != null) {
                                        var extraSurges = _(conflict.AttackWeapon().attachments()).last().surges;
                                        //slice 1 to exclude the gain strain inherent surge ability
                                        _(otherWeapon.surges().slice(1)).forEach(surge => extraSurges.push(surge));
                                        conflict.AttackWeapon().attachments.notifySubscribers();
                                    }
                                }
                            })
                    ],
                    operations: [
                        new hf.Operation('Gunslinger',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [$.strain()],
                            C$.ATTACKROLL,
                            '(exhaust)')
                    ]
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
                    events: [
                        new hf.Event(C$.DEFENCE_RESOLVED,
                            function(hero, conflict, card) {
                                if (!card.exhausted() && hero.strain() < (hero.endurance + hero.extraEndurance())) {
                                    modal.ConfirmOperation(
                                        "Do you want to exhaust 'Peacemaker' for 1<img src='Tokens/strain.png' /> to attack your attacker?",
                                        function() {
                                            card.exhausted(true);
                                            hero.gainStrain(1);
                                            hero.attack();
                                        });
                                }
                            })
                    ]
                },
                false,
                'Cards/Jyn/Peacemaker.png')
        ];
    });