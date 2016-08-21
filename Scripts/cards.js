define(['Cards/diala', 'Cards/jyn', 'Cards/weapons', 'Cards/attachments', 'Cards/armour', 'Cards/equipment'],
    function(diala, jyn, weapons, attachments, armour, equipment) {
        return {
            Diala: diala,
            Jyn: jyn,
            Armour: armour,
            Weapons: weapons,
            Attachments: attachments,
            Equipment: equipment
        }
    });