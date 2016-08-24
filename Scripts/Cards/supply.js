define(['jquery', 'herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function($, hf, modal, cost, d, s, C$) {
        return {
            Show: function() { $('.modal-over').css('display', 'inline-flex'); },
            Close: function() { $('.modal-over').hide(); },
            Cards: [
                new hf.Ability({
                        name: 'Adrenal Stim',
                        operations: [
                            new hf.Operation('Adrenal Stim',
                                function(hero, conflict, card) {
                                    modal.ConfirmOperation('Is the Adrenal Stim for you?',
                                        function() {
                                            hero.gainStrain(-3);
                                            hero.focused(true);
                                        });
                                    hero.cards.splice(hero.cards.indexOf(card), 1);
                                },
                                function(hero) { return hero.activated(); },
                                [],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Adrenal_Stim.jpg'),
                new hf.Ability({
                        name: 'Bacta Infusion',
                        operations: [
                            new hf.Operation('Bacta Infusion',
                                function(hero, conflict, card) {
                                    modal.ConfirmOperation('Is the Bacta Infusion for you?',
                                        function() {
                                            hero.gainDamage(-3);
                                            hero.bleeding(false);
                                            hero.stunned(false);
                                        });
                                    hero.cards.splice(hero.cards.indexOf(card), 1);
                                },
                                function(hero) { return hero.activated(); },
                                [],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Bacta_Infusion.jpg'),
                new hf.Ability({
                        name: 'C22 Frag Grenade',
                        operations: [
                            new hf.Operation('C22 Frag Grenade',
                                function(hero, conflict, card) {
                                    hero.cards.splice(hero.cards.indexOf(card), 1);
                                },
                                function(hero) { return hero.activated(); },
                                [cost.action()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/C22_Frag_Grenade.jpg'),
                new hf.Ability({
                        name: 'Emergency Medpack',
                        events: [
                            new hf.Event(C$.REST,
                                function(hero, conflict, card) {
                                    modal.ConfirmOperation("Do you wish to discard Emergency Medpack to gain 5 <img src='Other/damage.png' />?",
                                        function() {
                                            modal.ConfirmOperation('Is the Emergency Medpack for you?',
                                                function() {
                                                    hero.gainDamage(-5);
                                                });
                                            hero.cards.splice(hero.cards.indexOf(card), 1);
                                        });
                                })
                        ]
                    },
                    false,
                    'Cards/Supply/Emergency_Medpack.jpg'),
                new hf.Ability({
                        name: 'Shock Grenade',
                        operations: [
                            new hf.Operation('Shock Grenade',
                                function(hero, conflict, card) {
                                    hero.cards.splice(hero.cards.indexOf(card), 1);
                                },
                                function(hero) { return hero.activated(); },
                                [cost.action()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Shock_Grenade.jpg')
            ]
        };
    });