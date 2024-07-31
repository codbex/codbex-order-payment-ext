const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";
    $http.get(paymentMethodsUrl)
        .then(function (response) {
            let paymenMethodOptions = response.data;

            let newPaymentOptions = [];

            paymenMethodOptions.forEach(function (value) {
                let option = {
                    value: value.Id,
                    text: value.Name
                }

                newPaymentOptions.push(option);
            });

            $scope.optionsPaymentMethod = newPaymentOptions;

        });

    const salesOrderDataUrl = "/services/ts/codbex-order-payment-ext/generate/CustomerPayment/api/GenerateCustomerPaymentService.ts/salesOrderData/" + params.id;
    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    $scope.create = function () {

        const paymentDate = $scope.entity.Date;
        const paymentMethod = $scope.entity.PaymentMethod;
        const paymentAmount = $scope.entity.Amount;

        $http.get(salesOrderDataUrl)
            .then(function (response) {
                let salesOrder = response.data;

                const customerPayment = {
                    "Date": paymentDate,
                    "Amount": paymentAmount,
                    "Currency": salesOrder.Currency,
                    "Company": salesOrder.Company,
                    "PaymentMethod": paymentMethod,
                    // "Name": salesOrder.Customer.Name,
                    "Reference": salesOrder.Reference
                };

                console.log(customerPayment);

            });

        messageHub.showAlertSuccess("CustomerPayment", "CustomerPayment successfully created");
    };

    // make cancel()


    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);