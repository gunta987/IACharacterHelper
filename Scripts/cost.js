define({
    action: function (count) {
        count = count || 1;
        return {
            required: function (hero) {
                return hero.actions() > (count - 1);
            },
            incur: function (hero) {
                hero.actions(hero.actions() - count);
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
            images: _.fill(Array(count), 'Tokens/Strain.png')
        }
    }
})