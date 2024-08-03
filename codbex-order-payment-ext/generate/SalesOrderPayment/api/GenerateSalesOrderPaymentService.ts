import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { Controller, Get } from "sdk/http";

@Controller
class GenerateSalesOrderPaymentService {

    private readonly salesOrderDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
    }

    @Get("/salesOrderData/:salesOrderId")
    public salesOrderData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        return {
            "Id": salesOrderId,
            "Number": salesOrder.Number,
            "Customer": salesOrder.Customer,
            "Currency": salesOrder.Currency,
            "Company": salesOrder.Company,
        };

    }
}