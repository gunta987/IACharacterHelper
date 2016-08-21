define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Armour({
                    name: 'Laminate Armour',
                    onAdd: function() {
                        this.extraHealth(this.extraHealth() + 3);
                    },
                    operations: function() {
                        var op = new hf.Operation('Laminate Armour',
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
                'Cards/Wearables/Laminate_Armor.jpg'),
        ];
    });