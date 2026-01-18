using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DeliveryService;

public class DeliveryDbContext : DbContext
{
    public DeliveryDbContext(DbContextOptions<DeliveryDbContext>  options) 
     : base(options) { }
    public DbSet<Models.Delivery> Deliveries {get; set;}
    public DbSet<Models.Driver> Drivers {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Models.Driver>()
            .Property(d => d.id)
            .ValueGeneratedOnAdd();
    }
    
    public class DeliveryDbContextFactory : IDesignTimeDbContextFactory<DeliveryDbContext>
    {
        public DeliveryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DeliveryDbContext>();
            
            optionsBuilder.UseNpgsql("Host=postgres-delivery;Port=5432;Database=deliverydb;Username=deliveryuser;Password=deliverypassword;");
        
            return new DeliveryDbContext(optionsBuilder.Options);
        }
            
    }
}