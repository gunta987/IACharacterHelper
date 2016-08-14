define(['jquery', 'ko'], function ($, ko) {
    return function () {
        var text = ko.observable('');
        var okButtonText = ko.observable('Yes');
        var closeModal = function () { $('.disabled').removeClass('disabled'); $('.modal').hide(); };
        var onOk = function() {};
        var okButton = function () {
            closeModal();
            onOk();
        };
        var cancelButtonText = ko.observable('No');
        var cancelButton = function () { closeModal(); };

        var showModal = function () { $('.modal').show(0, function () { $('.column').addClass('disabled'); }); };
        var ConfirmOperation = function (confirmText, action) {
            text(confirmText);
            okButtonText('Yes');
            cancelButtonText('No');
            onOk = action;
            showModal();
        };

        return {
            text: text,
            okButtonText: okButtonText,
            okButton: okButton,
            onOk: function (action) { onOk = action; },
            cancelButtonText: cancelButtonText,
            cancelButton: cancelButton,
            setCancelFunction: function (action) { onCancel = action; },
            ConfirmOperation: ConfirmOperation
        }
    }();
})