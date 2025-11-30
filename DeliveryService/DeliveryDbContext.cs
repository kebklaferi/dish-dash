using Microsoft.EntityFrameworkCore;

namespace DeliveryService;

public class DeliveryDbContext : DbContext
{
    public DeliveryDbContext(DbContextOptions<DeliveryDbContext>  options) 
     : base(options) { }
    public DbSet<Models.Delivery> Deliveries {get; set;}
    public DbSet<Models.Driver> Drivers {get; set;}
}