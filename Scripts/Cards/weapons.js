define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function (hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: '434 Deathhammer',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.BLUE, d.RED],
                    damage: 1,
                    surges: [[s.accuracy(2)], [s.damage()]]
                },
                'Cards/Weapons/434 Deathhammer.png'),
            new hf.Weapon({
                    name: 'A280',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 2,
                    dice: [d.BLUE, d.GREEN],
                    accuracy: 1,
                    surges: [[s.damage(2)], [s.pierce(2)]]
                },
                'Cards/Weapons/A280.png'),
            new hf.Weapon({
                    name: 'Armoured Gauntlets',
                    ranged: false,
                    type: ['fist'],
                    slots: 0,
                    dice: [d.GREEN, d.YELLOW],
                    reach: false,
                    surges: [[s.stun()], [s.damage(2)], [s.cleave()], [s.pierce()]]
                },
                'Cards/Weapons/Armoured Gauntlets.png'),
            new hf.Weapon({
                    name: 'BD-1 Vibro-Ax',
                    ranged: false,
                    type: ['blade', 'staff'],
                    slots: 2,
                    dice: [d.RED, d.GREEN],
                    reach: true,
                    surges: [[s.damage(), s.bleed()], [s.cleave(2)]]
                },
                'Cards/Weapons/BD-1 Vibro-Ax.png'),
            new hf.Weapon({
                    name: 'DH-17',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 2,
                    dice: [d.GREEN, d.YELLOW],
                    surges: [[s.accuracy(2)], [s.damage(), s.pierce()]]
                },
                'Cards/Weapons/DH-17.png'),
            new hf.Weapon({
                    name: 'DL-44',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 2,
                    dice: [d.BLUE, d.YELLOW],
                    surges: [[s.damage(2)], [s.accuracy(2), s.damage()]]
                },
                'Cards/Weapons/DL-44.png'),
            new hf.Weapon({
                    name: 'DXR-6',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 0,
                    dice: [d.RED, d.RED],
                    accuracy: 6,
                    surges: [[s.damage(2)], [s.pierce(2)]]
                },
                'Cards/Weapons/DXR-6.png'),
            new hf.Weapon({
                    name: 'E-11',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 2,
                    dice: [d.BLUE, d.GREEN],
                    surges: [[s.damage(2)], [s.accuracy(2)]]
                },
                'Cards/Weapons/E-11.png'),
            new hf.Weapon({
                    name: 'Force Pike',
                    ranged: false,
                    type: ['staff'],
                    slots: 1,
                    dice: [d.RED, d.YELLOW, d.YELLOW],
                    reach: true,
                    surges: [[s.damage()], [s.damage()], [s.stun()]]
                },
                'Cards/Weapons/Force Pike.png'),
            new hf.Weapon({
                    name: 'Pulse Cannon',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 1,
                    dice: [d.BLUE, d.GREEN, d.YELLOW],
                    surges: [[s.damage(2)], [s.pierce()], [s.accuracy(2)]]
                },
                'Cards/Weapons/Pulse Cannon.png'),
            new hf.Weapon({
                    name: 'Sporting Blaster',
                    ranged: true,
                    type: ['blaster', 'pistol'],
                    slots: 1,
                    dice: [d.BLUE, d.YELLOW, d.YELLOW],
                    surges: [[s.stun()], [s.damage()], [s.pierce(2)], [s.accuracy(2)]]
                },
                'Cards/Weapons/Sporting Blaster.png'),
            new hf.Weapon({
                    name: 'T-21',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 0,
                    dice: [d.GREEN, d.GREEN, d.YELLOW],
                    surges: [[s.stun()], [s.pierce(2)], [s.accuracy(3)]]
                },
                'Cards/Weapons/T-21.png'),
            new hf.Weapon({
                    name: 'Vibro Knucklers',
                    ranged: false,
                    type: ['fist', 'blade'],
                    slots: 0,
                    dice: [d.GREEN, d.YELLOW],
                    reach: false,
                    surges: [[s.cleave(2)], [s.damage(2)], [s.pierce(2), s.bleed()]]
                },
                'Cards/Weapons/Vibro Knucklers.png'),
            new hf.Weapon({
                    name: 'Vibro Blade',
                    ranged: false,
                    type: ['blade'],
                    slots: 1,
                    dice: [d.GREEN, d.GREEN],
                    reach: false,
                    surges: [[s.bleed()], [s.damage()], [s.cleave(2)]]
                },
                'Cards/Weapons/Vibroblade.png'),
            new hf.Weapon({
                    name: 'DLT-19',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 1,
                    dice: [d.BLUE, d.BLUE, d.GREEN],
                    surges: [[s.damage()], [s.damage()], { items: [s.focus()], cost: 2 }]
                },
                'Cards/Weapons/DLT-19.png'),
            new hf.Weapon({
                    name: 'EE-3 Carbine',
                    ranged: true,
                    type: ['blaster', 'rifle'],
                    slots: 2,
                    dice: [d.GREEN, d.GREEN],
                    accuracy: 2,
                    surges: [[s.damage(2)], [s.pierce()]]
                },
                'Cards/Weapons/EE-3 Carbine.png'),
            new hf.Weapon({
                    name: 'Gaffi Stick',
                    ranged: false,
                    type: ['club'],
                    slots: 1,
                    dice: [d.RED, d.YELLOW],
                    pierce: 1,
                    reach: false,
                    surges: [[s.weaken()]]
                },
                'Cards/Weapons/Gaffi Stick.png'),
            new hf.Weapon({
                    name: 'Tatooine Hunting Rifle',
                    ranged: true,
                    type: ['projectile', 'rifle'],
                    slots: 1,
                    dice: [d.BLUE, d.BLUE],
                    surges: [[s.damage()], [s.weaken()], { items: [s.focus()], cost: 2 }]
                },
                'Cards/Weapons/Tatooine Hunting Rifle.png')
        ];
    });