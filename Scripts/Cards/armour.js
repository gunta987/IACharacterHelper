﻿define(['herofunctions', 'modal', 'cost', 'dice', 'surge', 'constants'],
    function(hf, modal, $, d, s, C$) {
        return [
            new hf.Armour({
                    name: 'Combat Coat',
                    onAdd: function () {
                        this.extraHealth(this.extraHealth() + 2);
                    },
                    operations: function () {
                        var op = new hf.Operation('Combat Coat',
                            function (hero, conflict, card) {
                                conflict.ExtraEvade(conflict.ExtraEvade() - 1);
                                conflict.ExtraBlock(conflict.ExtraBlock() + 1);
                            },
                            function (hero, conflict, card) {
                                return conflict.Evade() >= 1;
                            },
                            [],
                            C$.DEFENCEROLL,
                            "(-1<img src='Other/Evade.png' />)");
                        op.operationImages(['Other/Block.png']);
                        return [op];
                    }()
                },
                'Cards/Wearables/Combat Coat.png'),
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
                'Cards/Wearables/Laminate Armour.png')
        ];
    });