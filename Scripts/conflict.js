define(['ko', 'jquery', 'dice', 'lodash', 'constants', 'herofunctions'], function (ko, $, d, _, C$, hf) {
    return function () {
        var hero,
            self,

            attacking = ko.observableArray(false),
            weapon = ko.observable({}),
            myDice = ko.observableArray([]),
            opponentDice = ko.observableArray([]),
            attackDice = ko.pureComputed(function() {
                return attacking() ? myDice() : opponentDice();
            }),
            defenceDice = ko.pureComputed(function() {
                return attacking() ? opponentDice() : myDice();
            }),

            extraBlock = ko.observable(0),
            extraPierce = ko.observable(0),
            block = ko.pureComputed(function() {
                var block = _.reduce(defenceDice(), function(sum, die) { return sum + ((die.selectedFace() || {}).block || 0); }, 0) + extraBlock();
                var pierce = extraPierce();
                return Math.max(block - pierce, 0);
            }),

            requiredAccuracy = ko.observable(0),
            extraAccuracy = ko.observable(0),
            accuracy = ko.pureComputed(function() {
                return _.reduce(attackDice(), function(sum, die) { return sum + ((die.selectedFace() || {}).accuracy || 0); }, 0) + extraAccuracy();
            }),

            extraDamage = ko.observable(0),
            damage = ko.pureComputed(function() {
                if (_.some(defenceDice(), function(die) { return (die.selectedFace() || {}).dodge; })) {
                    return 0;
                }
                var damage = _.reduce(attackDice(), function(sum, die) { return sum + ((die.selectedFace() || {}).damage || 0); }, 0) + extraDamage();
                return accuracy() < requiredAccuracy() ? 0 : Math.max(damage - block(), 0);
            }),

            extraSurges = ko.observable(0),
            selectedSurges = ko.observableArray([]),
            extraEvade = ko.observable(0),
            surges = ko.computed(function() {
                if (_.some(defenceDice(), function(die) { return (die.selectedFace() || {}).dodge; })) {
                    return 0;
                }
                var surge = _.reduce(attackDice(), function(sum, die) { return sum + ((die.selectedFace() || {}).surge || 0); }, 0) + extraSurges();
                var evade = _.reduce(defenceDice(), function(sum, die) { return sum + ((die.selectedFace() || {}).evade || 0); }, 0);
                var surgeCount = Math.max(surge - evade - extraEvade(), 0);
                while (selectedSurges().length > surgeCount) {
                    var selectedSurge = selectedSurges.pop();
                    selectedSurge.deselect.performOperation(hero, self);
                }
                return surgeCount - selectedSurges().length;
            }),

            bleed = ko.observable(0),
            stun = ko.observable(0),
            strain = ko.observable(0),
            regainStrain = ko.observable(false),

            caption = ko.observable(''),
            conflictStage = ko.observable(C$.ATTACKRANGE),

            button1Text = ko.observable(''),
            button1 = function() {},
            canButton1 = function() { return true; },
            showButton1 = ko.pureComputed(function() {
                return button1Text().length > 0;
            }),
            button2Text = ko.observable(''),
            button2 = function() {},
            canButton2 = function() { return true; },
            showButton2 = ko.pureComputed(function() {
                return button2Text().length > 0;
            }),

            showModal = function() { $('#conflictSection').show(0, function() { $('.column').addClass('conflict'); }); },
            closeModal = function() {
                $('.conflict').removeClass('conflict');
                $('#conflictSection').hide();
            },

            attackSelection = [
                d.RED(),
                d.BLUE(),
                d.GREEN(),
                d.YELLOW()
            ],
            defenceSelection = [
                d.BLACK(),
                d.WHITE()
            ],

            usedAbilities = ko.observableArray([]),

            conflictComplete = function () {
                if (attacking()) {
                    //remove attachment added for ability surges
                    weapon().attachments.pop();
                    if (regainStrain()) {
                        hero.gainStrain(-1);
                    }
                    hero.event(C$.ATTACK_RESOLVED);
                } else {
                    var finalDamage = damage();
                    hero.gainDamage(finalDamage);
                    hero.gainStrain(strain());
                    if (finalDamage > 0 && bleed() > 0) hero.bleeding(true);
                    if (finalDamage > 0 && stun() > 0) hero.stunned(true);
                    hero.event(C$.DEFENCE_RESOLVED);
                }
                hero.inConflict(false);
                closeModal();
            },

            rollFinished = ko.pureComputed(function() {
                return _.every(myDice(), function(die) { return die.selectedFace() != null; }) &&
                    _.every(opponentDice(), function(die) { return die.selectedFace() != null; });
            }),

            rollDice = function(stage) {
                conflictStage(stage);
                caption('Roll all dice and record the results below');
                button1Text('Finish');
                button1 = function() {
                    conflictComplete();
                };
                canButton1 = function() {
                    return rollFinished();
                }
            },

            selectOpponentDice = function(stage, opponentNoun) {
                conflictStage(stage);
                caption('Select ' + opponentNoun + "'s dice (click to add to pool, click on die in pool to remove)");
                button1Text('Continue');
                button1 = function() {
                    rollDice(stage + 1);
                };
                canButton1 = function() {
                    return true;
                };
            },

            init = function() {
                showModal();
                hero.inConflict(true);
                extraPierce(0);
                extraDamage(0);
                extraAccuracy(0);
                selectedSurges([]);
                extraSurges(0);
                extraEvade(0);
                extraBlock(0);
                bleed(0);
                stun(0);
                strain(0);
                usedAbilities([]);
                regainStrain(false);
                opponentDice([]);
                requiredAccuracy(0);

                hero.suffered(0);
            },

            attackStart = function(h, ranged, dice, additional, wpn, abilitySurges) {
                self = this;
                hero = h;
                attacking(true);
                init();
                myDice(dice);
                //add an invisible attachment containing the ability surges, then remove it when conflict finished
                wpn.attachments.push(new hf.Attachment({ surges: abilitySurges }, null));
                weapon(wpn);
                extraPierce(additional.pierce);
                extraDamage(additional.damage);
                extraAccuracy(additional.accuracy);
                hero.event(C$.ATTACK_START);

                if (ranged) {
                    conflictStage(C$.ATTACKRANGE);
                    caption("Select target's range");
                    button1Text('Continue');
                    button1 = function() {
                        selectOpponentDice(C$.ATTACKDICE, 'target');
                    }
                    canButton1 = function() {
                        return requiredAccuracy() > 0;
                    }
                } else {
                    selectOpponentDice(C$.ATTACKDICE, 'target');
                }
            },

            defenceStart = function (h, ranged) {
                self = this;
                hero = h;
                attacking(false);
                init();
                myDice(hero.defence());
                weapon({});
                hero.event(C$.DEFENCE_START);
                
                if (ranged) {
                    conflictStage(C$.DEFENCERANGE);
                    caption("Select attacker's range");
                    button1Text('Continue');
                    button1 = function () {
                        selectOpponentDice(C$.DEFENCEDICE, 'attacker');
                    }
                    canButton1 = function () {
                        return requiredAccuracy() > 0;
                    }
                } else {
                    selectOpponentDice(C$.DEFENCEDICE, 'attacker');
                }
            };

        return {
            Stage: conflictStage,
            Attack: attackStart,
            Defend: defenceStart,
            AttackSelection: attackSelection,
            DefenceSelection: defenceSelection,
            addOpponentDie: function (die) {
                opponentDice.push(die.copy());
            },
            MyDice: myDice,
            AttackWeapon: weapon,
            ExtraPierce: extraPierce,
            ExtraDamage: extraDamage,
            ExtraAccuracy: extraAccuracy,
            ExtraSurges: extraSurges,
            MyAttack: {
                damage: damage,
                surges: surges,
                accuracy: accuracy,
                requiredAccuracy: requiredAccuracy,
                bleed: ko.pureComputed(function() { return bleed() > 0;}),
                stun: ko.pureComputed(function() { return stun() > 0;}),
                strain: regainStrain
            },
            SelectedSurges: selectedSurges,
            Bleed: bleed,
            Stun: stun,
            Strain: strain,
            RegainStrain: regainStrain,
            OpponentDice: opponentDice,
            ExtraBlock: extraBlock,
            ExtraEvade: extraEvade,
            caption: caption,
            requiredAccuracy: requiredAccuracy,
            button1Text: button1Text,
            button1: function () { if (canButton1()) { button1(); } },
            showButton1: showButton1,
            button2Text: button2Text,
            button2: function () { if (canButton2()) { button2(); } },
            showButton2: showButton2,
            UsedAbilities: usedAbilities,
            RollFinished: rollFinished
        };
    }();
});