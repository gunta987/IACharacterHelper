define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function (hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: '434 Deathhammer',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.BLUE, d.RED],
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict, card) {
                                if (conflict.AttackWeapon() === card) {
                                    conflict.ExtraDamage(conflict.ExtraDamage() + 1);
                                }
                            })
                    ],
                    surges: [[s.accuracy(2)], [s.damage()]]
                },
                'Cards/Weapons/434_Deathhammer.jpg'),
            new hf.Weapon({
                    name: 'A280',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 2,
                    dice: [d.BLUE, d.GREEN],
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict, card) {
                                if (conflict.AttackWeapon() === card) {
                                    conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 1);
                                }
                            })
                    ],
                    surges: [[s.damage(2)], [s.pierce(2)]]
                },
                'Cards/Weapons/A280.jpg'),
            new hf.Weapon({
                    name: 'Armoured Gauntlets',
                    ranged: false,
                    type: ['fist'],
                    slots: 0,
                    dice: [d.GREEN, d.YELLOW],
                    reach: false,
                    surges: [[s.stun()], [s.damage(2)], [s.cleave()], [s.pierce()]]
                },
                'Cards/Weapons/Armored_Gauntlets.jpg'),
            new hf.Weapon({
                    name: 'BD-1 Vibro-Ax',
                    ranged: false,
                    type: ['blade', 'staff'],
                    slots: 2,
                    dice: [d.RED, d.GREEN],
                    reach: true,
                    surges: [[s.damage(), s.bleed()], [s.cleave(2)]]
                },
                'Cards/Weapons/BD-1_Vibro-Ax.jpg'),
            new hf.Weapon({
                    name: 'DH-17',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 2,
                    dice: [d.GREEN, d.YELLOW],
                    surges: [[s.accuracy(2)], [s.damage(), s.pierce()]]
                },
                'Cards/Weapons/Dh-17.png'),
            new hf.Weapon({
                    name: 'DL-44',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 2,
                    dice: [d.BLUE, d.YELLOW],
                    surges: [[s.damage(2)], [s.accuracy(2), s.damage()]]
                },
                'Cards/Weapons/Dl-44.png'),
            new hf.Weapon({
                    name: 'DXR-6',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 0,
                    dice: [d.RED, d.RED],
                    events: [
                        new hf.Event(C$.ATTACK_START,
                            function(hero, conflict, card) {
                                if (conflict.AttackWeapon() === card) {
                                    conflict.ExtraAccuracy(conflict.ExtraAccuracy() + 6);
                                }
                            })
                    ],
                    surges: [[s.damage(2)], [s.pierce(2)]]
                },
                'Cards/Weapons/DXR-6.jpg'),
            new hf.Weapon({
                    name: 'E-11',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 2,
                    dice: [d.BLUE, d.GREEN],
                    surges: [[s.damage(2)], [s.accuracy(2)]]
                },
                'Cards/Weapons/E-11.jpg'),
            new hf.Weapon({
                    name: 'Force Pike',
                    ranged: false,
                    type: ['staff'],
                    slots: 1,
                    dice: [d.RED, d.YELLOW, d.YELLOW],
                    reach: true,
                    surges: [[s.damage()], [s.damage()], [s.stun()]]
                },
                'Cards/Weapons/Force-pike.png'),
            new hf.Weapon({
                    name: 'Pulse Cannon',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 1,
                    dice: [d.BLUE, d.GREEN, d.YELLOW],
                    surges: [[s.damage(2)], [s.pierce()], [s.accuracy(2)]]
                },
                'Cards/Weapons/Pulse_Cannon.jpg'),
            new hf.Weapon({
                    name: 'Sporting Blaster',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.BLUE, d.YELLOW, d.YELLOW],
                    surges: [[s.stun()], [s.damage()], [s.pierce(2)], [s.accuracy(2)]]
                },
                'Cards/Weapons/Sporting-blaster.png'),
            new hf.Weapon({
                    name: 'T-21',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 0,
                    dice: [d.GREEN, d.GREEN, d.YELLOW],
                    surges: [[s.stun()], [s.pierce(2)], [s.accuracy(3)]]
                },
                'Cards/Weapons/T-21.jpg'),
            new hf.Weapon({
                    name: 'Vibro Knucklers',
                    ranged: false,
                    type: ['fist', 'blade'],
                    slots: 0,
                    dice: [d.GREEN, d.YELLOW],
                    reach: false,
                    surges: [[s.cleave(2)], [s.damage(2)], [s.pierce(2), s.bleed()]]
                },
                'Cards/Weapons/Vibro_Knucklers.jpg'),
            new hf.Weapon({
                    name: 'Vibro Blade',
                    ranged: false,
                    type: ['blade'],
                    slots: 1,
                    dice: [d.GREEN, d.GREEN],
                    reach: false,
                    surges: [[s.bleed()], [s.damage()], [s.cleave(2)]]
                },
                'Cards/Weapons/Vibroblade.jpg')
        ];
    });