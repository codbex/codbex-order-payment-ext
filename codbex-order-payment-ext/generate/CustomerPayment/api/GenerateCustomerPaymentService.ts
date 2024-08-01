import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CustomerPaymentRepository as CustomerPaymentDao } from "codbex-payments/gen/codbex-payments/dao/CustomerPayment/CustomerPaymentRepository";

import { Controller, Get, Post, response } from "sdk/http";

@Controller
class GenerateSalesInvoiceService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;
    private readonly customerPaymentDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
        this.customerPaymentDao = new CustomerPaymentDao();
    }

    @Get("/salesOrderData/:salesOrderId")
    public salesOrderData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        return {
            "Number": salesOrder.Number,
            "Date": salesOrder.Date,
            "Due": salesOrder.Due,
            "Customer": salesOrder.Customer,
            "Net": salesOrder.Net,
            "Currency": salesOrder.Currency,
            "Gross": salesOrder.Gross,
            "Discount": salesOrder.Discount,
            "Taxes": salesOrder.Taxes,
            "VAT": salesOrder.VAT,
            "Total": salesOrder.Total,
            "Conditions": salesOrder.Conditions,
            "PaymentMethod": salesOrder.PaymentMethod,
            "SentMethod": salesOrder.SentMethod,
            "Company": salesOrder.Company,
            "SalesInvoiceStatus": 1,
            "Operator": salesOrder.Operator,
            "Reference": salesOrder.UUID
        };
    }

    @Get("/salesOrderItemsData/:salesOrderId")
    public salesOrderItemsData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        let salesOrderItems = this.salesOrderItemDao.findAll({
            $filter: {
                equals: {
                    SalesOrder: salesOrder.Id
                }
            }
        });

        return salesOrderItems;
    }

    // @Post("/customerPayment")
    // addCustomerPayment(body: any, ctx: any) {
    //     console.log("hi controller");

    //     try {
    //         ["Date", "Valor", "Amount", "Company", "Currency", "PaymentMethod", "Name", "Reference"].forEach(elem => {
    //             if (!body.hasOwnProperty(elem)) {
    //                 console.log("missing property")
    //                 response.setStatus(response.BAD_REQUEST);
    //                 return;
    //             }
    //         })

    //         const newCustomerPayment = this.customerPaymentDao.create(body);

    //         if (!newCustomerPayment) {
    //             throw new Error("Failed to create Customer Payment");
    //         }

    //         response.setStatus(response.CREATED);
    //     }

    //     catch (e) {
    //         response.setStatus(response.BAD_REQUEST);
    //         return
    //     }
    // }
}