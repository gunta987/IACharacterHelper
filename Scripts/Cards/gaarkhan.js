﻿define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Vibro-Ax',
                    ranged: false,
                    type: ['blade'],
                    slots: 1,
                    dice: [d.RED, d.YELLOW],
                    surges: [[s.pierce()], [s.cleave()]]
                },
                'Cards/Gaarkhan/Pic2518434.jpg'),
            new hf.Ability({
                    name: 'Wookiee Fortitude',
                    operations: [
                        new hf.Operation('Wookiee Fortitude',
                            function(hero, conflict, card) {
                                if (hero.bleeding() || hero.stunned()) {
                                    var bleedText = '';
                                    var stunText = '';
                                    var yesButtonText = '';
                                    if (hero.bleeding()) {
                                        bleedText = " or remove <img src='Tokens/bleed.png' />";
                                        yesButtonText = 'Bleed';
                                        if (hero.stunned()) {
                                            bleedText += " or <img src='Tokens/stun.png' />";
                                            yesButtonText += '/Stun';
                                        }
                                    }
                                    if (hero.stunned() && !hero.bleeding()) {
                                        stunText = " or remove <img src='Tokens/stun.png' />";
                                        yesButtonText = 'Stun';
                                    }
                                    modal.AskQuestion("Do you want to recover 2<img src='Other/Damage.png' />" + bleedText + stunText,
                                        function() {
                                            if (hero.bleeding() && hero.stunned()) {
                                                modal.AskQuestion("Remove <img src='Tokens/bleed.png' /> or <img src='Tokens/stun.png' />",
                                                    function() {
                                                        hero.stunned(false);
                                                    },
                                                    function() {
                                                        hero.bleeding(false);
                                                    },
                                                    'Stun',
                                                    'Bleed');
                                            } else if (hero.bleeding()) {
                                                hero.bleeding(false);
                                            } else {
                                                hero.stunned(false);
                                            }
                                        },
                                        function() {
                                            hero.gainDamage(-2);
                                        },
                                        yesButtonText,
                                        'Damage');
                                } else {
                                    hero.gainDamage(-2);
                                }
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !card.exhausted() && (hero.bleeding() || hero.stunned() || hero.damage() > 0);
                            },
                            [$.strain()],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Gaarkhan/Wookiee Fortitude.jpg'),
            new hf.Ability({
                    name: 'Wookiee Loyalty',
                    operations: function() {
                        var self = new hf.Operation('Wookiee Loyalty',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.DEFENCEROLL,
                            '(exhaust)');
                        self.operationImages(['Other/Block.png']);
                        var other = new hf.Operation('Wookie Loyalty',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && !hero.activated();
                            },
                            [],
                            null,
                            "(exhaust, give <img src='Other/Block.png' />)");
                        return[self, other];
                    }()
                },
                false,
                'Cards/Gaarkhan/Wookie Loyalty.jpg'),
            new hf.Ability({
                    name: 'Ferocity',
                    onAdd: function() { this.focusDie = d.RED; },
                    events: function() {
                        var focusedAttack = false;
                        return [
                            new hf.Event(C$.BEFORE_ATTACK,
                                function(hero) {
                                    if (hero.focused()) {
                                        focusedAttack = true;
                                    }
                                }),
                            new hf.Event(C$.ATTACK_START,
                                function(hero, conflict) {
                                    if (focusedAttack) {
                                        focusedAttack = false;
                                        _(conflict.AttackWeapon().attachments()).last().surges.push([s.cleave()]);
                                        conflict.AttackWeapon().attachments.notifySubscribers();
                                    }
                                })
                        ];
                    }()
                },
                false,
                'Cards/Gaarkhan/Ferocity.jpg'),
            new hf.Ability({
                    name: 'Staggering Blow',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Staggering Blow',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return conflict.MyAttack.damage() >= 3 && !card.exhausted();
                                },
                                [$.strain()]),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Gaarkhan/Staggering Blow.jpg'),
            new hf.Ability({
                    name: 'Vicious Strike',
                    operations: [
                        new hf.Operation('Vicious Strike',
                            function(hero, conflict) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                conflict.UsedAbilities.push('Vicious Strike');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Vicious Strike') === -1;;
                            },
                            [$.strain()],
                            C$.ATTACKDICE)
                    ]
                },
                false,
                'Cards/Gaarkhan/Vicious Strike.jpg'),
            new hf.Ability({
                    name: 'Rampage',
                    events: function() {
                        var hasCharged = false;
                        return [
                            new hf.Event('Charge',
                                function() {
                                    hasCharged = true;
                                }),
                            new hf.Event(C$.ATTACK_RESOLVED,
                                function() {
                                    if (hasCharged) {
                                        hasCharged = false;
                                        modal.ShowInformation("Apply 1<img src='Other/Damage.png' /> to all adjacent hostiles");
                                    }
                                })
                        ];
                    }()
                },
                false,
                'Cards/Gaarkhan/Rampage.jpg'),
            new hf.Ability({
                    name: 'Unstoppable',
                    onAdd: function() {
                        this.extraEndurance(this.extraEndurance() + 1);
                        this.extraSpeed(this.extraSpeed() + 1);
                    },
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict) {
                                if (hero.wounded()) {
                                    conflict.ExtraDamage(conflict.ExtraDamage() + 2);
                                }
                            })
                    ]
                },
                false,
                'Cards/Gaarkhan/Unstoppable.jpg'),
            new hf.Ability({
                    name: 'Brutal Cleave',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Brutal Cleave',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.attack();
                                },
                                function(hero, conflict, card) {
                                    return !conflict.AttackWeapon().ranged && !card.exhausted();
                                },
                                [$.strain()]),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Gaarkhan/Brutal Cleave.jpg'),
            new hf.Ability({
                    name: 'Life Debt',
                    operations: [
                        new hf.Operation('Life Debt',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                hero.focused(true);
                            },
                            function(hero, conflict, card) {
                                return !hero.activated() && !card.exhausted() && !hero.focused();
                            },
                            [],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Gaarkhan/Life_Debt.png')
        ];
    });