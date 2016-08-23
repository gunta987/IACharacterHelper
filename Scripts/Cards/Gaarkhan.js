define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
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
                    name: 'Wookie Fortitude',
                    operations: [
                        new hf.Operation('Wookie Fortitude',
                            function(hero, conflict, card) {
                                if (hero.bleeding() || hero.stunned()) {
                                    var bleedText = '';
                                    var yesButtonText = '';
                                    if (hero.bleeding()) {
                                        bleedText = " or remove <img src='Tokens/bleed.png' />";
                                        yesButtonText = 'Bleed';
                                        if (hero.stunned()) {
                                            bleedText += " or <img src='Tokens/stun.png />";
                                            yesButtonText += '/Stun';
                                        }
                                    }
                                    var stunText = hero.stunned() && !hero.bleeding() ? " or remove <img src='Tokens/stun.png' />" : '';
                                    modal.AskQuestion("Do you want to recover 2<img src='Other/damage.png' />" + bleedText + stunText,
                                        function() {
                                            if (hero.bleeding() && hero.stunned()) {
                                                modal.AskQuestion("Remove <img src='Tokens/bleed.png' /> or <img src='Tokens/stun.png />",
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
                            }
                            [$.strain()],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Gaarkhan/Wookiee Fortitude.jpg'),
            new hf.Ability({
                    name: 'Wookie Loyalty',
                    operations: [
                        new hf.Operation('Wookie Loyalty',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.DEFENCEDICE,
                            '(exhaust)')
                    ]
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
                    events: [
                        new hf.Event(C$.ATTACK_RESOLVED,
                            function(hero, conflict, card) {
                                if (!card.exhausted() && conflict.MyAttack.damage() >= 3) {
                                    modal.ConfirmOperation(
                                        "Do you want to exhaust 'Staggering Blow' to <img src='Tokens/stun.png' /> your target",
                                        function() {
                                            card.exhausted(true);
                                        });
                                }
                            })
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
                    events: [
                        new hf.Event('Charge',
                            function() {
                                modal.ShowInformation("Apply 1<img src='Other/damage.png' /> to all adjacent hostiles");
                            })
                    ]
                },
                false,
                'Cards/Gaarkhan/Rampage.jpg'),
            new hf.Ability({
                    name: 'Unstoppable'
                },
                false,
                'Cards/Gaarkhan/Unstoppable.jpg'),
            new hf.Ability({
                    name: 'Brutal Cleave'
                },
                false,
                'Cards/Gaarkhan/Brutal Cleave.jpg'),
            new hf.Ability({
                    name: 'Life Debt'
                },
                false,
                'Cards/Gaarkhan/Life_Debt.png')
        ];
    });