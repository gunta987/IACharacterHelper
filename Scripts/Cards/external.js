define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function (hf, modal, $, d, s, C$) {
        return [
            new hf.Ability({
                    name: 'Force Adept',
                    isExternal: true,
                    owner: 'Dialasis',
                    operations: [
                        new hf.Operation('Force Adept',
                            function(hero, conflict) {
                                conflict.UsedAbilities.push('Force Adept');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Force Adept') === -1 && conflict.RollFinished();
                            },
                            [],
                            C$.ATTACKROLL)
                    ]
                },
                false,
                'Cards/External/ForceAdept.png'),
            new hf.Ability({
                    name: 'Wookiee Loyalty',
                    isExternal: true,
                    owner: 'Wookiee',
                    operations: function() {
                        var op = new hf.Operation('Wookiee Loyalty',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                conflict.UsedAbilities.push('Wookie Loyalty');
                            },
                            function(hero, conflict, card) {
                                return _.indexOf(conflict.UsedAbilities(), 'Wookie Loyalty') === -1;
                            },
                            [],
                            C$.DEFENCEROLL);
                        op.operationImages(['Other/Block.png']);
                        return [op];
                    }()
                },
                false,
                'Cards/External/WookieLoyalty.png'),
            new hf.Ability({
                    name: 'Command (Attack)',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: [
                        new hf.Operation('Command (Attack)',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.activated();
                            })
                    ]
                },
                false,
                'Cards/External/Command.png'),
            new hf.Ability({
                    name: 'Called Shot',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: function() {
                        var op = new hf.Operation('Called Shot',
                            function(hero, conflict) {
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                conflict.UsedAbilities.push('Called Shot');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Called Shot') === -1;
                            },
                            [],
                            C$.ATTACKROLL);
                        op.operationImages.push('Other/Surge.png');
                        return [op];
                    }()
                },
                false,
                'Cards/External/CalledShot.png'),
            new hf.Ability({
                    name: 'For the Cause!',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: function() {
                        var op = new hf.Operation('For the Cause!',
                            function(hero, conflict) {
                                conflict.MyDice.push(hero.focusDie());
                                conflict.UsedAbilities.push('For the Cause!');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'For the Cause!') === -1;
                            },
                            [],
                            C$.ATTACKDICE);
                        op.operationImages.push({ src: 'Dice/green.png', css: 'die' });
                        return [op];
                    }()
                },
                false,
                'Cards/External/ForTheCause.png'),
            new hf.Ability({
                    name: 'Hammer and Anvil',
                    isExternal: true,
                    owner: 'OldDude',
                    operations: [
                        new hf.Operation('Hammer and Anvil',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.activated();
                            })
                    ]
                },
                false,
                'Cards/External/HammerAndAnvil.png'),
            new hf.Ability({
                    name: 'Inspiring',
                    isExternal: true,
                    owner: 'Luke',
                    operations: [
                        new hf.Operation('Inspiring',
                            function(hero, conflict) {
                                conflict.UsedAbilities.push('Inspiring');
                            },
                            function(hero, conflict) {
                                return _.indexOf(conflict.UsedAbilities(), 'Inspiring') === -1 && conflict.RollFinished();
                            },
                            [],
                            C$.ATTACKROLL)
                    ]
                },
                false,
                'Cards/Characters/Luke-skywalker-1-.png')
        ];
    });