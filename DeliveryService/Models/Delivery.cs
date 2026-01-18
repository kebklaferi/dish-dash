namespace DeliveryService.Models;

public class Delivery
{
    public int id { get; set; }
    public string order_id { get; set; } = string.Empty;
    public string addres { get; set; } = string.Empty;
    public DateTime delivery_date { get; set; }
    public string status { get; set; } = string.Empty;
    public int? driver_id { get; set; }
}