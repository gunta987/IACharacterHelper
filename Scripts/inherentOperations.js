define(['herofunctions', 'cost', 'dice', 'Cards/supply', 'constants'], function (hf, $, d, supply, C$) {
    return [
        new hf.Operation('Activate',
            function (hero) {
                hero.activated(true);
                hero.abilitiesUsedDuringActivation([]);
                hero.actions(2);
                hero.movement(0);
                hero.strainMoves(0);
                hero.suffered(0);
                _(hero.exhausted()).forEach(function (card) {
                    card.exhausted(false);
                });
                hero.event('activate');
            },
            function (hero) {
                return !hero.activated() && !hero.hasActivated();
            }),
        new hf.Operation('End Activation',
            function(hero) {
                hero.publishEventWithFollowOn(C$.END_ACTIVATION,
                    function() {
                        hero.movement(0);
                        hero.strainMoves(0);
                        hero.activated(false);
                        hero.abilitiesUsedDuringActivation([]);
                        hero.hasActivated(true);
                    });
            },
            function(hero){
                return hero.activated() && hero.actions() === 0;
            }),
        new hf.Operation('Rest',
            function (hero) {
                var endurance = hero.endurance + hero.extraEndurance();
                _.times(endurance, function () {
                    if (hero.strain() > 0) {
                        hero.strain(hero.strain() - 1);
                    }
                    else if (hero.damage() > 0) {
                        hero.damage(hero.damage() - 1);
                    };
                });
                hero.publishEventWithFollowOn(C$.REST);
            },
            function (hero) {
                return hero.activated();
            },
            [$.action()]),
        new hf.Operation('Gain Movement',
            function (hero) {
                hero.gainMovement(hero.endurance + hero.extraEndurance());
            },
            function (hero) {
                return !hero.stunned();
            },
            [$.action()]),
        new hf.Operation('Strain Movement',
            function (hero) {
                hero.gainMovement(1);
                hero.strainMoves(hero.strainMoves() + 1);
            },
            function (hero) {
                return hero.activated() && !hero.stunned() && hero.strainMoves() < 2;
            },
            [$.strain()]),
        new hf.Operation('Attack',
            function (hero) {
                hero.attack();
            },
            function (hero) {
                return !hero.stunned();
            },
            [$.action()]),
        new hf.Operation('Remove Stun',
            function (hero) {
                hero.stunned(false);
            },
            function (hero) {
                return hero.stunned();
            },
            [$.action()]),
        new hf.Operation('Remove Bleed',
            function (hero) {
                hero.bleeding(false);
            },
            function (hero) {
                return hero.activated() && !hero.stunned() && hero.bleeding();
            },
            [$.action()]),
        new hf.Operation('Defend',
            function (hero) {
                hero.defend();
            },
            function (hero) {
                return !hero.activated();
            }),
        new hf.Operation('Interact',
            function (hero) {
                var createOp = function (name, attribute) {
                    var dice = _(attribute()).map(function(f) { return f(); }).value();
                    if (hero.focused()) {
                        dice.push(d.GREEN());
                    }

                    var op = new hf.Operation(name,
                        function(hero) {
                            hero.setSpecialOperations([]);
                            hero.testAttribute(attribute);
                        },
                        function() { return true; });
                    op.operationImages(_(dice).map(function (die) { return { src: die.blank, css: 'die' } }).value());
                   return op;
                }
                var operations = [];
                operations.push(createOp('Fisting', hero.fisting));
                operations.push(createOp('Eye', hero.eye));
                operations.push(createOp('Spanner', hero.spanner));

                operations.push(new hf.Operation('Open Crate',
                    function(hero) {
                        hero.setSpecialOperations([]);
                        supply.Show();
                    },
                    function () { return true; }));
                operations.push(new hf.Operation('Interaction Complete',
                    function(hero) {
                        hero.setSpecialOperations([]);
                    },
                    function () { return true; }));
                hero.setSpecialOperations(operations);
            },
            function (hero) {
                return hero.activated() && !hero.stunned();
            },
            [$.action()]),
        new hf.Operation('End Round',
            function(hero) {
                hero.event(C$.END_ROUND);
                hero.hasActivated(false);
                hero.abilitiesUsedDuringRound([]);
            },
            function(hero) {
                return !hero.activated() && hero.hasActivated();
            })
    ];
});