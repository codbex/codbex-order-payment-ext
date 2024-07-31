const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    const salesOrderDataUrl = "/services/ts/codbex-order-payment-ext/generate/CustomerPayment/api/GenerateCustomerPaymentService.ts/salesOrderData/" + params.id;
    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    const salesOrderItemsUrl = "/services/ts/codbex-order-payment-ext/generate/CustomerPayment/api/GenerateCustomerPaymentService.ts/salesOrderItemsData/" + params.id;
    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        });

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

    // if (Object.keys(params).length) {

    //     console.log(params);

    //     $scope.entity = params.entity;
    //     $scope.optionsPaymentMethod = params.optionsPaymentMethod;
    // }


    // $scope.generateInvoice = function () {
    //     const invoiceUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceService.ts/";

    //     $http.post(invoiceUrl, $scope.SalesOrderData)
    //         .then(function (response) {
    //             $scope.Invoice = response.data
    //             if (!angular.equals($scope.OrderItems, {})) {
    //                 $scope.SalesOrderItemsData.forEach(orderItem => {
    //                     const salesInvoiceItem = {
    //                         "SalesInvoice": $scope.Invoice.Id,
    //                         "Product": orderItem.Product,
    //                         "Quantity": orderItem.Quantity,
    //                         "UoM": orderItem.UoM,
    //                         "Price": orderItem.Price,
    //                         "Net": orderItem.Net,
    //                         "VAT": orderItem.VAT,
    //                         "Gross": orderItem.Gross
    //                     };
    //                     let invoiceItemUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceItemService.ts/"
    //                     $http.post(invoiceItemUrl, salesInvoiceItem);
    //                 });
    //             }

    //             console.log("Invoice created successfully: ", response.data);
    //             //alert("Invoice created successfully");
    //             $scope.closeDialog();
    //         })
    //         .catch(function (error) {
    //             console.error("Error creating invoice: ", error);
    //             //alert("Error creating sales invoice");
    //             $scope.closeDialog();
    //         });
    // };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);