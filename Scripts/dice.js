define(['ko'], function (ko) {
    var Die = function (colour, faces, invert) {
        var self = this;
        self.colour = colour;
        self.faces = faces;
        self.invert = invert || false;
        self.showSelection = ko.observable(false);
        self.selectedFace = ko.observable(null);
        self.blank = 'Dice/' + colour + '.png';
    };
    var AttackDie = function (colour, faces, invert) {
        var self = this;
        Die.call(self, colour, faces, invert);
        self.getFace = function (selected) {
            if (selected == null) {
                return 'Dice/blank.png';
            }
            return 'Dice/' + (selected.damage != null ? selected.damage + 'd' : '') +
                (selected.surge != null ? selected.surge + 's' : '') +
                (selected.accuracy != null ? selected.accuracy : '') + '.png';
        }
        self.faceImage = ko.pureComputed(function() {
            return self.getFace(self.selectedFace());
        });
        self.copy = function () { return new AttackDie(colour, faces, invert); };
    };
    AttackDie.prototype = Object.create(Die.prototype);
    var DefenceDie = function (colour, faces, invert) {
        var self = this;
        Die.call(self, colour, faces, invert);
        self.getFace = function (selected) {
            if (selected == null || (selected.dodge == null && selected.evade == null && selected.block == null)) {
                return 'Dice/blank.png';
            }
            if (selected.dodge != null) {
                return "Dice/dodge.png";
            }
            return 'Dice/' + (selected.block != null ? selected.block + 'b' : '') +
                (selected.evade != null ? selected.evade + 'e' : '') + '.png';
        };
        self.faceImage = ko.pureComputed(function() {
            return self.getFace(self.selectedFace());
        });
        self.copy = function () { return new DefenceDie(colour, faces, invert); };
    };
    DefenceDie.prototype = Object.create(Die.prototype);

    return {
        SortOrder: function(colour) {
            switch (colour) {
            case 'blue':
                return 1;
            case 'red':
                return 2;
            case 'green':
                return 3;
            case 'yellow':
                return 4;
            default:
                return 5;
            }
        },
        RED: function() {
            return new AttackDie('red',
                [
                    { damage: 1 },
                    { damage: 2 },
                    { damage: 2 },
                    { damage: 2, surge: 1 },
                    { damage: 3 },
                    { damage: 3 }
                ],
                true);
        },
        BLUE: function() {
            return new AttackDie('blue',
                [
                    { surge: 1, accuracy: 2 },
                    { damage: 1, accuracy: 2 },
                    { damage: 2, accuracy: 3 },
                    { damage: 1, surge: 1, accuracy: 3 },
                    { damage: 2, accuracy: 4 },
                    { damage: 1, accuracy: 5 }
                ],
                true);
        },
        GREEN: function() {
            return new AttackDie('green',
                [
                    { surge: 1, accuracy: 1 },
                    { damage: 1, surge: 1, accuracy: 1 },
                    { damage: 2, accuracy: 1 },
                    { damage: 1, surge: 1, accuracy: 2 },
                    { damage: 2, accuracy: 2 },
                    { damage: 2, accuracy: 3 }
                ],
                true);
        },
        YELLOW: function() {
            return new AttackDie('yellow',
            [
                { surge: 1 },
                { damage: 1, surge: 2 },
                { damage: 2, accuracy: 1 },
                { damage: 1, surge: 1, accuracy: 1 },
                { surge: 1, accuracy: 2 },
                { damage: 1, accuracy: 2 }
            ]);
        },
        BLACK: function() {
            return new DefenceDie('black',
                [
                    { block: 1 },
                    { block: 1 },
                    { block: 2 },
                    { block: 2 },
                    { block: 3 },
                    { evade: 1 }
                ],
                true);
        },
        WHITE: function() {
            return new DefenceDie('white',
            [
                {},
                { block: 1 },
                { evade: 1 },
                { block: 1, evade: 1 },
                { block: 1, evade: 1 },
                { dodge: true }
            ]);
        }
    };
});