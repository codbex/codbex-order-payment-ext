const viewData = {
    id: 'customer-payment-generate',
    label: 'Generate Customer Payment',
    link: '/services/web/codbex-order-payment-ext/generate/CustomerPayment/generate-customer-payment.html',
    perspective: 'CustomerPayment',
    view: 'CustomerPayment',
    type: 'entity',
    order: 23
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}