define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Longblaster',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 1,
                    dice: [d.BLUE, d.GREEN],
                    surges: [[s.damage()], [s.accuracy()]]
                },
                'Cards/Fenn/Infantry-Rifle.png'),
            new hf.Ability({
                    name: 'Tactical Movement',
                    operations: [
                        new hf.Operation('<i>Tactical Movement</i>',
                            function(hero, conflict, card) {
                                modal.ConfirmOperation('Is the Tactical Movement for you?',
                                    function() {
                                        hero.gainMovement(2);
                                    });
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && hero.actions() === 2;
                            },
                            [],
                            null,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Fenn/Tactical Movement.png'),
            new hf.Ability({
                    name: 'Take Cover',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Take Cover',
                                function(hero, conflict, card) {
                                    conflict.MyDice.push(new d.WHITE());
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [$.strain()],
                                null,
                                '(exhaust)'),
                            event: C$.DEFENCE_START
                        }
                    ]
                },
                false,
                'Cards/Fenn/Take Cover.png'),
            new hf.Ability({
                    name: 'Adrenaline Rush',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Adrenaline Rush',
                                function(hero, conflict, card) {
                                    hero.testAttribute(hero.fisting,
                                        function() {
                                            hero.gainStrain(-3);
                                        });
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return hero.suffered() > 0 && !card.exhausted();
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: C$.DEFENCE_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Fenn/Adrenaline Rush.jpg'),
            new hf.Ability({
                    name: 'Weapon Expert',
                    operations: [
                        new hf.Operation('Weapon Expert',
                            function(hero, conflict, card) {
                                conflict.UsedAbilities.push(card.name);
                                conflict.ExtraPierce(conflict.ExtraPierce() + 1);
                                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 2);
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), card.name) === -1;
                            },
                            [$.strain()],
                            C$.ATTACKROLL)
                    ]
                },
                false,
                'Cards/Fenn/Weapon Expert.png'),
            new hf.Ability({
                    name: 'Suppressive Fire',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Suppressive Fire',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && _.indexOf(conflict.UsedAbilities(), 'Havoc Shot') !== -1;
                                },
                                [$.strain()],
                                null,
                                '(exhaust)'),
                            event: C$.ATTACK_RESOLVED
                        }
                    ]
                },
                false,
                'Cards/Fenn/Suppressive Fire.png'),
            new hf.Ability({
                    name: 'Trench Fighter',
                    operations: [
                        new hf.Operation('Trench Fighter',
                            function(hero, conflict, card) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 2);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.requiredAccuracy() <= 3;
                            },
                            [],
                            C$.ATTACKDICE,
                            '(exhaust)')
                    ]
                },
                false,
                'Cards/Fenn/Trench Fighter.jpg'),
            new hf.Ability({
                    name: 'Rebel Elite',
                    onAdd: function() {
                        this.extraHealth(this.extraHealth() + 3);
                        this.extraEndurance(this.extraEndurance() + 1);
                    }
                },
                false,
                'Cards/Fenn/Rebel Elite.jpg'),
            new hf.Ability({
                    name: 'Superior Positioning',
                    operations: [
                        new hf.Operation('Superior Positioning',
                            function(hero) {
                                hero.focused(true);
                            },
                            function(hero) {
                                return !hero.stunned() && !hero.focused();
                            },
                            [$.action(), $.strain()])
                    ],
                    events: [
                        new hf.Event(C$.DEFENCE_START,
                            function(hero, conflict) {
                                if (hero.focused()) {
                                    conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                }
                            })
                    ]
                },
                false,
                'Cards/Fenn/Superior Positioning.png'),
            new hf.Ability({
                    name: 'Veteran Prowess',
                    events: [
                        new hf.Event('Havoc Shot',
                            function(hero, conflict) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                            })
                    ],
                    eventOperations: [
                        function() {
                            var operation = new hf.Operation('Veteran Prowess',
                                function(hero, conflict, card) {
                                    hero.gainDamage(-2);
                                    card.exhausted(true);
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted() && hero.damage() > 0;
                                },
                                [],
                                null,
                                '(exhaust)');
                            operation.operationImages.push('Other/Damage.png', 'Other/Damage.png');

                            return {
                                operation: operation,
                                event: C$.REST
                            }
                        }()
                    ]
                },
                false,
                'Cards/Fenn/Veteran_Prowess.png')
        ];
    });