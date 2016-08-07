requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'lodash', 'heroes', 'cards'], function ($, ko, _, heroes, cards) {
    $(document).ready(function () {

        var myViewModel = {
            hero: heroes[0]
        };
        //TODO: populate via user
        _.forEach(cards.Diala, myViewModel.hero.AddCard);
        _.forEach(cards.Wearables, myViewModel.hero.AddCard);
        _.forEach(cards.Weapons, myViewModel.hero.AddCard);

        ko.applyBindings(myViewModel);
    });
})
