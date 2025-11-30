namespace DeliveryService.Models;

public class Driver
{
    public int id { get; set; }
    public string name { get; set; } = string.Empty;
    public bool occupied { get; set; }
}