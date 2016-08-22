define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Ability({
                    name: 'Adrenal Stim',
                    operations: [
                    ]
                },
                false,
                'Cards/Supply/Adrenal_Stim.jpg'),
            new hf.Ability({
                    name: 'Bacta Infusion',
                    operations: [
                    ]
                },
                false,
                'Cards/Supply/Bacta_Infusion.jpg'),
            new hf.Ability({
                    name: 'C22 Frag Grenade',
                    operations: [
                    ]
                },
                false,
                'Cards/Supply/C22_Frag_Grenade.jpg'),
            new hf.Ability({
                    name: 'Emergency Medpack',
                    operations: [
                    ]
                },
                false,
                'Cards/Supply/Emergency_Medpack.jpg'),
            new hf.Ability({
                    name: 'Shock Grenade',
                    operations: [
                    ]
                },
                false,
                'Cards/Supply/Shock_Grenade.jpg')
        ];
    });