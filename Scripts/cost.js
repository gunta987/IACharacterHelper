define(['tokens'],
    function(tokens) {
        return {
            action: function(count, specialAction) {
                count = count || 1;
                specialAction = specialAction || false;
                return {
                    required: function(hero, conflict, card) {
                        return hero.actions() > (count - 1) && (card == null || _.indexOf(hero.abilitiesUsedDuringActivation(), card.name) === -1);
                    },
                    incur: function(hero, conflict, card) {
                        hero.actions(hero.actions() - count);
                        if (hero.bleeding()) {
                            hero.gainStrain(1);
                        }
                        if (specialAction && card != null) {
                            hero.abilitiesUsedDuringActivation.push(card.name);
                        }
                    },
                    images: _.fill(Array(count), 'Other/Action.png')
                }
            },
            strain: function(count) {
                count = count || 1;
                return {
                    required: function(hero) {
                        return (hero.strain() + count) <= (hero.endurance + hero.extraEndurance());
                    },
                    incur: function(hero) {
                        hero.gainStrain(count);
                    },
                    images: _.fill(Array(count), 'Tokens/strain.png')
                }
            },
            deplete: function() {
                return {
                    required: function() { return true; },
                    incur: function(hero, conflict, card) {
                        hero.cards.splice(hero.cards.indexOf(card), 1);
                    },
                    images: []
                }
            },
            deviceToken: function() {
                return {
                    required: function(hero) {
                        return _.findIndex(hero.tokens(), function(token) { return token instanceof tokens.Device; }) !== -1;
                    },
                    incur: function(hero) {
                        var index = _.findIndex(hero.tokens(), function(token) { return token instanceof tokens.Device; });
                        hero.tokens.splice(index, 1);
                    },
                    images: ['Tokens/device.png']
                }
            }
        }
    });