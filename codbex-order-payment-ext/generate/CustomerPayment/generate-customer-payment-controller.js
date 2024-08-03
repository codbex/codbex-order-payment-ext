const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";
    const salesOrderDataUrl = "/services/ts/codbex-order-payment-ext/generate/CustomerPayment/api/GenerateCustomerPaymentService.ts/salesOrderData/" + params.id;
    const customerUrl = "/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts/";
    const customerPaymentUrl = "/services/ts/codbex-payments/gen/codbex-payments/api/CustomerPayment/CustomerPaymentService.ts/";
    const salesOrderPaymentUrl = "/services/ts/codbex-orders/gen/codbex-orders/api/SalesOrder/SalesOrderPaymentService.ts/";
    const companyUrl = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts/";

    $http.get(paymentMethodsUrl)
        .then(function (response) {
            let paymenMethodOptions = response.data;

            $scope.optionsPaymentMethod = paymenMethodOptions.map(function (value) {
                return {
                    value: value.Id,
                    text: value.Name
                };
            });
        });

    $scope.create = function () {

        const paymentDate = $scope.entity.Date;
        const paymentMethod = $scope.entity.PaymentMethod;
        const paymentAmount = $scope.entity.Amount;
        const paymentValor = $scope.entity.Valor;
        const counterpartyIBAN = $scope.entity.CounterpartyIBAN;
        const counterpartyName = $scope.entity.CounterpartyName;
        const paymentDescription = $scope.entity.Description;

        $http.get(salesOrderDataUrl)
            .then(function (response) {
                let salesOrder = response.data;

                $http.get(customerUrl + salesOrder.Customer)
                    .then(function (response) {

                        const customerName = response.data.Name;

                        $http.get(companyUrl + salesOrder.Company)
                            .then(function (response) {

                                console.log(response.data.IBAN);

                                const companyIban = response.data.IBAN;

                                const customerPayment = {
                                    "Date": paymentDate,
                                    "Valor": paymentValor,
                                    "Amount": paymentAmount,
                                    "Currency": salesOrder.Currency,
                                    "Company": salesOrder.Company,
                                    "PaymentMethod": paymentMethod,
                                    "Name": customerName,
                                    "CompanyIBAN": companyIban,
                                    "CounterpartyIBAN": counterpartyIBAN,
                                    "CounterpartyName": counterpartyName,
                                    "Description": paymentDescription,
                                    "Reason": salesOrder.Number,
                                };

                                $http.post(customerPaymentUrl, customerPayment)
                                    .then(function (response) {

                                        const salesOrderPayment = {
                                            "Amount": paymentAmount,
                                            "CustomerPayment": response.data.Id,
                                            "SalesOrder": salesOrder.Id,
                                        }

                                        $http.post(salesOrderPaymentUrl, salesOrderPayment)
                                            .then(function (response) {
                                                $scope.closeDialog();
                                            }).catch(function (error) {
                                                console.error("Error creating Customer Payment", error);
                                                $scope.closeDialog();
                                            });

                                    })
                                    .catch(function (error) {
                                        console.error("Error creating Customer Payment", error);
                                        $scope.closeDialog();
                                    });
                            });
                    });

                messageHub.showAlertSuccess("CustomerPayment", "CustomerPayment successfully created");
            });
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("customer-payment-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);