define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Attachment({
                    name: 'Balanced Hilt',
                    ranged: false,
                    trait: ['Balance'],
                    operations: function() {
                        var op = new hf.Operation('Balanced Hilt',
                            function(hero, conflict, card) {
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && _.includes(conflict.AttackWeapon().attachments(), card);
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        op.operationImages(['Other/Surge.png']);
                        return [op];
                    }()
                },
                'Cards/WeaponAttachments/Balanced_Hilt.jpg'),
            new hf.Attachment({
                    name: 'Disruption Cell',
                    ranged: true,
                    trait: ['Energy'],
                    accuracy: function () { return 2 },
                    modifyDicePool: function(dicePool) {
                        var result = [];
                        _(dicePool)
                            .forEach(pool => {
                                _(pool)
                                    .forEach((die, index) => {
                                        var newPool = pool.slice();
                                        newPool[index] = d.RED();
                                        result.push(newPool);
                                    });
                            });
                        return result;
                    }
                },
                'Cards/WeaponAttachments/Disruption_Cell.jpg'),
            new hf.Attachment({
                    name: 'Extended Haft',
                    ranged: false,
                    trait: ['Balance'],
                    pierce: function(weapon) { return weapon.reach ? 1 : 0; }
                },
                'Cards/WeaponAttachments/Extended_Haft.jpg'),
            new hf.Attachment({
                    name: 'High-Impact Guard',
                    ranged: false,
                    trait: ['Impact'],
                    surges: [[s.damage(2)]],
                    operations: function() {
                        var op = new hf.Operation('High-Impact Guard',
                            function(hero, conflict, card) {
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted();
                            },
                            [],
                            C$.DEFENCEROLL,
                            '(exhaust)');
                        op.operationImages(['Other/Block.png']);
                        return [op];
                    }()
                },
                'Cards/WeaponAttachments/High-Impact_Guard.jpg'),
            new hf.Attachment({
                    name: 'Marksman Barrel',
                    ranged: true,
                    trait: ['Barrel'],
                    accuracy: function() { return 2 }
                },
                'Cards/WeaponAttachments/Marksman_Barrel.jpg'),
            new hf.Attachment({
                    name: 'Overcharger',
                    ranged: true,
                    trait: ['Energy'],
                    operations: [
                        new hf.Operation('Overcharger',
                            function(hero, conflict, card) {
                                conflict.AttackWeapon().attachments.remove(card);
                            },
                            function(hero, conflict, card) {
                                return _.includes(conflict.AttackWeapon().attachments(), card);
                            },
                            [],
                            C$.ATTACKDICE,
                            '(deplete)')
                    ]
                },
                'Cards/WeaponAttachments/Overcharger.png'),
            new hf.Attachment({
                    name: 'Shock Emitter',
                    ranged: false,
                    trait: ['Impact'],
                    surges: [[s.stun()]],
                    operations: function() {
                        var op = new hf.Operation('Shock Emitter',
                            function(hero, conflict, card) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && _.includes(conflict.AttackWeapon().attachments(), card);
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        op.operationImages(['Other/Damage.png']);
                        return [op];
                    }()
                },
                'Cards/WeaponAttachments/Shock-emitter.png'),
            new hf.Attachment({
                    name: 'Spread Barrel',
                    ranged: true,
                    trait: ['Barrel'],
                    operations: function() {
                        var op = new hf.Operation('Spread Barrel',
                            function(hero, conflict, card) {
                                conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() &&
                                    conflict.requiredAccuracy() <= 3 &&
                                    _.includes(conflict.AttackWeapon().attachments(), card);
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        op.operationImages(['Other/Damage.png']);
                        return [op];
                    }()
                },
                'Cards/WeaponAttachments/Spread_Barrel.jpg'),
            new hf.Attachment({
                    name: 'Tactical Display',
                    ranged: true,
                    trait: ['Sights'],
                    operations: function() {
                        var op = new hf.Operation('Tactical Display',
                            function(hero, conflict, card) {
                                conflict.ExtraSurges(conflict.ExtraSurges() + 1);
                                card.exhausted(true);
                            },
                            function(hero, conflict, card) {
                                return !card.exhausted() && _.includes(conflict.AttackWeapon().attachments(), card);
                            },
                            [],
                            C$.ATTACKROLL,
                            '(exhaust)');
                        op.operationImages(['Other/Surge.png']);
                        return [op];
                    }()
                },
                'Cards/WeaponAttachments/Tactical_Display.jpg'),
            new hf.Attachment({
                    name: 'Telescoping Sights',
                    ranged: true,
                    trait: ['Sights'],
                    operations: [
                        new hf.Operation('Telescoping Sights',
                            function(hero, conflict, card) {
                                hero.focused(true);
                                hero.attack(null,
                                    null,
                                    true,
                                    function(weapon) {
                                        return _.includes(weapon.attachments(), card);
                                    });
                            },
                            function(hero, conflict, card) {
                                return hero.activated() && !hero.stunned();
                            },
                            [$.action(2)])
                    ]
                },
                'Cards/WeaponAttachments/Telescoping_Sights.jpg')
        ];
    });