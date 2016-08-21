define(['Cards/diala', 'Cards/jyn', 'Cards/weapons', 'herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'], function (diala, jyn, weapons, hf, modal, $, d, s, C$) {
    return {
        Diala: diala,
        Jyn: jyn,
        Armour: [
            new hf.Armour({
                name: 'Laminate Armour',
                onAdd: function () {
                    this.extraHealth(this.extraHealth() + 3);
                },
                operations: function () {
                    var op = new hf.Operation('Laminate Armour',
                        function (hero, conflict, card) {
                            conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            card.exhausted(true);
                        },
                        function (hero, conflict, card) {
                            return !card.exhausted();
                        },
                        [], C$.DEFENCEROLL, '(exhaust)');
                    op.operationImages(['Other/Block.png']);
                    return [op];
                }()
            }, 'Cards/Wearables/Laminate_Armor.jpg'),
        ],
        Weapons: weapons,
        Attachments: [
            new hf.Attachment({
                name: 'High-Impact Guard',
                ranged: false,
                trait: ['Impact'],
                surges: [[s.damage(2)]],
                operations: function () {
                    var op = new hf.Operation('High-Impact Guard',
                        function (hero, conflict, card) {
                            conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            card.exhausted(true);
                        },
                        function (hero, conflict, card) {
                            return !card.exhausted();
                        },
                        [], C$.DEFENCEROLL, '(exhaust)');
                    op.operationImages(['Other/Block.png']);
                    return [op];
                }()
            }, 'Cards/WeaponAttachments/High-Impact_Guard.jpg'),
            new hf.Attachment({
                name: 'Shock Emitter',
                ranged: false,
                trait: ['Impact'],
                surges: [[s.stun()]],
                operations: function () {
                    var op = new hf.Operation('Shock Emitter',
                        function (hero, conflict, card) {
                            conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                            card.exhausted(true);
                        },
                        function (hero, conflict, card) {
                            return !card.exhausted() && _.includes(conflict.AttackWeapon().attachments(), card);
                        },
                        [], C$.ATTACKROLL, '(exhaust)');
                    op.operationImages(['Other/Damage.png']);
                    return [op];
                }()
            }, 'Cards/WeaponAttachments/Shock-emitter.png'),
            new hf.Attachment({
                name: 'Extended Haft',
                trait: ['Balance'],
                pierce: function (weapon) { return weapon.reach ? 1 : 0; }
            }, 'Cards/WeaponAttachments/Extended_Haft.jpg')
        ],
        Equipment: [
            new hf.Equipment({
                name: 'Adrenal Implant',
                events: [
                    new hf.Event(C$.REST, function (hero, conflict, card) {
                        if (!card.exhausted() && !hero.focused()) {
                            modal.ConfirmOperation("Do you wish to exhaust Adrenal Implant to gain <img src='Tokens/Focus.png' />?", function () {
                                hero.focused(true);
                                card.exhausted(true);
                            });
                        }
                    })
                ]
            }, 'Cards/Wearables/Adrenal_Implant.png')
        ]
    }
});