const viewData = {
    id: 'sales-order-payment-generate',
    label: 'Generate Sales Order Payment',
    link: '/services/web/codbex-order-payment-ext/generate/SalesOrderPayment/generate-sales-order-payment.html',
    perspective: 'SalesOrder',
    view: 'SalesOrder',
    type: 'entity',
    order: 23
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}