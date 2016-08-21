define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function (hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Plasteel Staff',
                    ranged: false,
                    type: ['staff'],
                    slots: 1,
                    dice: [d.GREEN, d.YELLOW],
                    reach: true,
                    surges: [[s.stun()], [s.damage()]]
                },
                'Cards/Diala/Pic2444795.jpg'),
            new hf.Ability({ name: 'Force Adept' }, false, 'Cards/Diala/Pic2444785.jpg'),
            new hf.Ability({ name: 'Force Throw' }, false, 'Cards/Diala/Pic2444786.jpg'),
            new hf.Ability({ name: 'Battle Meditation' }, false, 'Cards/Diala/Pic2444787.jpg'),
            new hf.Ability({
                    name: 'Defensive Stance',
                    events: [
                        new hf.Event('Foresight',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            }),
                        new hf.Event(C$.DEFENCE_RESOLVED,
                            function(hero, conflict, card) {
                                if (hero.suffered() === 0) {
                                    hero.focused(true);
                                }
                            })
                    ]
                },
                false,
                'Cards/Diala/Pic2444788.jpg'),
            new hf.Ability({
                    name: 'Art of Movement',
                    onAdd: function() {
                        this.extraSpeed(this.extraSpeed() + 1);
                    }
                },
                false,
                'Cards/Diala/Pic2444789.jpg'),
            new hf.Ability({ name: 'Snap Kick' }, false, 'Cards/Diala/Pic2444790.jpg'),
            new hf.Ability({
                    name: 'Dancing Weapon',
                    operations: [
                        new hf.Operation('Dancing Weapon',
                            function(hero) {
                                hero.attack([d.BLUE()], [[s.accuracy(2), s.damage()]], true, function(weapon) {
                                    return !weapon.ranged;
                                });
                            },
                            function(hero) {
                                return !hero.stunned() && _(hero.weapons()).some(w => !w.ranged);
                            },
                            [$.action(), $.strain()])
                    ]
                },
                false,
                'Cards/Diala/Pic2444791.jpg'),
            new hf.Ability({ name: 'Way of the Sarlacc' }, false, 'Cards/Diala/Pic2444792.jpg'),
            function() {
                var foresightActivated = false;
                return new hf.Weapon({
                        name: "Shu Yen's Lightsaber",
                        ranged: false,
                        type: ['blade'],
                        slots: 1,
                        dice: [d.BLUE, d.RED],
                        reach: false,
                        surges: [[s.pierce(3)], [s.damage(), s.cleave(2)]],
                        events: [
                            new hf.Event('Foresight',
                                function(hero, conflict, card) {
                                    foresightActivated = true;
                                }),
                            new hf.Event(C$.DEFENCE_RESOLVED,
                                function(hero, conflict, card) {
                                    modal.ShowInformation("Foresight + Shu Yen's Lightsaber: Attacker receives 1<img src='Other/Damage.png' />");
                                    foresightActivated = false;
                                })
                        ]
                    },
                    "Cards/Diala/Shu_Yen's_Lightsaber.png");
            }()
        ];
    });