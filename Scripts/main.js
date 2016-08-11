requirejs.config({
    paths: {
        jquery: 'jquery-3.1.0',
        ko: 'knockout-3.4.0'
    }
});

require(['jquery', 'ko', 'lodash', 'heroes', 'cards', 'modal'], function ($, ko, _, heroes, cards, modal) {
    $(document).ready(function () {

        var myViewModel = {
            hero: heroes[0],
            modal: modal
        };
        //TODO: populate via user
        _.forEach(cards.Diala, myViewModel.hero.AddCard);
        _.forEach(cards.Wearables, myViewModel.hero.AddCard);
        _.forEach(cards.Weapons, myViewModel.hero.AddCard);
        _.forEach(cards.Equipment, myViewModel.hero.AddCard);

        //set max height on operations container so that window scrollbar doesn't show
        var onCharacterCardLoaded = function () { $('#operationsContainer').css('max-height', ($(window).height() * 0.99 - $('#operationsContainer').offset().top)); };
        $("#characterCard").one("load", function () {
            onCharacterCardLoaded()
        }).each(function () {
            if (this.complete) {
                //loaded from cache
                onCharacterCardLoaded();
            }
        });

        ko.applyBindings(myViewModel);
    });
})
