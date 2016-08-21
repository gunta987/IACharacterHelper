define(['herofunctions', 'cost'], function (hf, $) {
    return [
        new hf.Operation('Activate',
            function (hero) {
                hero.activated(true);
                hero.actions(2);
                hero.interrupt(false);
                hero.movement(0);
                hero.strainMoves(0);
                hero.suffered(0);
                _(hero.exhausted()).forEach(function (card) {
                    card.exhausted(false);
                });
                hero.event('activate');
            },
            function (hero) {
                return !hero.activated() && !hero.interrupt();
            }),
        new hf.Operation('End Activation',
            function(hero) {
                hero.movement(0);
                hero.strainMoves(0);
                hero.activated(false);
                hero.event('endActivation');
            },
            function(hero){
                return hero.activated() && hero.actions() == 0;
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
                hero.event('rest');
            },
            function (hero) {
                return hero.activated() && !hero.interrupt();
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
                return hero.activated() && !hero.interrupt() && !hero.stunned() && hero.strainMoves() < 2;
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
                return !hero.activated() && !hero.interrupt();
            })
    ];
});