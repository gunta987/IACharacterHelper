define({
    action: function (count) {
        count = count || 1;
        return {
            required: function (hero) {
                return hero.actions() > (count - 1);
            },
            incur: function (hero) {
                hero.actions(hero.actions() - count);
                if (hero.bleeding()) {
                    hero.gainStrain(1);
                }
            },
            images: _.fill(Array(count), 'Other/Action.png')
        }
    },
    strain: function (count) {
        count = count || 1;
        return {
            required: function (hero) {
                return (hero.strain() + count) <= (hero.endurance + hero.extraEndurance());
            },
            incur: function (hero) {
                hero.gainStrain(count);
            },
            images: _.fill(Array(count), 'Tokens/strain.png')
        }
    },
    block: function() {
        return {
            required: function(hero, conflict) {
                return conflict.Block() > 0;
            },
            incur: function(hero, conflict) {
                conflict.ExtraBlock(conflict.ExtraBlock() - 1);
            },
            images: ['Other/Block.png']
    }}
})