define(function () {
    var card = function (properties, image) {
        var self = this;
        self.name = properties.name || '';
        self.image = image;
        self.onAdd = properties.onAdd;
    };
    var ability = function (properties, isCore, image) {
        card.call(this, properties, image);
        this.isCoreAbility = isCore;
    };
    ability.prototype = Object.create(card.prototype);
    var armour = function (properties, image) {
        card.call(this, properties, image);
    };
    armour.prototype = Object.create(card.prototype);
    var weapon = function (properties, image) {
        card.call(this, properties, image);
    };
    weapon.prototype = Object.create(card.prototype);

    return {
        Action: function () {
            self.performAction = function (hero) {

            };
        },
        Card: card,
        Ability: ability,
        Armour: armour,
        Weapon: weapon
    };
});