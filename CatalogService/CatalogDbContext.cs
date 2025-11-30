using Microsoft.EntityFrameworkCore;

namespace CatalogService;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options)
        : base(options) {}
    
    public DbSet<Models.MenuItems> MenuItems => Set<Models.MenuItems>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.MenuItems>().HasIndex(i => i.restaurant_id);
    }
}