define(function() {
    function Token(image) {
        this.image = image;
    }

    var deviceToken = function() {
        Token.call(this, 'Tokens/device.png');
    }
    deviceToken.prototype = Object.create(Token.prototype);

    return {
        Device: deviceToken
    };
});