namespace DeliveryService.Models;

public class Delivery
{
    public int id { get; set; }
    public int order_id { get; set; }
    public string addres { get; set; } = string.Empty;
    public DateTime delivery_date { get; set; }
    public string status { get; set; } = string.Empty;
    public int? driver_id { get; set; }
}