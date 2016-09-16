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
                                },
                                function(hero) { return hero.activated(); },
                                [cost.deplete()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Adrenal Stim.png'),
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
                                },
                                function(hero) { return hero.activated(); },
                                [cost.deplete()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Bacta Infusion.png'),
                new hf.Ability({
                        name: 'C22 Frag Grenade',
                        operations: [
                            new hf.Operation('C22 Frag Grenade',
                                function(hero, conflict, card) {
                                },
                                function(hero) { return hero.activated(); },
                                [cost.action(), cost.deplete()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/C22 Frag Grenade.png'),
                new hf.Ability({
                        name: 'Emergency Medpack',
                        eventOperations: [
                            {
                                operation: function() {
                                    var op = new hf.Operation('Emergency Medpack',
                                        function(hero, conflict, card) {
                                            modal.ConfirmOperation('Is the Emergency Medpack for you?',
                                                function() {
                                                    hero.gainDamage(-5);
                                                });
                                        },
                                        function() { return true; },
                                        [cost.deplete()],
                                        null,
                                        '(discard) 5');
                                    op.operationImages.push('Other/Damage.png');
                                    return op;
                                }(),
                                event: C$.REST
                            }
                        ]
                    },
                    false,
                    'Cards/Supply/Emergency Medpac.png'),
                new hf.Ability({
                        name: 'Shock Grenade',
                        operations: [
                            new hf.Operation('Shock Grenade',
                                function(hero, conflict, card) {
                                },
                                function(hero) { return hero.activated(); },
                                [cost.action(), cost.deplete()],
                                null,
                                '(discard)')
                        ]
                    },
                    false,
                    'Cards/Supply/Shock Grenade.png')
            ]
        };
    });