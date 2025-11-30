namespace DeliveryService.Models;

public class AssignDelivery
{
    public int order_id { get; set; }
    public string address { get; set; } = string.Empty;
}