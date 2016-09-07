define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Holdout Blaster',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.BLUE, d.YELLOW],
                    surges: [[s.pierce(2)]]
                },
                'Cards/Gideon/Holdout Blaster.png'),
            new hf.Ability({
                    name: 'Called Shot',
                    operations: function() {
                        var other = new hf.Operation('Called Shot',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && !hero.activated();
                            },
                            [],
                            null,
                            "(exhaust, give <img src='Other/Surge.png' />)");
                        var self = new hf.Operation('Called Shot',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        self.operationImages(['Other/Surge.png']);
                        return [other, self];
                    }()
                },
                false,
                'Cards/Gideon/Called Shot.png'),
            new hf.Ability({
                    name: 'Military Efficiency',
                    operations: function() {
                        var attack = new hf.Operation('Military Efficiency',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.ExtraDamage(conflict.ExtraDamage() - 1);
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.MyAttack.damage() >= 1;
                            },
                            [],
                            C$.ATTACKROLL,
                            "(exhaust -1<img src='Other/Damage.png' />)");
                        attack.operationImages(['Other/Surge.png']);
                        var defend = new hf.Operation('Military Efficiency',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                                conflict.ExtraBlock(conflict.ExtraBlock() - 1);
                                conflict.ExtraEvade(conflict.ExtraEvade() + 1);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && conflict.Block() >= 1;
                            },
                            [],
                            C$.DEFENCEROLL,
                            "(exhaust -1<img src='Other/Block.png' />)");
                        defend.operationImages(['Other/Evade.png']);
                        return [attack, defend];
                    }()
                },
                false,
                'Cards/Gideon/Military Efficiency.png'),
            new hf.Ability({
                    name: 'Air of Command',
                    onAdd: function() { this.extraHealth(this.extraHealth() + 2); }
                },
                false,
                'Cards/Gideon/Air of Command.png'),
            new hf.Ability({
                    name: 'Mobile Tactician',
                    events: [
                        new hf.Event('Command',
                            function(hero) {
                                hero.gainMovement(2);
                            })
                    ]
                },
                false,
                'Cards/Gideon/Mobile Tactician.png'),
            new hf.Ability({
                    name: 'For the Cause!',
                    operations: [
                        new hf.Operation('For the Cause!',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [$.strain()],
                            null,
                            "(exhaust, give <img src='Tokens/focus.png' />)")
                    ]
                },
                false,
                'Cards/Gideon/For the Cause!.png'),
            new hf.Ability({
                    name: 'Rallying Shout',
                    operations: [
                        new hf.Operation('Rallying Shout',
                            function(hero, conflict, card) {
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !card.exhausted();
                            },
                            [],
                            null,
                            "(exhaust, give 2<img src='Tokens/strain.png' />)")
                    ]
                },
                false,
                'Cards/Gideon/Rallying Shout.png'),
            new hf.Ability({
                    name: 'Hammer and Anvil',
                    operations: [
                        new hf.Operation('Hammer and Anvil',
                            function(hero) {
                                hero.attack();
                            },
                            function(hero) {
                                return !hero.stunned();
                            },
                            [$.action(1, true), $.strain(2)])
                    ]
                },
                false,
                'Cards/Gideon/Hammer and Anvil.png'),
            new hf.Ability({
                    name: 'Masterstroke',
                    eventOperations: [
                        {
                            operation: new hf.Operation('Masterstroke',
                                function(hero, conflict, card) {
                                    card.exhausted(true);
                                    hero.event('Command');
                                },
                                function(hero, conflict, card) {
                                    return !card.exhausted();
                                },
                                [],
                                null,
                                '(exhaust)'),
                            event: 'Command'
                        }
                    ]
                },
                false,
                'Cards/Gideon/Masterstroke.png'),
            new hf.Ability({
                    name: 'Fearless Leader',
                    events: [
                        new hf.Event('Command',
                            function() {
                                modal.ShowInformation("Fearless Leader: Your commandee recovers 1<img src='Tokens/strain.png' />");
                            })
                    ]
                },
                false,
                'Cards/Gideon/Fearless Leader.png')
        ];
    });