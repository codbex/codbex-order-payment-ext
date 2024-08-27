const app = angular.module('templateApp', ['ideUI', 'ideView']);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.paymentEntity = {};
    $scope.invoiceEntity = {};
    $scope.forms = {
        details: {},
    };

    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";
    const salesOrderDataUrl = "/services/ts/codbex-order-payment-ext/generate/SalesOrderPayment/api/GenerateSalesOrderPaymentService.ts/salesOrderData/" + params.id;
    const customerUrl = "/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts/";
    const customerPaymentUrl = "/services/ts/codbex-payments/gen/codbex-payments/api/CustomerPayment/CustomerPaymentService.ts/";
    const salesOrderPaymentUrl = "/services/ts/codbex-orders/gen/codbex-orders/api/SalesOrder/SalesOrderPaymentService.ts/";
    const companyUrl = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts/";
    const salesOrderDataInvoiceUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + params.id;
    const salesOrderItemsInvoiceUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + params.id;

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

    $http.get(salesOrderDataInvoiceUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    $http.get(salesOrderItemsInvoiceUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        });


    $scope.create = function () {

        const paymentDate = $scope.paymentEntity.Date;
        const paymentMethod = $scope.paymentEntity.PaymentMethod;
        const paymentAmount = $scope.paymentEntity.Amount;
        const paymentValor = $scope.paymentEntity.Valor;
        const counterpartyIBAN = $scope.paymentEntity.CounterpartyIBAN;
        const counterpartyName = $scope.paymentEntity.CounterpartyName;
        const paymentDescription = $scope.paymentEntity.Description;

        $http.get(salesOrderDataUrl)
            .then(function (response) {
                let salesOrder = response.data;

                $http.get(customerUrl + salesOrder.Customer)
                    .then(function (response) {

                        const customerName = response.data.Name;

                        $http.get(companyUrl + salesOrder.Company)
                            .then(function (response) {

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
                                                console.error("Error creating Sales Order Payment", error);
                                                $scope.closeDialog();
                                            });

                                        if ($scope.invoiceEntity.salesInvoice) {
                                            generateInvoice(paymentAmount, response.data.Id);
                                        }

                                    })
                                    .catch(function (error) {
                                        console.error("Error creating Sales Order Payment", error);
                                        $scope.closeDialog();
                                    });
                            });
                    });

                messageHub.showAlertSuccess("SalesOrderPayment", "Sales order Payment successfully created");
            });
    };



    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-order-payment-generate");
    };

    function generateInvoice(paymentAmount, idPayment) {

        const invoiceUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceService.ts/";
        const invoiceItemUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceItemService.ts/"

        let invoiceData = $scope.SalesOrderData;
        invoiceData.Date = new Date();

        if ($scope.invoiceEntity.fullInvoice) {
            invoiceData.SalesInvoiceType = 1;
        } else if ($scope.invoiceEntity.advanceInvoice) {
            invoiceData.SalesInvoiceType = 3;
        } else if ($scope.invoiceEntity.partialInvoice) {
            invoiceData.SalesInvoiceType = 2;
        }

        $http.post(invoiceUrl, invoiceData)
            .then(function (response) {
                $scope.Invoice = response.data;
                if (!angular.equals($scope.OrderItems, {})) {
                    $scope.SalesOrderItemsData.forEach(orderItem => {

                        const salesInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Product": orderItem.Product,
                            "Quantity": orderItem.Quantity,
                            "UoM": orderItem.UoM,
                            "Price": orderItem.Price,
                            "Net": orderItem.Net,
                            "VAT": orderItem.VAT,
                            "Gross": orderItem.Gross
                        };
                        $http.post(invoiceItemUrl, salesInvoiceItem);
                    });
                }

                generateInvoicePayment(paymentAmount, idPayment, response.data.Id);

                console.log("Invoice created successfully: ", response.data);
                //alert("Invoice created successfully");
            })
            .catch(function (error) {
                console.error("Error creating invoice: ", error);
                //alert("Error creating sales invoice");
                $scope.closeDialog();
            });
    };

    function generateInvoicePayment(paymentAmount, idPayment, idInvoice) {

        const salesInvoicePaymentUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoicePaymentService.ts/";

        const salesInvoicePayment = {
            "Amount": paymentAmount,
            "CustomerPayment": idPayment,
            "SalesInvoice": idInvoice,
        }

        $http.post(salesInvoicePaymentUrl, salesInvoicePayment)
            .then(function (response) {
                $scope.closeDialog();
            }).catch(function (error) {
                console.error("Error creating Sales Invoice Payment", error);
                $scope.closeDialog();
            });

    }


    document.getElementById("dialog").style.display = "block";
}]);