define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'], function (hf, modal, $, d, s, $C) {
    return {
        Diala: [
            new hf.Weapon({
                name: 'Plasteel Staff',
                ranged: false,
                type: ['staff'],
                slots: 1,
                dice: [d.GREEN, d.YELLOW],
                reach: true,
                surges: [[s.stun()], [s.damage()]]
            }, 'Cards/Diala/Pic2444795.jpg'),
            new hf.Ability({ name: 'Force Adept' }, false, 'Cards/Diala/Pic2444785.jpg'),
            new hf.Ability({ name: 'Force Throw' }, false, 'Cards/Diala/Pic2444786.jpg'),
            new hf.Ability({ name: 'Battle Meditation' }, false, 'Cards/Diala/Pic2444787.jpg'),
            new hf.Ability({
                name: 'Defensive Stance',
                events: [
                    new hf.Event('Foresight', function (hero, conflict, card) {
                        conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                    }),
                    new hf.Event($C.DEFENCE_RESOLVED, function (hero, conflict, card) {
                        if (hero.suffered() === 0) {
                            hero.focused(true);
                        }
                    })
                ]
            }, false, 'Cards/Diala/Pic2444788.jpg'),
            new hf.Ability({
                name: 'Art of Movement',
                onAdd: function () {
                    this.extraSpeed(this.extraSpeed() + 1);
                }
            }, false, 'Cards/Diala/Pic2444789.jpg'),
            new hf.Ability({ name: 'Snap Kick' }, false, 'Cards/Diala/Pic2444790.jpg'),
            new hf.Ability({
                name: 'Dancing Weapon',
                operations: [
                    new hf.Operation('Dancing Weapon',
                    function (hero) {
                        hero.attack([d.BLUE()], [[s.accuracy(2), s.damage()]], true);
                    },
                    function (hero) {
                        return !hero.stunned();
                    },
                    [$.action(), $.strain()])
                ]
            }, false, 'Cards/Diala/Pic2444791.jpg'),
            new hf.Ability({ name: 'Way of the Sarlacc' }, false, 'Cards/Diala/Pic2444792.jpg'),
            function () {
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
                            new hf.Event($C.DEFENCE_RESOLVED,
                                function(hero, conflict, card) {
                                    modal.ShowInformation("Foresight + Shu Yen's Lightsaber: Attacker receives 1<img src='Other/Damage.png' />");
                                    foresightActivated = false;
                                })
                        ]
                    },
                    "Cards/Diala/Shu_Yen's_Lightsaber.png");
            }()
        ],
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
                        [], $C.DEFENCEROLL, '(exhaust)');
                    op.operationImages(['Other/Block.png']);
                    return [op];
                }()
            }, 'Cards/Wearables/Laminate_Armor.jpg'),
        ],
        Weapons: [
            new hf.Weapon({
                name: '434 Deathhammer',
                ranged: true,
                type: ['blaster', 'pistol'],
                slots: 1,
                dice: [d.BLUE, d.RED],
                events: [
                    new hf.Event($C.ATTACK_START, function (hero, conflict, card) {
                        if (conflict.AttackWeapon() === card) {
                            conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                        }
                    })
                ],
                surges: [[s.accuracy(2)], [s.damage()]]
            }, 'Cards/Weapons/434_Deathhammer.jpg'),
            new hf.Weapon({
                name: 'A280',
                ranged: true,
                type: ['blaster', 'rifle'],
                slots: 2,
                dice: [d.BLUE, d.GREEN],
                events: [
                    new hf.Event($C.ATTACK_START, function (hero, conflict, card) {
                        if (conflict.AttackWeapon() === card) {
                            conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 1);
                        }
                    })
                ],
                surges: [[s.damage(2)], [s.pierce(2)]]
            }, 'Cards/Weapons/A280.jpg'),
            new hf.Weapon({
                name: 'Armoured Gauntlets',
                ranged: false,
                type: ['fist'],
                slots: 0,
                dice: [d.GREEN, d.YELLOW],
                reach: false,
                surges: [[s.stun()], [s.damage(2)], [s.cleave()], [s.pierce()]]
            }, 'Cards/Weapons/Armored_Gauntlets.jpg'),
            new hf.Weapon({
                name: 'BD-1 Vibro-Ax',
                ranged: false,
                type: ['blade', 'staff'],
                slots: 2,
                dice: [d.RED, d.GREEN],
                reach: true,
                surges: [[s.damage(), s.bleed()], [s.cleave(2)]]
            }, 'Cards/Weapons/BD-1_Vibro-Ax.jpg'),
            new hf.Weapon({
                name: 'DH-17',
                ranged: true,
                type: ['blaster', 'pistol'],
                slots: 2,
                dice: [d.GREEN, d.YELLOW],
                surges: [[s.accuracy(2)], [s.damage(), s.pierce()]]
            }, 'Cards/Weapons/Dh-17.png'),
            new hf.Weapon({
                name: 'DL-44',
                ranged: true,
                type: ['blaster', 'pistol'],
                slots: 2,
                dice: [d.BLUE, d.YELLOW],
                surges: [[s.damage(2)], [s.damage(), s.accuracy(2)]]
            }, 'Cards/Weapons/Dl-44.png'),
            new hf.Weapon({
                name: 'DXR-6',
                ranged: true,
                type: ['blaster', 'rifle'],
                slots: 0,
                dice: [d.RED, d.RED],
                events: [
                    new hf.Event($C.ATTACK_START, function (hero, conflict, card) {
                        if (conflict.AttackWeapon() === card) {
                            conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 6);
                        }
                    })
                ],
                surges: [[s.damage(2)], [s.pierce(2)]]
            }, 'Cards/Weapons/DXR-6.jpg'),
            new hf.Weapon({
                name: 'E-11',
                ranged: true,
                type: ['blaster', 'rifle'],
                slots: 2,
                dice: [d.BLUE, d.GREEN],
                surges: [[s.damage(2)], [s.accuracy(2)]]
            }, 'Cards/Weapons/E-11.jpg'),
            new hf.Weapon({
                name: 'Force Pike',
                ranged: false,
                type: ['staff'],
                slots: 1,
                dice: [d.RED, d.YELLOW, d.YELLOW],
                reach: true,
                surges: [[s.damage()], [s.damage()], [s.stun()]]
            }, 'Cards/Weapons/Force-pike.png'),
            new hf.Weapon({
                name: 'Pulse Cannon',
                ranged: true,
                type: ['blaster', 'rifle'],
                slots: 1,
                dice: [d.BLUE, d.GREEN, d.YELLOW],
                surges: [[s.damage(2)], [s.pierce()], [s.accuracy(2)]]
            }, 'Cards/Weapons/Pulse_Cannon.jpg'),
            new hf.Weapon({
                name: 'Sporting Blaster',
                ranged: true,
                type: ['blaster', 'pistol'],
                slots: 1,
                dice: [d.BLUE, d.YELLOW, d.YELLOW],
                surges: [[s.stun()], [s.damage()], [s.pierce(2)], [s.accuracy(2)]]
            }, 'Cards/Weapons/Sporting-blaster.png'),
            new hf.Weapon({
                name: 'T-21',
                ranged: true,
                type: ['blaster', 'heavy'],
                slots: 0,
                dice: [d.GREEN, d.GREEN, d.YELLOW],
                surges: [[s.stun()], [s.pierce(2)], [s.accuracy(3)]]
            }, 'Cards/Weapons/T-21.jpg'),
            new hf.Weapon({
                name: 'Vibro Knucklers',
                ranged: false,
                type: ['fist', 'blade'],
                slots: 0,
                dice: [d.GREEN, d.YELLOW],
                reach: false,
                surges: [[s.cleave(2)], [s.damage(2)], [s.pierce(2), s.bleed()]]
            }, 'Cards/Weapons/Vibro_Knucklers.jpg'),
            new hf.Weapon({
                name: 'Vibro Blade',
                ranged: false,
                type: ['blade'],
                slots: 1,
                dice: [d.GREEN, d.GREEN],
                reach: false,
                surges: [[s.bleed()], [s.damage()], [s.cleave(2)]]
            }, 'Cards/Weapons/Vibroblade.jpg')
        ],
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
                        [], $C.DEFENCEROLL, '(exhaust)');
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
                        [], $C.ATTACKROLL, '(exhaust)');
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
                    new hf.Event($C.REST, function (hero, conflict, card) {
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