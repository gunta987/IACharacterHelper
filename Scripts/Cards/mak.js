define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants', 'Cards/supply'],
    function(hf, modal, $, d, s, C$, supply) {
        return [
            new hf.Weapon({
                    name: 'Longblaster',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 1,
                    dice: [d.BLUE, d.BLUE],
                    surges: [[s.damage()], [s.pierce()]]
                },
                'Cards/Mak/Longblaster.png'),
            new hf.Ability({
                    name: 'Disengage',
                    operations: [
                        new hf.Operation('Disengage',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && !hero.activated() && !hero.stunned();
                            },
                            [$.strain()],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Mak/Disengage.png'),
            new hf.Ability({
                    name: 'Supply Network',
                    operations: [
                        new hf.Operation('Supply Network (test)',
                            function(hero, conflict, card) {
                                hero.testAttribute(hero.eye);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !card.exhausted();
                            },
                            [],
                            null,
                            '(exhaust)'),
                        new hf.Operation('Supply Network',
                            function(hero, conflict, card) {
                                supply.Show();
                            },
                            function(hero, conflict, card) {
                                return true;
                            },
                            [$.action(), $.deplete()],
                            null,
                            '(deplete)')
                    ]
                },
                false,
                'Cards/Mak/Supply Network.png'),
            new hf.Ability({
                    name: 'Jeswandi Training',
                    onAdd: function() {
                        this.extraHealth(this.extraHealth() + 2);
                    },
                    operations: [
                        new hf.Operation('Jeswandi Training',
                            function(hero, conflict, card) {
                                hero.focused(true);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !hero.focused() && !card.exhausted();
                            },
                            [],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Mak/Jeswandi Training.png'),
            new hf.Ability({
                    name: 'Target Acquired',
                    operations: [
                        new hf.Operation('Target Acquired',
                            function(hero, conflict, card) {
                                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 2);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [$.strain()],
                            C$.ATTACKDICE,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Mak/Target Acquired.png'),
            new hf.Ability({
                    name: 'Execute',
                    events: [
                        new hf.Event(C$.ATTACK_RESOLVED,
                            function(hero, conflict) {
                                if (conflict.MyAttack.damage() > 0) {
                                    modal.ConfirmOperation('Was your target defeated?',
                                        function() {
                                            hero.gainStrain(-1);
                                        });
                                }
                            })
                    ],
                    operations: [
                        new hf.Operation('Execute',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && _.indexOf(conflict.UsedAbilities(), 'Ambush') !== -1;
                            },
                            [$.strain()],
                            C$.ATTACKDICE,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Mak/Execute.png'),
            new hf.Ability({
                    name: 'Expertise',
                    events: [
                        new hf.Event('Interact',
                            function(hero, conflict, card) {
                                if (!card.exhausted() && hero.strain() < (hero.endurance + hero.extraEndurance())) {
                                    modal.ConfirmOperation(
                                        "Exhaust 'Expertise' for 1<img src='Tokens/strain.png' /> to regain <img src='Other/Action.png' />?",
                                        function() {
                                            hero.gainStrain(1);
                                            hero.actions(hero.actions() + 1);
                                            card.exhausted(true);
                                        });
                                }
                            })
                    ]
                },
                false,
                'Cards/Mak/Expertise.png'),
            new hf.Ability({
                    name: 'Decoy',
                    operations: [
                        new hf.Operation('Decoy',
                            function(hero, conflict, card) {
                                hero.focused(true);
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.activated() && !hero.stunned();
                            },
                            [$.deplete()],
                            null,
                            '(deplete)')
                    ]
                },
                false,
                'Cards/Mak/Decoy.png'),
            new hf.Ability({
                    name: 'No Escape',
                    eventOperations: [
                        {
                            operation: new hf.Operation('No Escape',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.focused(true);
                                    hero.attack();
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [$.strain(2)],
                                null,
                                '(exhaust)'),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Mak/No Escape.png'),
            new hf.Armour({
                    name: 'Shadow Suit'
                },
                'Cards/Mak/Shadow Suit.png')
        ];
    });