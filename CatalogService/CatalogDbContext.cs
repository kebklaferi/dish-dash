using Microsoft.EntityFrameworkCore;

namespace CatalogService;

public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options)
        : base(options) {}
    
    public DbSet<Models.MenuItems> MenuItems => Set<Models.MenuItems>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.MenuItems>()
            .Property(e => e.restaurant_id)
            .HasColumnType("text"); // allow storing 24\-char IDs as text
    }
}