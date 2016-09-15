define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Weapon({
                    name: 'Modified Blaster',
                    ranged: true,
                    type: ['blaster', 'heavy'],
                    slots: 1,
                    dice: [d.BLUE, d.RED],
                    surges: [[s.accuracy()]]
                },
                'Cards/Saska/Modified Blaster.png'),
            new hf.Ability({
                    name: 'Tool Kit'
                },
                false,
                'Cards/Saska/Tool Kit.png'),
            new hf.Ability({
                    name: 'Unstable Device'
                },
                false,
                'Cards/Saska/Unstable Device.png'),
            new hf.Ability({
                    name: 'Energy Shield'
                },
                false,
                'Cards/Saska/Energy Shield.png'),
            new hf.Ability({
                    name: 'Structural Weakness'
                },
                false,
                'Cards/Saska/Structural Weakness.png'),
            new hf.Ability({
                    name: 'Gadgeteer'
                },
                false,
                'Cards/Saska/Gadgeteer.png'),
            new hf.Ability({
                    name: 'Power Converter'
                },
                false,
                'Cards/Saska/Power Converter.png'),
            new hf.Ability({
                    name: 'Adrenaline Injector'
                },
                false,
                'Cards/Saska/Adrenaline Injector.png'),
            new hf.Ability({
                    name: 'Remote Distribution'
                },
                false,
                'Cards/Saska/Remote Distribution.png'),
            new hf.Equipment({
                    name: 'Tech Goggles'
                },
                'Cards/Saska/Tech Goggles.png')
        ];
    });