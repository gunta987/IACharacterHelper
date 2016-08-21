define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Equipment({
                    name: 'Adrenal Implant',
                    events: [
                        new hf.Event(C$.REST,
                            function(hero, conflict, card) {
                                if (!card.exhausted() && !hero.focused()) {
                                    modal.ConfirmOperation("Do you wish to exhaust Adrenal Implant to gain <img src='Tokens/Focus.png' />?",
                                        function() {
                                            hero.focused(true);
                                            card.exhausted(true);
                                        });
                                }
                            })
                    ]
                },
                'Cards/Wearables/Adrenal_Implant.png')
        ];
    });