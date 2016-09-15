define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Repeating Blaster',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 1,
                    dice: [d.BLUE, d.RED],
                    surges: [[s.accuracy()]]
                },
                'Cards/Biv/Repeating Blaster.png'),
            new hf.Ability({
                    name: 'Advance'
                },
                false,
                'Cards/Biv/Advance.png'),
            new hf.Ability({
                    name: 'Shake It Off'
                },
                false,
                'Cards/Biv/Shake It Off.png'),
            new hf.Ability({
                    name: 'Crushing Blow'
                },
                false,
                'Cards/Biv/Crushing Blow.png'),
            new hf.Ability({
                    name: 'Into the Fray'
                },
                false,
                'Cards/Biv/Into the Fray.png'),
            new hf.Armour({
                    name: 'Trophy Armour'
                },
                'Cards/Biv/Trophy Armour.png'),
            new hf.Attachment({
                    name: 'Vibrobayonet',
                    ranged: true,
                    trait: ['Blade']
                },
                'Cards/Biv/Vibrobayonet.png'),
            new hf.Ability({
                    name: 'Final Stand'
                },
                false,
                'Cards/Biv/Final Stand.png'),
            new hf.Ability({
                    name: 'Stay Down'
                },
                false,
                'Cards/Biv/Stay Down.png'),
            new hf.Ability({
                    name: 'Hunt Them Down'
                },
                false,
                'Cards/Biv/Hunt Them Down.png')
        ];
    });