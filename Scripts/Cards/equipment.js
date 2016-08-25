define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Equipment({
                    name: 'Adrenal Implant',
                    events: [
                        new hf.Event(C$.REST,
                            function(hero, conflict, card) {
                                if (!card.exhausted() && !hero.focused()) {
                                    modal.ConfirmOperation("Do you wish to exhaust Adrenal Implant to gain <img src='Tokens/Focus.png' />?",
                                        function() {
                                            hero.focused(true);
                                            card.exhausted(true);
                                        });
                                }
                            })
                    ]
                },
                'Cards/Wearables/Adrenal_Implant.png'),
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
                            "(exhaust, roll <img class='die' src='Dice/green.png' />)")
                    ]
                },
                'Cards/Wearables/Combat_Knife.jpg'),
            new hf.Equipment({
                    name: 'Combat Visor',
                    //TODO: exhaust for eye reroll
                    operations: [
                        new hf.Operation('Combat Visor',
                            function(hero, conflict, card) {
                                conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 2);
                                conflict.UsedAbilities.push('Combat Visor');
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), 'Force Adept') === -1;
                            },
                            [$.strain()],
                            C$.ATTACKROLL)
                    ]
                },
                'Cards/Wearables/Combat_Visor.jpg'),
            new hf.Equipment({
                    name: 'Extra Ammunition',
                    operations: [
                        new hf.Operation('Extra Ammunition',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return conflict.AttackWeapon().ranged && !card.exhausted();
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)')
                    ]
                },
                'Cards/Wearables/Extra-ammunition.png'),
            new hf.Equipment({
                    name: 'Personal Shields',
                    operations: [
                        new hf.Operation('Personal Shields',
                            function(hero, conflict, card) {
                                hero.cards.splice(hero.cards.indexOf(card), 1);
                                conflict.ExtraBlock(conflict.ExtraBlock() + 5);
                            },
                            function(hero, conflict, card) {
                                return true;
                            },
                            [],
                            C$.DEFENCEROLL,
                            '(deplete)')
                    ]
                },
                'Cards/Wearables/Personal_Shields.jpg'),
            new hf.Equipment({
                    name: 'Portable Medkit',
                    events: [
                        new hf.Event(C$.REST,
                            function(hero, conflict, card) {
                                modal.ConfirmOperation(
                                    "Do you wish to discard Portable Medkit to recover 3<img src='Other/damage.png' /> and 1<img src='Tokens/strain.png' />?",
                                    function() {
                                        modal.ConfirmOperation('Is the Portable Medkit for you?',
                                            function() {
                                                hero.gainStrain(-1);
                                                hero.gainDamage(-3);
                                            });
                                        hero.cards.splice(hero.cards.indexOf(card), 1);
                                    });
                            })
                    ]
                },
                'Cards/Wearables/Portable_Medkit.jpg'),
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
                'Cards/Wearables/Reinforced_Helmet.jpg'),
            new hf.Equipment({
                    name: 'Slicing Tools',
                    //TODO: implement spanner reroll
                    operations: [
                        new hf.Operation('Slicing Tools',
                            function(hero) {
                                hero.testAttribute(hero.spanner);
                            },
                            function(hero) {
                                return true;
                            },
                            [$.action()])
                    ]
                },
                'Cards/Wearables/Slicing_Tools.jpg'),
            new hf.Equipment({
                    name: 'Survival Gear'
                    //TODO: implement fisting reroll
                },
                'Cards/Wearables/Survival_Gear.jpg')
        ];
    });